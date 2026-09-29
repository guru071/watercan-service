import { Controller, Get, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/guards/roles.decorator';
import { Role } from '@prisma/client';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliveriesController {
  constructor(private readonly prisma: DatabaseService) {}

  @Get('today')
  @Roles(Role.DELIVERY_AGENT, Role.ADMIN)
  async getTodaysDeliveries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.deliverySchedule.findMany({
      where: {
        deliveryDate: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        order: {
          include: {
            customerProfile: true,
            address: true
          }
        }
      }
    });
  }

  @Put(':id')
  @Roles(Role.DELIVERY_AGENT, Role.ADMIN)
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any
  ) {
    return this.prisma.$transaction(async (tx) => {
      const schedule = await tx.deliverySchedule.update({
        where: { id },
        data: {
          status: body.status,
          deliveredCans: body.deliveredCans || 0,
          deliveredAt: body.status === 'DELIVERED' ? new Date() : null,
          deliveryAgentId: req.user.userId,
        }
      });

      await tx.auditLog.create({
        data: {
          entityName: 'DeliverySchedule',
          entityId: id,
          action: 'STATUS_UPDATE',
          performedById: req.user.userId,
          details: { newStatus: body.status, deliveredCans: body.deliveredCans }
        }
      });

      return schedule;
    });
  }
}
