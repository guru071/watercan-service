import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RazorpayModule } from '../razorpay/razorpay.module';

@Module({
  imports: [
    RazorpayModule,
    BullModule.registerQueue({
      name: 'deliveries',
    }),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
