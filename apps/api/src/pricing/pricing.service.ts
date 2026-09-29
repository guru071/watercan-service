import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PricingService {
  constructor(private prisma: DatabaseService) {}

  async getCurrentPricing() {
    return this.prisma.pricingConfig.findFirst({
      where: { isActive: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async updatePricing(canPrice: number, deliveryFee: number, adminUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.pricingConfig.findFirst({
        where: { isActive: true },
      });

      if (current) {
        // Deactivate current
        await tx.pricingConfig.update({
          where: { id: current.id },
          data: { isActive: false },
        });

        // Save history
        await tx.pricingHistory.create({
          data: {
            canPrice: current.canPrice,
            deliveryFee: current.deliveryFee,
            effectiveFrom: current.effectiveFrom,
            effectiveTo: new Date(),
            changedBy: adminUserId,
          },
        });
      }

      // Create new active config
      const newPricing = await tx.pricingConfig.create({
        data: {
          canPrice,
          deliveryFee,
          effectiveFrom: new Date(),
          isActive: true,
          createdBy: adminUserId,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          actorRole: 'ADMIN',
          action: 'UPDATE_PRICING',
          entity: 'PricingConfig',
          entityId: newPricing.id,
          metadata: { canPrice, deliveryFee },
        },
      });

      return newPricing;
    });
  }
}
