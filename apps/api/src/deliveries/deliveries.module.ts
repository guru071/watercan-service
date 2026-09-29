import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesProcessor } from './deliveries.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'deliveries',
    }),
  ],
  providers: [DeliveriesService, DeliveriesProcessor],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
