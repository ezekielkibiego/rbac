import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany();
  }

  async findOne(id: number) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.project.create({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }
}
