// tasks.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewsService } from '~/news/news.service';
@Injectable()
export class TasksService {
  constructor(private readonly newsService: NewsService) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    await this.newsService.cronNews();
  }
}
