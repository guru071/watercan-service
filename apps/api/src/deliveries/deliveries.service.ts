import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { DeliveryStatus } from '@prisma/client';

@Injectable()
export class DeliveriesService {
  private readonly logger = new Logger(DeliveriesService.name);

  constructor(private prisma: DatabaseService) {}

  async generateSchedulesForOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true, // Ensuring it's paid
      },
    });

    if (!order) throw new Error('Order not found');

    const schedules = [];
    const startDate = new Date(order.startDate);

    // Generate exactly N schedules for N durationDays
    for (let i = 0; i < order.durationDays; i++) {
      const deliveryDate = new Date(startDate);
      deliveryDate.setDate(startDate.getDate() + i);

      schedules.push({
        orderId: order.id,
        deliveryDate,
        scheduledCans: order.cansPerDay,
        deliveredCans: 0,
        status: DeliveryStatus.PENDING,
      });
    }

    await this.prisma.deliverySchedule.createMany({
      data: schedules,
    });

    this.logger.log(`Generated ${schedules.length} delivery schedules for Order: ${order.id}`);
  }

  async markDelivered(scheduleId: string, deliveredCans: number, agentId: string) {
    // Transaction to update schedule and log audit
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.deliverySchedule.update({
        where: { id: scheduleId },
        data: {
          deliveredCans,
          status: deliveredCans > 0 ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED,
          deliveredAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: agentId,
          actorRole: 'DELIVERY_AGENT',
          action: 'MARK_DELIVERY',
          entity: 'DeliverySchedule',
          entityId: schedule.id,
          metadata: { deliveredCans },
        },
      });

      return schedule;
    });
  }
}
