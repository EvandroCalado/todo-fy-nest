import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from '@/users/entities/user.entity';

import { default as authConfig } from './configs/auth.config';
import { HashingContract } from './contracts/hashing.contract';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingContract: HashingContract,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly jwtConfig: ConfigType<typeof authConfig>,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    const user = await this.userRepository.findOneBy({
      email: loginAuthDto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.hashingContract.compare(
      loginAuthDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.jwtConfig.secret,
        expiresIn: this.jwtConfig.ttl,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
      },
    );

    return {
      accessToken,
    };
  }
}
