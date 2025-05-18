import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { TokenPayloadAuthDto } from '@/auth/dto/token-payload-auth.dto';
import { AuthTokenGuard } from '@/auth/guards/auth-token.guard';
import { TokenPayloadParam } from '@/auth/params/token-payload.param';
import { PaginationDto } from '@/common/dto/pagination.dto';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(AuthTokenGuard)
  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.tasksService.create(createTaskDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.tasksService.findAll(paginationDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.tasksService.findOne(id, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.tasksService.update(id, updateTaskDto, tokenPayload);
  }

  @UseGuards(AuthTokenGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadAuthDto,
  ) {
    return this.tasksService.remove(id, tokenPayload);
  }
}
