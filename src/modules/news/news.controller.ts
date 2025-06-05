import { Body, Controller, Get, Post } from '@nestjs/common/decorators';

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

  @Get('/cron')
  async cronNews() {
    const data = await this.newsService.cronNews();
    return { data };
  }
}
