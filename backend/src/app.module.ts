import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ArticleModule } from './article/article.module';
import { MagazineModule } from './magazine/magazine.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [PrismaModule, ArticleModule, MagazineModule, ChatModule],
})
export class AppModule {}
