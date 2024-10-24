import { Module } from '@nestjs/common';
import { CryptomusService } from './cryptomus.service';
import { CryptomusController } from './cryptomus.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [CryptomusService, PrismaService],
  controllers: [CryptomusController],
  imports: [UsersModule],
})
export class CryptomusModule {}
