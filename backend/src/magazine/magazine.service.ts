import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MagazineService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.magazine.findMany({
      include: { articles: true },
      orderBy: { issue: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.magazine.findUnique({
      where: { id },
      include: { articles: true },
    });
  }

  async findByIssue(issue: number) {
    return this.prisma.magazine.findUnique({
      where: { issue },
      include: { articles: true },
    });
  }

  async create(data: { issue: number; title: string; coverImage?: string }) {
    return this.prisma.magazine.create({ data });
  }
}
