import { connect, model } from 'mongoose';

import { CategorySchema } from '../modules/category/entities/category.entity';

const categories = [
  {
    name: 'Thể thao',
    slug: 'the-thao',
    threadId: 4,
  },
  {
    name: 'Công nghệ',
    slug: 'cong-nghe',
    threadId: 7,
  },
  {
    name: 'Thế giới',
    slug: 'the-gioi',
    threadId: 11,
  },
  {
    name: 'Giải trí',
    slug: 'giai-tri',
    threadId: 41,
  },
  {
    name: 'Sức khỏe',
    slug: 'suc-khoe',
    threadId: 20,
  },
  {
    name: 'Đời sống',
    slug: 'doi-song',
    threadId: 21,
  },
  {
    name: 'Du lịch',
    slug: 'du-lich',
    threadId: 23,
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    threadId: 24,
  },
  {
    name: 'Thời sự',
    slug: 'thoi-su',
    threadId: 25,
  },
];

const seedCategories = async () => {
  try {
    await connect('mongodb://localhost:27017/filixer-news');
    const CategoryModel = model('Category', CategorySchema);
    const categoryModel = await CategoryModel.insertMany(categories);
    console.log(categoryModel);
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

seedCategories();
