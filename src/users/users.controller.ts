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

import { SetRoutePolicy } from '@/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDto } from '@/auth/dto/token-payload.dto';
import { RoutePolicies } from '@/auth/enum/route-policies.enum';
import { AdminPolicyGuard } from '@/auth/guards/admin-policy.guard';
import { AuthTokenGuard } from '@/auth/guards/auth-token.guard';
import { UserPolicyGuard } from '@/auth/guards/user-policy.guard';
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
  @UseGuards(AuthTokenGuard, AdminPolicyGuard)
  @SetRoutePolicy(RoutePolicies.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard, UserPolicyGuard)
  @SetRoutePolicy(RoutePolicies.USER)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.usersService.findOne(id, tokenPayload);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard, UserPolicyGuard)
  @SetRoutePolicy(RoutePolicies.USER)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.usersService.update(id, updateUserDto, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard, AdminPolicyGuard)
  @SetRoutePolicy(RoutePolicies.ADMIN)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.usersService.remove(id, tokenPayload);
  }

  @Put(':id')
  @UseGuards(AuthTokenGuard, AdminPolicyGuard)
  @SetRoutePolicy(RoutePolicies.ADMIN)
  restore(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.usersService.restore(id, tokenPayload);
  }
}
