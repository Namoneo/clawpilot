import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockRepository: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });

      await expect(
        service.register({ email: 'test@test.com', password: 'password', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create a new user successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({ id: 1, email: 'new@test.com', name: 'New User' });
      mockRepository.save.mockResolvedValue({ id: 1, email: 'new@test.com', name: 'New User' });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result.access_token).toBe('test-token');
      expect(result.user.email).toBe('new@test.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 1, email: 'test@test.com', password: 'hashed' });
      
      // Mock bcrypt compare to return false
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return token and user on successful login', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        name: 'Test User',
      });
      
      jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'correctpassword',
      });

      expect(result.access_token).toBe('test-token');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: 'hashed',
        name: 'Test User',
      });

      const result = await service.getProfile(1);

      expect(result.password).toBeUndefined();
      expect(result.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});
