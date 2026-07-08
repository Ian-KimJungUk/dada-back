import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '../../generated/prisma/client';

/**
 * 데이터 접근 계층 — Prisma에 대한 얇은 래퍼.
 * 비즈니스 규칙 없이 순수 CRUD만 담당한다.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findMany(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { id: 'asc' } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
