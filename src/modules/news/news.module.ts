import { Module } from '@nestjs/common/decorators';
import { MongooseModule } from '@nestjs/mongoose';

import { Category, CategorySchema } from '../category/entities/category.entity';
import { News, NewsSchema } from './entities/news.entity';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService],
  imports: [
    MongooseModule.forFeature([
      { name: News.name, schema: NewsSchema },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
})
export class NewsModule {}
