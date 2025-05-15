import { Body, Controller, Get, Param, Post } from '@nestjs/common/decorators';

import { CreateNewsDto } from './dto/create-news.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  async create(@Body() createNewsDto: CreateNewsDto) {
    const data = await this.newsService.create(createNewsDto);
    return { data };
  }

  @Get('/cron/:category')
  async cronNews(@Param('category') category: string) {
    const data = await this.newsService.cronNews(category);
    return { data };
  }
}
