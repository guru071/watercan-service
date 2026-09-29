import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(RazorpayService.name);

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });
  }

  async createOrder(amount: number, receipt: string) {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // convert to paise
        currency: 'INR',
        receipt,
      });
      return order;
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error);
      throw new BadRequestException('Payment gateway error');
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    const generated = crypto
      .createHmac('sha256', secret)
      .update(orderId + '|' + paymentId)
      .digest('hex');
    
    return generated === signature;
  }

  verifyWebhookSignature(body: any, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';
    const generated = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
      
    return generated === signature;
  }
}
