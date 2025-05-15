// tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { Category } from '~/category/entities/category.entity';
import { NewsService } from '~/news/news.service';
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    private readonly newsService: NewsService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    const categories = await this.categoryModel.find();
    for (const category of categories) {
      setTimeout(
        async () => {
          await this.newsService.cronNews(category.slug);
          this.logger.log(`📰 Start cron job for ${category.slug} 🚀🚀🚀`);
        },
        1000 * 60 * 10,
      );
    }
  }
}
