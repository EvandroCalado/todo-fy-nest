import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  readAll(@Query() pagination: Record<string, any>) {
    const { limit = 10, offset = 0 } = pagination;
    console.log(limit, offset);

    return this.tasksService.readAll();
  }

  @Get(':id')
  readOne(@Param('id') id: string) {
    return this.tasksService.readOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() UpdateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, UpdateTaskDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
