import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api/v1');
  
  // Custom CORS Logic
  const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
  app.enableCors({
    origin: (origin, callback) => {
      // Hardened custom check
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by Custom CORS Policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization, x-razorpay-signature',
  });
  
  // Parse cookies for HTTP-Only Refresh Tokens
  app.use(cookieParser());
  
  // Standard DTO validation runs AFTER our custom SanitizerPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              
      forbidNonWhitelisted: true,   
      transform: true,              
      forbidUnknownValues: true,    
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
