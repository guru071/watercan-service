import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DeliveriesService } from './deliveries.service';
import { Logger } from '@nestjs/common';

@Processor('deliveries')
export class DeliveriesProcessor extends WorkerHost {
  private readonly logger = new Logger(DeliveriesProcessor.name);

  constructor(private readonly deliveriesService: DeliveriesService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'generate-schedules':
        await this.deliveriesService.generateSchedulesForOrder(job.data.orderId);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }

    return {};
  }
}
