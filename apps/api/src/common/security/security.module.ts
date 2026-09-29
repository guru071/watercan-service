import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { CustomSecurityHeadersMiddleware } from './custom-security-headers.middleware';
import { CustomCsrfMiddleware } from './custom-csrf.middleware';

@Module({})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomSecurityHeadersMiddleware, CustomCsrfMiddleware)
      .forRoutes('*');
  }
}
