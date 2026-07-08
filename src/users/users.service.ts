import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../generated/prisma/client';

/**
 * 비즈니스 로직 계층 — 중복/존재 여부 등 규칙을 검증하고
 * 데이터 접근은 UsersRepository에 위임한다.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(`이미 존재하는 이메일입니다: ${dto.email}`);
    }
    return this.usersRepository.create(dto);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findMany();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`사용자를 찾을 수 없습니다: id=${id}`);
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id); // 존재 확인

    if (dto.email) {
      const owner = await this.usersRepository.findByEmail(dto.email);
      if (owner && owner.id !== id) {
        throw new ConflictException(`이미 존재하는 이메일입니다: ${dto.email}`);
      }
    }

    return this.usersRepository.update(id, dto);
  }

  async remove(id: number): Promise<User> {
    await this.findOne(id); // 존재 확인
    return this.usersRepository.delete(id);
  }
}
