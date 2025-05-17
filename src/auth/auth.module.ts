import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/users/entities/user.entity';

import { BcryptAdapter } from './adapters/bcrypt.adapter';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import authConfig from './configs/auth.config';
import { HashingContract } from './contracts/hashing.contract';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingContract,
      useClass: BcryptAdapter,
    },
  ],
  exports: [HashingContract],
})
export class AuthModule {}
