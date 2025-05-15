import { PartialType } from '@nestjs/mapped-types';

import { IsEmail, IsEmpty, IsOptional } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEmpty({ message: 'Email is not allowed to be updated' })
  @IsEmail()
  readonly email?: string;
}
