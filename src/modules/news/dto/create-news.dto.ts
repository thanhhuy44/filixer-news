import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({
    description: 'News ID',
    example: '6694d5e54db6892bc2000001',
  })
  @IsString()
  @IsNotEmpty()
  newsId: string;

  @ApiProperty({
    description: 'Title of the news',
    example: 'Title of the news',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Content of the news',
    example: 'Content of the news',
  })
  @IsString()
  @IsNotEmpty()
  thumbnail: string;

  @ApiProperty({
    description: 'Summary of the news',
    example: 'Summary of the news',
  })
  @IsString()
  @IsOptional()
  summary: string;

  @ApiProperty({
    description: 'Content of the news',
    example: 'Content of the news',
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @ApiProperty({
    description: 'Link of the news',
    example: 'https://www.google.com',
  })
  @IsString()
  @IsNotEmpty()
  link: string;
}
