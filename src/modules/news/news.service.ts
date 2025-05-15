import { GoogleGenAI } from '@google/genai';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as cheerio from 'cheerio';
import { Model } from 'mongoose';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

import {
  Category,
  CategoryDocument,
} from '../category/entities/category.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { News, NewsDocument } from './entities/news.entity';
@Injectable()
export class NewsService implements OnModuleInit {
  private readonly cronSource = 'https://znews.vn';
  private readonly MAX_NEWS = 10;
  private readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  private readonly GEMINI_MODEL = process.env.GEMINI_MODEL;
  private readonly GEMINI_AI = new GoogleGenAI({
    apiKey: this.GEMINI_API_KEY,
  });
  private readonly TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  private categories: CategoryDocument[] = [];

  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
    @InjectBot() private readonly bot: Telegraf,
  ) {}

  async onModuleInit() {
    await this.getCategories();
  }

  private async getCategories() {
    this.categories = await this.categoryModel.find();
  }

  async create(createNewsDto: CreateNewsDto) {
    const existingNews = await this.newsModel.findOne({
      newsId: createNewsDto.newsId,
    });
    if (existingNews) {
      throw new BadRequestException('News already exists');
    }
    const content = await this.getNewsDetail(createNewsDto.link);
    const summary = await this.summarizeNews(content);
    return await this.newsModel.create({
      ...createNewsDto,
      summary,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async fetchNews(category: string) {
    const response = await fetch(`${this.cronSource}/${category}.html`).then(
      (res) => res.text(),
    );
    return response;
  }

  private async parseNews(html: string) {
    const $ = cheerio.load(html);
    const newsList = $('#news-latest .article-list .article-item');
    const newsListData = newsList
      .get()
      .slice(0, this.MAX_NEWS)
      .map((element) => {
        const $element = $(element);
        return {
          id: $element.attr('article-id'),
          thumbnail: $element
            .find('.article-thumbnail img')
            .attr('data-src')
            ?.trim(),
          title: $element.find('.article-title').text().trim() ?? '',
          summary: $element.find('.article-summary').text().trim() ?? '',
          link:
            $element.find('.article-thumbnail a').attr('href')?.trim() ?? '',
        };
      });

    return newsListData;
  }

  private async getNewsDetail(link: string) {
    const response = await fetch(link).then((res) => res.text());
    const $ = cheerio.load(response);
    const content = $('.the-article-body *:not(figure)').text().trim();
    return content;
  }

  private async summarizeNews(content: string) {
    const prompt = `Là một cây viết chuyên nghiệp, hãy tóm tắt bài báo sau đây một cách ngắn gọn và đầy đủ thông tin quan trọng nhất:

${content}

Yêu cầu tóm tắt:
1. Giới hạn dưới 100 từ
2. Tập trung vào thông tin chính và quan trọng nhất
3. Sử dụng ngôn ngữ rõ ràng, dễ hiểu
4. Giữ nguyên các thông tin quan trọng như tên người, địa điểm, số liệu
5. Loại bỏ các thông tin không cần thiết và lặp lại
6. Đảm bảo tính logic và mạch lạc của bản tóm tắt`;

    const response = await this.GEMINI_AI.models.generateContent({
      model: this.GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
      },
    });
    return response.text;
  }

  private async sendNewsToChannel(news: NewsDocument, threadId: number) {
    try {
      const caption = `<strong>${news.title}</strong>\n${news.summary.trim()}`;
      await this.bot.telegram.sendPhoto(this.TELEGRAM_CHAT_ID, news.thumbnail, {
        caption,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Xem thêm',
                url: news.link,
              },
            ],
          ],
        },
        message_thread_id: threadId,
      });
    } catch (error) {
      console.error('🚀 ~ NewsService ~ sendNewsToChannel ~ error:', error);
      return null;
    }
  }

  async cronNews(category: string) {
    const existingCategory = this.categories.find((c) => c.slug === category);
    if (!existingCategory) {
      throw new BadRequestException('Category not found');
    }
    const news = await this.fetchNews(existingCategory.slug);
    const newsList = await this.parseNews(news);

    for (let index = 0; index < newsList.length; index++) {
      const news = newsList[index];
      setTimeout(
        async () => {
          try {
            const newNews = await this.create({
              ...news,
              newsId: news.id,
              category: existingCategory._id.toString(),
            });
            await this.sendNewsToChannel(newNews, existingCategory.threadId);
            console.log('🚀 ~ NewsService ~ cronNews ~ news:', news.title);
          } catch (error) {
            console.error('🚀 ~ NewsService ~ cronNews ~ error:', error);
          }
        },
        1000 * 60 * index,
      );
    }
  }
}
