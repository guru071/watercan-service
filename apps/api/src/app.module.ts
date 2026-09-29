import { Module } from '@nestjs/common';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PricingModule } from './pricing/pricing.module';
import { PlansModule } from './plans/plans.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { RazorpayModule } from './razorpay/razorpay.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module'; // Import newly created JobsModule

// Custom 1000% Security Code
import { SecurityModule } from './common/security/security.module';
import { CustomRateLimiterGuard } from './common/security/custom-rate-limiter.guard';
import { CustomSanitizerPipe } from './common/security/custom-sanitizer.pipe';

@Module({
  imports: [
    SecurityModule, // Applies Custom Headers & CSRF Middlewares
    
    // Background Jobs Queue (Redis)
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    
    DatabaseModule,
    AuthModule,
    UsersModule,
    PricingModule,
    PlansModule,
    OrdersModule,
    PaymentsModule,
    RazorpayModule,
    DeliveriesModule,
    ReportsModule,
    AdminModule,
    JobsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: CustomRateLimiterGuard },
    { provide: APP_PIPE, useClass: CustomSanitizerPipe }
  ],
})
export class AppModule {}
