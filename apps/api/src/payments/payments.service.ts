import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RazorpayService } from '../razorpay/razorpay.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: DatabaseService,
    private razorpayService: RazorpayService,
    @InjectQueue('deliveries') private deliveriesQueue: Queue
  ) {}

  async initiatePayment(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new BadRequestException('Order not found');
    if (order.status !== OrderStatus.CALCULATED && order.status !== OrderStatus.PAYMENT_FAILED) {
      throw new BadRequestException('Invalid order status for payment');
    }

    const rzpOrder = await this.razorpayService.createOrder(
      Number(order.grandTotal),
      order.id,
    );

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAYMENT_PENDING,
        razorpayOrderId: rzpOrder.id,
      },
    });

    return {
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: order.grandTotal,
      currency: 'INR',
    };
  }

  async handleWebhook(body: any, signature: string) {
    const isValid = this.razorpayService.verifyWebhookSignature(body, signature);
    if (!isValid) throw new BadRequestException('Invalid webhook signature');

    const event = body.event;
    
    // Idempotency check
    const existing = await this.prisma.paymentAttempt.findUnique({
      where: { razorpayEventId: body.id },
    });
    if (existing) {
      this.logger.log(`Webhook already processed: ${body.id}`);
      return { success: true, message: 'Already processed' };
    }

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      
      const internalOrder = await this.prisma.order.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (!internalOrder) {
        this.logger.error(`Order not found for Razorpay Order ID: ${orderId}`);
        return { success: false };
      }

      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            orderId: internalOrder.id,
            amount: Number(paymentEntity.amount) / 100,
            currency: paymentEntity.currency,
            status: PaymentStatus.CAPTURED,
            method: paymentEntity.method,
            razorpayPaymentId: paymentEntity.id,
            razorpayOrderId: orderId,
            capturedAt: new Date(),
          },
        });

        await tx.paymentAttempt.create({
          data: {
            paymentId: payment.id,
            razorpayEventId: body.id,
            status: event,
            payload: body,
          },
        });

        await tx.order.update({
          where: { id: internalOrder.id },
          data: { status: OrderStatus.CONFIRMED },
        });

        await tx.auditLog.create({
          data: {
            actorId: 'SYSTEM',
            actorRole: 'SUPER_ADMIN',
            action: 'ORDER_CONFIRMED',
            entity: 'Order',
            entityId: internalOrder.id,
          },
        });
      });

      // FIRE BULLMQ BACKGROUND JOB
      await this.deliveriesQueue.add('generate-schedules', {
        orderId: internalOrder.id,
      });
    }

    return { success: true };
  }
}
