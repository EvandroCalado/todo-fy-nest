import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  private lastId = 1;
  private tasks: TaskEntity[] = [
    {
      id: 1,
      title: 'Task 1',
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  create(createTaskDto: CreateTaskDto) {
    this.lastId++;

    const id = this.lastId;
    const newTask = {
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...createTaskDto,
    };

    this.tasks.push(newTask);

    return newTask;
  }

  readAll() {
    return this.tasks;
  }

  readOne(id: string) {
    const task = this.tasks.find(task => task.id === Number(id));

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  update(id: string, UpdateTaskDto: UpdateTaskDto) {
    const taskIndex = this.tasks.findIndex(task => task.id === Number(id));

    if (taskIndex < 0) {
      throw new NotFoundException('Task not found');
    }
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...UpdateTaskDto,
    };

    return this.tasks[taskIndex];
  }

  delete(id: string) {
    const taskIndex = this.tasks.findIndex(task => task.id === Number(id));

    if (taskIndex < 0) {
      throw new NotFoundException('Task not found');
    }

    this.tasks.splice(taskIndex, 1);

    return {
      message: 'Task deleted successfully',
    };
  }
}
