import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  slackRoom: string;
}
