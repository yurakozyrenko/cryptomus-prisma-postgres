import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Payment, Payout } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { instance } from 'src/axios';
import { PaymentStatus } from 'src/common/enums';
import { UsersService } from 'src/users/users.service';
import { Cron } from '@nestjs/schedule';
import { AppErrors } from 'src/common/errors';
import { CreatePaymentDto, CreatePayoutDto } from './dto';

@Injectable()
export class CryptomusService {
  private readonly merchantId: '';
  private readonly paymentApiKey: '';
  private readonly payoutApiKey: '';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    this.paymentApiKey = this.configService.get('cryptomus_api');
    this.merchantId = this.configService.get('cryptomus_merchant');
    this.payoutApiKey = this.configService.get('cryptomus_payout_api');
  }

  public async createPayment(user: User, dto: CreatePaymentDto) {
    try {
      const payload = {
        amount: dto.amount.toString(),
        currency: dto.currency,
        order_id: uuidv4(),
      };
      const header = this.cryptoHeader(JSON.stringify(payload), this.paymentApiKey);

      const { data } = await instance.post('/v1/payment', payload, {
        headers: {
          'Content-Type': 'application/json',
          merchant: header.merchant,
          sign: header.sign,
        },
      });

      console.log(data);

      await this.prisma.payment.create({
        data: {
          userId: user.id,
          orderId: data.result.orderId,
          uuid: data.result.uuid,
          amount: Number(data.result.amount),
          currency: data.result.currency,
          isFinal: data.result.is_final,
          status: data.result.status,
          paymentUrl: data.result.url,
        },
      });
      return data.result;
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async createPayout(user: User, dto: CreatePayoutDto) {
    try {
      const currentUser = await this.userService.getPublicUser(user.email);

      if (currentUser.wallet < dto.amount) return new ConflictException(AppErrors.INSUFFICIENT_FUNDS_ON_THE_ACCOUNT);

      const payload = {
        amount: String(dto.amount),
        currency: dto.currency,
        network: 'tron',
        order_id: uuidv4(),
        address: dto.address,
        is_subtract: '0',
      };

      const header = this.cryptoHeader(JSON.stringify(payload), this.payoutApiKey);

      const { data } = await instance.post('/v1/payout', payload, {
        headers: {
          'Content-Type': 'application/json',
          merchant: header.merchant,
          sign: header.sign,
        },
      });

      return this.prisma.payout.create({
        data: {
          userId: currentUser.id,
          orderId: data.result.orderId,
          uuid: data.result.uuid,
          amount: Number(data.result.amount),
          address: data.result.address,
          status: data.result.status,
          isFinal: data.result.is_final,
          currency: data.result.currency,
          network: data.result.network,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Cron('45 * * * * *')
  private async checkPayment(): Promise<void> {
    try {
      const payments: Payment[] = await this.prisma.payment.findMany();

      for (const payment of payments) {
        const payload = {
          orderId: payment.orderId,
        };
        const header = this.cryptoHeader(JSON.stringify(payload), this.paymentApiKey);

        const { data } = await instance.post('/v1/payment/info', payload, {
          headers: {
            'Content-Type': 'application/json',
            merchant: header.merchant,
            sign: header.sign,
          },
        });

        if (
          data.result.status === PaymentStatus.CANCEL ||
          data.result.status === PaymentStatus.SYSTEM_FAIL ||
          data.result.status === PaymentStatus.FAIL
        ) {
          await this.prisma.failedPayment.create({
            data: {
              userId: payment.userId,
              orderId: payment.orderId,
              uuid: payment.uuid,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
            },
          });

          await this.prisma.payment.delete({
            where: { id: payment.id },
          });

          if (
            data.result.status === PaymentStatus.PAID ||
            data.result.status === PaymentStatus.PAID_OVER ||
            data.result.status === PaymentStatus.WRONG_AMOUNT ||
            data.result.status === PaymentStatus.WRONG_AMOUNT_WAITING
          ) {
            const user = await this.userService.getUserById(payment.userId);

            const walletAmount = user.wallet + Number(data.result.amount);

            await this.userService.updateWallet(walletAmount, payment.userId);

            await this.prisma.successPayment.create({
              data: {
                userId: payment.userId,
                orderId: payment.orderId,
                uuid: payment.uuid,
                amount: Number(data.result.amount),
                currency: data.result.currency,
                status: data.result.status,
                address: data.result.address,
                network: data.result.network,
              },
            });
            await this.prisma.payment.delete({
              where: { id: payment.id },
            });
          }
        }
      }
      Logger.log('Check payment is success');
    } catch (error) {
      throw new Error(error);
    }
  }

  @Cron('45 * * * * *')
  private async checkPayout(): Promise<Payout> {
    try {
      const payouts: Payout[] = await this.prisma.payout.findMany();

      for (const payout of payouts) {
        const payload = {
          uuid: payout.uuid,
        };
        const header = this.cryptoHeader(JSON.stringify(payload), this.payoutApiKey);

        const { data } = await instance.post('/v1/payout/info', payload, {
          headers: {
            'Content-Type': 'application/json',
            merchant: header.merchant,
            sign: header.sign,
          },
        });

        if (
          data.result.status === PaymentStatus.CANCEL ||
          data.result.status === PaymentStatus.SYSTEM_FAIL ||
          data.result.status === PaymentStatus.FAIL
        ) {
          await this.prisma.failedPayout.create({
            data: {
              userId: payout.userId,
              orderId: payout.orderId,
              uuid: payout.uuid,
              amount: payout.amount,
              network: payout.currency,
              status: data.result.status,
              address: payout.address,
            },
          });

          return this.prisma.payout.delete({
            where: { id: payout.id },
          });
        }

        if (data.result.status === PaymentStatus.PAID) {
          await this.prisma.successfulPayout.create({
            data: {
              userId: payout.userId,
              orderId: payout.orderId,
              uuid: payout.uuid,
              amount: payout.amount,
              currency: payout.currency,
              status: data.result.status,
              address: payout.address,
              network: payout.network,
            },
          });
          return this.prisma.payout.delete({
            where: { id: payout.id },
          });
        }
      }
      Logger.log('Check payout is success');
    } catch (error) {
      throw new Error(error);
    }
  }

  private cryptoHeader(payload: string, api_key) {
    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(payload).toString('base64') + api_key)
      .digest('hex');
    return {
      merchant: this.merchantId,
      sign,
    };
  }
}
