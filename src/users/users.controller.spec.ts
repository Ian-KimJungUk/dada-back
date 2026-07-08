import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../generated/prisma/client';

const mockUser: User = {
  id: 1,
  email: 'alice@ex.com',
  name: 'Alice',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const serviceMock: Partial<Record<keyof UsersService, jest.Mock>> = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  it('create → service.create 위임', async () => {
    service.create.mockResolvedValue(mockUser);
    const dto = { email: 'alice@ex.com', name: 'Alice' };

    await expect(controller.create(dto)).resolves.toEqual(mockUser);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll → service.findAll 위임', async () => {
    service.findAll.mockResolvedValue([mockUser]);
    await expect(controller.findAll()).resolves.toEqual([mockUser]);
  });

  it('findOne → service.findOne(id) 위임', async () => {
    service.findOne.mockResolvedValue(mockUser);
    await expect(controller.findOne(1)).resolves.toEqual(mockUser);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update → service.update(id, dto) 위임', async () => {
    const updated = { ...mockUser, name: 'Bob' };
    service.update.mockResolvedValue(updated);

    await expect(controller.update(1, { name: 'Bob' })).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(1, { name: 'Bob' });
  });

  it('remove → service.remove(id) 위임', async () => {
    service.remove.mockResolvedValue(mockUser);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
