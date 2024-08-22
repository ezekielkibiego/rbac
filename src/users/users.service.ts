/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { roles: true },
    });
    return users.map(({ password, ...result }) => result);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
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
    roleIds: number[],
  ) {
    // Check if all roles exist
    const existingRoles = await this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds,
        },
      },
    });

    if (existingRoles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found.');
    }

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
          roles: {
            connect: roleIds.map((id) => ({ id })),
          },
        },
        include: { roles: true },
      });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new ConflictException('Email already exists.');
      }
      throw error;
    }
  }

  async update(id: number, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Check if all roles exist
    if (data.roleIds) {
      const existingRoles = await this.prisma.role.findMany({
        where: {
          id: {
            in: data.roleIds,
          },
        },
      });

      if (existingRoles.length !== data.roleIds.length) {
        throw new NotFoundException('One or more roles not found.');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        roles: {
          connect: data.roleIds ? data.roleIds.map((id) => ({ id })) : [],
        },
      },
      include: { roles: true },
    });
    const { password, ...result } = user;
    return result;
  }

  async delete(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { roles: true },
    });
    const { password, ...result } = user;
    return result;
  }
}
