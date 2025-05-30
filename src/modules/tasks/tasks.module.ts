import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Category, CategorySchema } from '~/category/entities/category.entity';

import { CategoryModule, NewsModule } from '..';
import { News, NewsSchema } from '../news/entities/news.entity';
import { NewsService } from '../news/news.service';
import { TasksService } from './tasks.service';

@Module({
  providers: [TasksService, NewsService],
  exports: [TasksService],
  imports: [
    CategoryModule,
    NewsModule,
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: News.name, schema: NewsSchema },
    ]),
  ],
})
export class TasksModule {}
