import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DatabaseService } from '../database/database.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly prisma: DatabaseService
  ) {}

  @Post()
  async createOrder(@Body() body: any, @Req() req: any) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId: req.user.userId },
    });
    
    if (!profile) throw new BadRequestException('Profile not found');

    // In reality, addressId would come from the body. Using a default or requiring it.
    // Assuming body.addressId is provided. If not, this will fail in DB constraint.
    return this.ordersService.createOrder(
      profile.id,
      body.addressId,
      body.planType,
      body.cansPerDay,
      body.durationDays,
      body.startDate,
      body.preferredDeliveryTime
    );
  }

  @Post('quote')
  async getQuote(@Body() body: any) {
    return this.ordersService.calculateQuote(body.cansPerDay, body.durationDays);
  }

  @Get('subscriptions')
  async getSubscriptions(@Req() req: any) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) return [];

    return this.prisma.order.findMany({
      where: {
        customerProfileId: profile.id,
        planType: { in: ['WEEKLY', 'MONTHLY'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get()
  async getAllOrders() {
    // Used by Admin dashboard
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        customerProfile: true,
      }
    });
  }
}
