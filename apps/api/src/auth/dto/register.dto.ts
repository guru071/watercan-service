import { IsEmail, IsString, IsEnum, MinLength, IsOptional, Matches } from 'class-validator';
import { CustomerType } from '@prisma/client';
import * as sanitizeHtml from 'sanitize-html';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{10,15}$/, { message: 'Mobile must be a valid phone number' })
  mobile: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  fullName: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  // Optional fields for ORGANIZATION / INDUSTRY
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  organizationName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  companyName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, { message: 'Invalid GSTIN format' })
  gstin?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  contactPerson?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  designation?: string;
  
  @IsOptional()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value))
  industryType?: string;
}
