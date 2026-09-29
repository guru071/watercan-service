import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CustomSecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Strict Transport Security (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // 2. Content Security Policy (CSP)
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.razorpay.com; frame-ancestors 'none'; upgrade-insecure-requests;");
    
    // 3. X-Frame-Options (Clickjacking protection)
    res.setHeader('X-Frame-Options', 'DENY');
    
    // 4. X-Content-Type-Options (MIME-Sniffing protection)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // 5. X-XSS-Protection (Legacy XSS protection)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // 6. Remove Server/Framework Identifiers
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'Classified');

    // 7. Cache Control for API routes
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    next();
  }
}
