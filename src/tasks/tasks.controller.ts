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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { SetRoutePolicy } from '@/auth/decorators/set-route-policy.decorator';
import { TokenPayloadDto } from '@/auth/dto/token-payload.dto';
import { RoutePolicies } from '@/auth/enum/route-policies.enum';
import { AuthTokenGuard } from '@/auth/guards/auth-token.guard';
import { UserPolicyGuard } from '@/auth/guards/user-policy.guard';
import { TokenPayloadParam } from '@/auth/params/token-payload.param';
import { PaginationDto } from '@/common/dto/pagination.dto';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(AuthTokenGuard, UserPolicyGuard)
@SetRoutePolicy(RoutePolicies.USER)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.tasksService.create(createTaskDto, tokenPayload);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.tasksService.findAll(paginationDto, tokenPayload);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.tasksService.findOne(id, tokenPayload);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.tasksService.update(id, updateTaskDto, tokenPayload);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.tasksService.remove(id, tokenPayload);
  }
}
