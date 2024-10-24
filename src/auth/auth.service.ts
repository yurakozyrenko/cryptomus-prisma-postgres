import { BadRequestException, Injectable } from '@nestjs/common';
import { AppErrors } from 'src/common/errors';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto, LoginUserDto } from 'src/users/dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  public async registerUser(dto: CreateUserDto) {
    try {
      return this.userService.createUser(dto);
    } catch (error) {
      throw new Error(error);
    }
  }

  public async loginUser(dto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) throw new BadRequestException(AppErrors.USER_NOT_EXIST);

    const checkPassword = await bcrypt.compare(dto.password, user.password);
    if (!checkPassword) throw new BadRequestException(AppErrors.INVALID_PASSWORD);

    delete user.password;

    const payload = {
      email: dto.email,
      id: user.id,
    };

    const token = await this.tokenService.generateJwtToken(payload);
    return { ...user, token };
  }
}
