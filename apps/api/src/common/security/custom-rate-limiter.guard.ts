import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';
// Note: In a real app we would inject Redis here. For this custom implementation, we use an in-memory map.
// To make it production-ready across multiple instances, it should be backed by Redis.

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable()
export class CustomRateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(CustomRateLimiterGuard.name);
  
  // Custom in-memory store (IP -> RateLimitInfo)
  private readonly hits = new Map<string, RateLimitInfo>();
  
  private readonly LIMIT = 100; // max requests
  private readonly WINDOW_MS = 60 * 1000; // 1 minute

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = this.hits.get(ip);

    if (!record) {
      // First hit
      this.hits.set(ip, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }

    // If window has passed, reset the counter
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.WINDOW_MS;
      this.hits.set(ip, record);
      return true;
    }

    // Inside window
    record.count++;
    this.hits.set(ip, record);

    if (record.count > this.LIMIT) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      throw new HttpException(
        'Too Many Requests. Custom Rate Limiter triggered.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
