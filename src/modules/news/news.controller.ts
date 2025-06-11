import { Controller } from '@nestjs/common/decorators';

import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
}
