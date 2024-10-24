import { IsNumber, IsString } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  address: string;

  @IsString()
  currency: string;

  @IsNumber()
  amount: number;
}

export class CreatePaymentDto {
  @IsString()
  currency: string;

  @IsNumber()
  amount: number;
}
