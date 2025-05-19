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
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

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

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.hashingContract.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.createTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<TokenPayloadDto>(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfig.secret,
        },
      );

      const user = await this.userRepository.findOneBy({ id: sub });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.createTokens(user);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async sighJwt<T>(sub: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        secret: this.jwtConfig.secret,
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        expiresIn,
      },
    );
  }

  private async createTokens(user: User) {
    const accessTokenPromise = this.sighJwt<Partial<User>>(
      user.id,
      this.jwtConfig.ttl,
      {
        email: user.email,
      },
    );

    const refreshTokenPromise = this.sighJwt(
      user.id,
      this.jwtConfig.refreshTokenTtl,
    );
    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
