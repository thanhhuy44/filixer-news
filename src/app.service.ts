import { Injectable, OnModuleInit } from '@nestjs/common';

import { seedCategories } from './seed/category';

@Injectable()
export class AppService implements OnModuleInit {
  async onModuleInit() {
    await seedCategories();
  }
}
