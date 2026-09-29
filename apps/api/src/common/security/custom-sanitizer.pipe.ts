import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomSanitizerPipe implements PipeTransform {
  
  // Custom Regex to block basic SQL injections, XSS scripts, and null bytes
  private readonly BLOCKED_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // <script> tags
    /javascript:/gi, // javascript: handlers
    /onload=/gi, /onerror=/gi, /onclick=/gi, /onmouseover=/gi, // inline events
    /\x00/g, // Null bytes
    /union\s+select/gi, /drop\s+table/gi, /--/g, // Basic SQLi patterns
  ];

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) return value;

    this.sanitizeObject(value);
    
    return value;
  }

  private sanitizeObject(obj: any) {
    if (typeof obj === 'string') {
      this.checkString(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach((item) => this.sanitizeObject(item));
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          // Check for malicious patterns and strip them or throw error
          this.checkString(obj[key]);
          
          // Basic stripping of HTML tags manually
          obj[key] = obj[key].replace(/<[^>]*>?/gm, ''); 
        } else if (typeof obj[key] === 'object') {
          this.sanitizeObject(obj[key]);
        }
      }
    }
  }

  private checkString(val: string) {
    for (const pattern of this.BLOCKED_PATTERNS) {
      if (pattern.test(val)) {
        throw new BadRequestException('Malicious payload detected by Custom Firewall');
      }
    }
  }
}
