import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CryptomusService } from './cryptomus.service';
import { JWTAuthGuard } from 'src/guards/jwt-guard';
import { CreatePaymentDto, CreatePayoutDto } from './dto';

@Controller('cryptomus')
export class CryptomusController {
  constructor(private readonly cryptomusService: CryptomusService) {}

  @UseGuards(JWTAuthGuard)
  @Post('create-payment')
  createPayment(@Body() dto: CreatePaymentDto, @Req() request) {
    const user = request.user;
    return this.cryptomusService.createPayment(user, dto);
  }

  @UseGuards(JWTAuthGuard)
  @Post('create-payout')
  createPayout(@Body() dto: CreatePayoutDto, @Req() request) {
    const user = request.user;
    return this.cryptomusService.createPayout(user, dto);
  }

  @Post('test')
  test() {
    return;
  }
}
