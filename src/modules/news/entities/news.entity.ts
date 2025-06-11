import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NewsDocument = HydratedDocument<News>;

@Schema({ timestamps: true })
export class News {
  @Prop({ required: true })
  newsId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  summary: string;

  @Prop({ required: true })
  thumbnail: string;

  @Prop({ required: true, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true, default: false })
  isSummary: boolean;
}

export const NewsSchema = SchemaFactory.createForClass(News);
