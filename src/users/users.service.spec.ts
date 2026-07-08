import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User } from '../../generated/prisma/client';

const mockUser: User = {
  id: 1,
  email: 'alice@ex.com',
  name: 'Alice',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const repoMock: Partial<Record<keyof UsersRepository, jest.Mock>> = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repoMock },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(UsersRepository);
  });

  describe('create', () => {
    it('신규 이메일이면 생성한다', async () => {
      repo.findByEmail.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'alice@ex.com',
        name: 'Alice',
      });

      expect(repo.findByEmail).toHaveBeenCalledWith('alice@ex.com');
      expect(repo.create).toHaveBeenCalledWith({
        email: 'alice@ex.com',
        name: 'Alice',
      });
      expect(result).toEqual(mockUser);
    });

    it('이메일이 중복이면 ConflictException', async () => {
      repo.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create({ email: 'alice@ex.com' })).rejects.toThrow(
        ConflictException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('전체 목록을 반환한다', async () => {
      repo.findMany.mockResolvedValue([mockUser]);
      await expect(service.findAll()).resolves.toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('존재하면 반환한다', async () => {
      repo.findById.mockResolvedValue(mockUser);
      await expect(service.findOne(1)).resolves.toEqual(mockUser);
    });

    it('없으면 NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('존재하고 이메일 변경 없으면 수정한다', async () => {
      repo.findById.mockResolvedValue(mockUser);
      repo.update.mockResolvedValue({ ...mockUser, name: 'Bob' });

      const result = await service.update(1, { name: 'Bob' });

      expect(repo.update).toHaveBeenCalledWith(1, { name: 'Bob' });
      expect(result.name).toBe('Bob');
    });

    it('대상이 없으면 NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Bob' })).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('다른 사용자가 쓰는 이메일로 변경하면 ConflictException', async () => {
      repo.findById.mockResolvedValue(mockUser);
      repo.findByEmail.mockResolvedValue({
        ...mockUser,
        id: 2,
        email: 'taken@ex.com',
      });

      await expect(
        service.update(1, { email: 'taken@ex.com' }),
      ).rejects.toThrow(ConflictException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('본인이 이미 쓰는 이메일이면 그대로 수정 허용', async () => {
      repo.findById.mockResolvedValue(mockUser);
      repo.findByEmail.mockResolvedValue(mockUser); // 같은 id
      repo.update.mockResolvedValue(mockUser);

      await expect(
        service.update(1, { email: 'alice@ex.com' }),
      ).resolves.toEqual(mockUser);
      expect(repo.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('존재하면 삭제한다', async () => {
      repo.findById.mockResolvedValue(mockUser);
      repo.delete.mockResolvedValue(mockUser);

      await expect(service.remove(1)).resolves.toEqual(mockUser);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it('없으면 NotFoundException', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
