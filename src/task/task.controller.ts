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

import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() body: Record<string, any>) {
    console.log(body);
    return this.taskService.create();
  }

  @Get()
  readAll(@Query() pagination: Record<string, any>) {
    const { limit = 10, offset = 0 } = pagination;

    return `This action returns all task (limit: ${limit}, offset: ${offset})`;
  }

  @Get(':id')
  readOne(@Param('id') id: string) {
    return `This action returns a #${id} task`;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Record<string, any>) {
    return {
      id,
      ...body,
    };
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return `This action removes a #${id} task`;
  }
}
