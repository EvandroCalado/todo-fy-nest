import * as fs from 'fs/promises';
import * as path from 'path';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { HashingContract } from '@/auth/contracts/hashing.contract';
import { TokenPayloadDto } from '@/auth/dto/token-payload.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingContract: HashingContract,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const passwordHash = await this.hashingContract.hash(
        createUserDto.password,
      );

      const newUser = this.userRepository.create({
        ...createUserDto,
        password: passwordHash,
      });

      await this.userRepository.save(newUser);

      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll() {
    const users = await this.userRepository.find();

    return users;
  }

  async findOne(tokenPayload: TokenPayloadDto) {
    const user = await this.userRepository.findOneBy({ id: tokenPayload.sub });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const updateData = {
      name: updateUserDto.name,
    };

    if (updateUserDto?.password) {
      const passwordHash = await this.hashingContract.hash(
        updateUserDto.password,
      );

      updateData['password'] = passwordHash;
    }

    const user = await this.userRepository.preload({
      id,
      ...updateData,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (tokenPayload.sub !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this user',
      );
    }

    return this.userRepository.save(user);
  }

  async remove(id: string, tokenPayload: TokenPayloadDto) {
    const user = await this.findOne(tokenPayload);

    if (tokenPayload.sub !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this user',
      );
    }

    await this.userRepository.softDelete(id);

    return {
      message: 'User deleted successfully',
    };
  }

  async restore(id: string, tokenPayload: TokenPayloadDto) {
    const user = await this.findOne(tokenPayload);

    if (tokenPayload.sub !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to restore this user',
      );
    }

    const result = await this.userRepository.restore(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found or not deleted');
    }

    return {
      message: 'User restored successfully',
    };
  }

  async uploadAvatar(file: Express.Multer.File, tokenPayload: TokenPayloadDto) {
    if (file.size < 1024) {
      throw new BadRequestException('File size too small or not sended');
    }

    const user = await this.findOne(tokenPayload);

    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .substring(1);
    const filename = `${tokenPayload.sub}.${fileExtension}`;

    const filePath = path.resolve(process.cwd(), 'pictures', filename);

    await fs.writeFile(filePath, file.buffer);

    user.avatar = filename;

    return this.userRepository.save(user);
  }
}
