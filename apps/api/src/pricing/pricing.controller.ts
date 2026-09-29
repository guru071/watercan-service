import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('current')
  async getCurrent() {
    return this.pricingService.getCurrentPricing();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async updatePricing(@Body() body: any, @Request() req: any) {
    return this.pricingService.updatePricing(
      body.canPrice,
      body.deliveryFee,
      req.user.userId,
    );
  }
}
