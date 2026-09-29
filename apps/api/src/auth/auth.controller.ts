import { Controller, Post, Get, Body, HttpCode, HttpStatus, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { DatabaseService } from '../database/database.service';
import { CustomerType, Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly prisma: DatabaseService
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.login(body.email, body.password);
    
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'] || req.body.refreshToken;
    const tokens = await this.authService.refreshTokens(refreshToken);
    
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken: tokens.accessToken };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const passwordHash = await this.authService.hashPassword(body.password);
    
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: body.email,
          mobile: body.mobile,
          passwordHash,
          role: Role.CUSTOMER,
        },
      });

      const profile = await tx.customerProfile.create({
        data: {
          userId: user.id,
          fullName: body.fullName,
          customerType: body.customerType,
        },
      });

      if (body.customerType === 'ORGANIZATION' || body.customerType === 'INDUSTRY') {
        await tx.organization.create({
          data: {
            customerProfileId: profile.id,
            name: body.organizationName || body.companyName || '',
            gstin: body.gstin,
            contactPerson: body.contactPerson || '',
            designation: body.designation,
            industryType: body.industryType,
          },
        });
      }

      return { success: true, message: 'Registration successful' };
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user.userId;
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        organization: true
      }
    });
    return profile;
  }
}
