import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TokenPayloadDto } from '@/auth/dto/token-payload.dto';
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

  async create(createTaskDto: CreateTaskDto, tokenPayload: TokenPayloadDto) {
    const user = await this.userService.findOne(tokenPayload);

    if (tokenPayload.sub !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to create this task',
      );
    }

    const newTask = this.taskRepository.create({
      ...createTaskDto,
      user,
    });

    return await this.taskRepository.save(newTask);
  }

  async findAll(paginationDto: PaginationDto, tokenPayload: TokenPayloadDto) {
    const { limit = 10, offset = 1 } = paginationDto;

    const tasks = await this.taskRepository.find({
      where: { user: { id: tokenPayload.sub } },
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
      take: limit,
      skip: (offset - 1) * limit,
    });

    return tasks;
  }

  async findOne(id: string, tokenPayload: TokenPayloadDto) {
    const task = await this.taskRepository.findOne({
      where: { id, user: { id: tokenPayload.sub } },
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

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const task = await this.taskRepository.preload({
      user: { id: tokenPayload.sub },
      id,
      ...updateTaskDto,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return await this.taskRepository.save(task);
  }

  async remove(id: string, tokenPayload: TokenPayloadDto) {
    await this.findOne(id, tokenPayload);

    await this.taskRepository.delete({ id, user: { id: tokenPayload.sub } });

    return {
      message: 'Task deleted successfully',
    };
  }
}
