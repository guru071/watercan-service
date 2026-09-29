import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly prisma: DatabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleFailedDeliveries() {
    this.logger.log('Running nightly cleanup for PENDING deliveries...');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    const result = await this.prisma.deliverySchedule.updateMany({
      where: {
        status: 'PENDING',
        deliveryDate: { lte: yesterday },
      },
      data: {
        status: 'FAILED',
        deliveredCans: 0,
      },
    });

    this.logger.log(`Marked ${result.count} stale deliveries as FAILED.`);
  }
}
