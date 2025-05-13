import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('task')
export class TaskController {
  @Post()
  create(@Body() body: unknown) {
    return body;
  }

  @Get()
  readAll() {
    return 'This action returns all task';
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
