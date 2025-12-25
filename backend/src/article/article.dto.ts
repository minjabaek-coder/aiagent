import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';

export enum Category {
  COVER_STORY = 'COVER_STORY',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
  EDITOR_PICK = 'EDITOR_PICK',
  INTERVIEW = 'INTERVIEW',
  EXHIBITION = 'EXHIBITION',
}

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  content: string;

  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsInt()
  magazineId?: number;
}

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  author?: string;
}
