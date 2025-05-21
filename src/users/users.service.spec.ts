import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { HashingContract } from '@/auth/contracts/hashing.contract';
import { TokenPayloadDto } from '@/auth/dto/token-payload.dto';
import { RoutePolicies } from '@/auth/enum/route-policies.enum';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const createUserFactory = (overrides: Partial<User> = {}) => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@example.com',
  password: 'any_password',
  avatar: 'any_avatar',
  role: RoutePolicies.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
  tasks: [],
  ...overrides,
});

const createTokenPayloadFactory = (
  overrides: Partial<TokenPayloadDto> = {},
) => ({
  sub: 'any_id',
  email: 'any_email@example.com',
  iat: 1,
  exp: 1,
  aud: 'any_aud',
  iss: 'any_iss',
  user: createUserFactory(),
  ...overrides,
});

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

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'any_name',
        email: 'any_email@example.com',
        password: 'any_password',
      };
      const passwordHash = 'any_hash';
      const newUser = createUserFactory();

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

  describe('findOne', () => {
    it('should find a user by id if user exists', async () => {
      const tokenPayload = createTokenPayloadFactory();
      const user = createUserFactory();

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user);

      const result = await userService.findOne(tokenPayload);

      expect(result).toEqual(user);
    });

    it('should return error if user not found', async () => {
      const tokenPayload = createTokenPayloadFactory();

      await expect(userService.findOne(tokenPayload)).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });
  });
});
