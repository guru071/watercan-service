import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { PricingService } from '../pricing/pricing.service';
import { PlanType, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: DatabaseService,
    private pricingService: PricingService,
  ) {}

  async calculateQuote(cansPerDay: number, durationDays: number) {
    const pricing = await this.pricingService.getCurrentPricing();
    if (!pricing) {
      throw new BadRequestException('Pricing configuration not found');
    }

    const totalCans = cansPerDay * durationDays;
    const canPrice = Number(pricing.canPrice);
    const deliveryFee = Number(pricing.deliveryFee);
    
    const waterCharge = totalCans * canPrice;
    const grandTotal = waterCharge + deliveryFee;

    return {
      cansPerDay,
      durationDays,
      totalCans,
      canPrice,
      deliveryFee,
      waterCharge,
      grandTotal,
      pricingId: pricing.id,
    };
  }

  async createOrder(
    customerProfileId: string,
    addressId: string,
    planType: PlanType,
    cansPerDay: number,
    durationDays: number,
    startDate: Date,
    preferredDeliveryTime?: string,
  ) {
    const quote = await this.calculateQuote(cansPerDay, durationDays);

    return this.prisma.order.create({
      data: {
        customerProfileId,
        addressId,
        planType,
        cansPerDay,
        durationDays,
        totalCans: quote.totalCans,
        startDate: new Date(startDate),
        preferredDeliveryTime,
        canPriceAtPurchase: quote.canPrice,
        deliveryFeeAtPurchase: quote.deliveryFee,
        waterCharge: quote.waterCharge,
        grandTotal: quote.grandTotal,
        status: OrderStatus.CALCULATED,
      },
    });
  }
}
