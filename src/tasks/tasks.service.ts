import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const newTask = this.taskRepository.create(createTaskDto);

    return this.taskRepository.save(newTask);
  }

  async readAll() {
    const tasks = await this.taskRepository.find();

    return tasks;
  }

  async readOne(id: string) {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskRepository.preload({
      id,
      ...updateTaskDto,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.taskRepository.save(task);
  }

  async delete(id: string) {
    await this.readOne(id);

    await this.taskRepository.delete(id);

    return {
      message: 'Task deleted successfully',
    };
  }
}
