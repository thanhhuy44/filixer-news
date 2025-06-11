// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { NewsService } from '~/news/news.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(private readonly newsService: NewsService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleScrapNews() {
    this.logger.log('Scraping news...');
    await this.newsService.scrapNews();
    this.logger.log('Done scraping news!');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotify() {
    this.logger.log('Sending news...');
    const news = await this.newsService.summaryNewsTask();
    if (!news) {
      this.logger.log('No news to send');
      return;
    }
    await this.newsService.sendNewsToChannel(news);
    this.logger.log(`Done sending news: ${news.title}`);
  }
}
