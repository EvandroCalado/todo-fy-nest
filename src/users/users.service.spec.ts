import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { HashingContract } from '@/auth/contracts/hashing.contract';
import { RoutePolicies } from '@/auth/enum/route-policies.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let userService: UsersService;
  let userRepository: Repository<User>;
  let hashingContract: HashingContract;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            preload: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
          },
        },
        {
          provide: HashingContract,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingContract = module.get<HashingContract>(HashingContract);
  });

  it('should be defined UsersService', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(hashingContract).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'any_name',
      email: 'any_email@example.com',
      password: 'any_password',
    };
    const passwordHash = 'any_hash';
    const newUser: User = {
      id: 'any_id',
      name: createUserDto.name,
      email: createUserDto.email,
      password: passwordHash,
      avatar: 'any_avatar',
      role: RoutePolicies.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      tasks: [],
    };

    jest.spyOn(hashingContract, 'hash').mockResolvedValue(passwordHash);
    jest.spyOn(userRepository, 'create').mockReturnValue(newUser);
    jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

    const result = await userService.create(createUserDto);

    expect(hashingContract.hash).toHaveBeenCalledWith(createUserDto.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      ...createUserDto,
      password: passwordHash,
    });
    expect(userRepository.save).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(newUser);
  });

  it('should fail to create a new user', async () => {
    jest.spyOn(userRepository, 'save').mockRejectedValue(new Error());

    await expect(userService.create({} as CreateUserDto)).rejects.toThrow(
      new Error('Failed to create user'),
    );
  });

  it('should throw an error if email already exists', async () => {
    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '23505',
      message: 'Email already exists',
    });

    await expect(userService.create({} as CreateUserDto)).rejects.toThrow(
      ConflictException,
    );
  });
});
