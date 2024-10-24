import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto';
import { AppErrors } from 'src/common/errors';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  public async createUser(dto: CreateUserDto) {
    const user: User = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) throw new BadRequestException(AppErrors.USER_EXIST);

    const salt = await bcrypt.genSalt();

    dto.password = await this.hashPassword(dto.password, salt);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: dto.password,
      },
      // select: {
      //   ...USER_SELECT_FIELDS,
      // },
    });

    const payload = {
      email: dto.email,
    };
    const token: string = await this.tokenService.generateJwtToken(payload);
    return { ...newUser, token };
  }

  public async getPublicUser(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      // select: {
      //   ...USER_SELECT_FIELDS,
      // },
    });
  }

  public async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      // select: {
      //   ...APP_USER_FIELDS,
      // },
    });

    return user;
  }

  public async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // select: {
      //   ...APP_USER_FIELDS,
      // },
    });

    return user;
  }

  public async updateWallet(amount: number, userId: number) {
    return this.prisma.user.update({
      data: { wallet: amount },
      where: { id: userId },
    });
  }

  private async hashPassword(passwod, salt) {
    return bcrypt.hash(passwod, salt);
  }
}
