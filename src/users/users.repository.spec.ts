import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersRepository', () => {
  let repo: UsersRepository;
  let prismaUser: Record<string, jest.Mock>;

  beforeEach(async () => {
    prismaUser = {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: { user: prismaUser } },
      ],
    }).compile();

    repo = module.get(UsersRepository);
  });

  it('create → prisma.user.create({ data })', async () => {
    await repo.create({ email: 'a@ex.com' });
    expect(prismaUser.create).toHaveBeenCalledWith({
      data: { email: 'a@ex.com' },
    });
  });

  it('findMany → id 오름차순 정렬', async () => {
    await repo.findMany();
    expect(prismaUser.findMany).toHaveBeenCalledWith({
      orderBy: { id: 'asc' },
    });
  });

  it('findById → findUnique({ where: { id } })', async () => {
    await repo.findById(5);
    expect(prismaUser.findUnique).toHaveBeenCalledWith({ where: { id: 5 } });
  });

  it('findByEmail → findUnique({ where: { email } })', async () => {
    await repo.findByEmail('a@ex.com');
    expect(prismaUser.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@ex.com' },
    });
  });

  it('update → update({ where: { id }, data })', async () => {
    await repo.update(5, { name: 'Bob' });
    expect(prismaUser.update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { name: 'Bob' },
    });
  });

  it('delete → delete({ where: { id } })', async () => {
    await repo.delete(5);
    expect(prismaUser.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });
});
