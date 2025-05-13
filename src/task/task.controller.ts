import { Controller, Get, Param } from '@nestjs/common';

@Controller('task')
export class TaskController {
  @Get()
  findAll() {
    return 'This action returns all task';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} task`;
  }
}
