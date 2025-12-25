import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MagazineService } from './magazine.service';

@Controller('magazines')
export class MagazineController {
  constructor(private readonly magazineService: MagazineService) {}

  @Get()
  async findAll() {
    return this.magazineService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.magazineService.findOne(parseInt(id, 10));
  }

  @Get('issue/:issue')
  async findByIssue(@Param('issue') issue: string) {
    return this.magazineService.findByIssue(parseInt(issue, 10));
  }

  @Post()
  async create(@Body() data: { issue: number; title: string; coverImage?: string }) {
    return this.magazineService.create(data);
  }
}
