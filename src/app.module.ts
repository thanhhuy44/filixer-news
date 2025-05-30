import { Module } from '@nestjs/common/decorators';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CommandModule } from 'nestjs-command';
import { TelegrafModule } from 'nestjs-telegraf';

import { NewsModule } from './modules';
import { CategoryModule } from './modules/category/category.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('MONGO_USERNAME')}:${configService.get('MONGO_PASSWORD')}@mongo:27017/${configService.get('MONGO_DATABASE')}?authSource=admin`,
      }),
    }),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TELEGRAM_BOT_TOKEN'),
        launchOptions: false,
      }),
    }),
    ScheduleModule.forRoot(),
    CommandModule,
    CategoryModule,
    NewsModule,
    TasksModule,
  ],
  providers: [],
})
export class AppModule {}
