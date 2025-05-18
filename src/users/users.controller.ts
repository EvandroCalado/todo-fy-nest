import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { TokenPayloadAuthDto } from '@/auth/dto/token-payload-auth.dto';
import { AuthTokenGuard } from '@/auth/guards/auth-token.guard';
import { TokenPayloadParam } from '@/auth/params/token-payload.param';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.usersService.update(id, updateUserDto, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.usersService.remove(id, tokenPayload);
  }

  @Put(':id')
  @UseGuards(AuthTokenGuard)
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.usersService.restore(id, tokenPayload);
  }
}
