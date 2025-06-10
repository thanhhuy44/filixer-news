import { GoogleGenAI } from '@google/genai';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebClient } from '@slack/web-api';
import * as cheerio from 'cheerio';
import { Model } from 'mongoose';

import { Category } from '../category/entities/category.entity';
import { CreateNewsDto } from './dto/create-news.dto';
import { News, NewsDocument } from './entities/news.entity';
@Injectable()
export class NewsService {
  private readonly cronSource = 'https://znews.vn';
  private readonly GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  private readonly GEMINI_MODEL = process.env.GEMINI_MODEL;

  private readonly SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
  private readonly SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

  private readonly GEMINI_AI = new GoogleGenAI({
    apiKey: this.GEMINI_API_KEY,
  });
  private readonly SlackClient = new WebClient(this.SLACK_BOT_TOKEN);

  constructor(
    @InjectModel(News.name) private readonly newsModel: Model<News>,
    @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
  ) {}

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

  private async fetchNews() {
    const response = await fetch(`${this.cronSource}/the-thao.html`).then(
      (res) => res.text(),
    );
    return response;
  }

  private async parseNews(html: string) {
    const $ = cheerio.load(html);
    const newsList = $('#news-latest .article-list .article-item');
    const newsListData = newsList.get().map((element) => {
      const $element = $(element);
      return {
        id: $element.attr('article-id'),
        thumbnail: $element
          .find('.article-thumbnail img')
          .attr('data-src')
          ?.trim(),
        title: $element.find('.article-title').text().trim() ?? '',
        summary: $element.find('.article-summary').text().trim() ?? '',
        link: $element.find('.article-thumbnail a').attr('href')?.trim() ?? '',
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
        temperature: 0,
      },
    });
    return response.text;
  }

  private async sendNewsToChannel(news: NewsDocument) {
    try {
      await this.SlackClient.chat.postMessage({
        channel: this.SLACK_CHANNEL_ID,
        text: news.title,
        blocks: [
          {
            type: 'image',
            image_url: news.thumbnail,
            alt_text: news.title,
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${news.title}*\n${news.summary}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Xem chi tiết',
                },
                url: news.link,
                style: 'primary',
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error('🚀 ~ NewsService ~ sendNewsToChannel ~ error:', error);
      return null;
    }
  }

  async cronNews() {
    const news = await this.fetchNews();
    const newsList = (await this.parseNews(news)).reverse();

    for (let index = 0; index < newsList.length; index++) {
      const news = newsList[index];
      setTimeout(
        async () => {
          try {
            const newNews = await this.create({
              ...news,
              newsId: news.id,
              category: 'the-thao',
            });
            await this.sendNewsToChannel(newNews);
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
