import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.article.findMany({
      include: { magazine: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.article.findUnique({
      where: { id },
      include: { magazine: true },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.article.findMany({
      where: { category: category as any },
      include: { magazine: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateArticleDto) {
    return this.prisma.article.create({ data });
  }

  async update(id: number, data: UpdateArticleDto) {
    return this.prisma.article.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.article.delete({ where: { id } });
  }
}
