import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { UsersService } from '@/users/users.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly userService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const user = await this.userService.findOne(createTaskDto.userId);

    const newTask = this.taskRepository.create({
      ...createTaskDto,
      user,
    });

    await this.taskRepository.save(newTask);

    return {
      ...newTask,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 1 } = paginationDto;

    const tasks = await this.taskRepository.find({
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: (offset - 1) * limit,
    });

    return tasks;
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
    });

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

  async remove(id: string) {
    await this.findOne(id);

    await this.taskRepository.delete(id);

    return {
      message: 'Task deleted successfully',
    };
  }
}
