import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NewsDocument = HydratedDocument<News>;

@Schema({})
export class News {
  @Prop({ required: true })
  newsId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  summary: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: true, ref: 'category' })
  category: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true, default: Date.now() })
  createdAt: Date;

  @Prop({ required: true, default: Date.now() })
  updatedAt: Date;
}

export const NewsSchema = SchemaFactory.createForClass(News);
