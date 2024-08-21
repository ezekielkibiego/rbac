/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async create(
    email: string,
    plainPassword: string,
    firstName: string,
    lastName: string,
    phone: string,
    address: string,
    kraPin: string,
    otherDocuments: any,
  ) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          address,
          kraPin,
          otherDocuments,
        },
      });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (
        error.code === 'P2002' && // Prisma error code for unique constraint violation
        error.meta?.target?.includes('email')
      ) {
        throw new ConflictException('Email already exists.');
      }
      throw error;
    }
  }

  async update(id: number, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data });
    const { password, ...result } = user;
    return result;
  }

  async delete(id: number) {
    const user = await this.prisma.user.delete({ where: { id } });
    const { password, ...result } = user;
    return result;
  }
}
