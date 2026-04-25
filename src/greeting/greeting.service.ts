import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Greeting, GreetingDocument } from './schemas/greeting.schema';
import { CreateGreetingDto } from './dto/create-greeting.dto';

@Injectable()
export class GreetingService {
  constructor(
    @InjectModel(Greeting.name) private greetingModel: Model<GreetingDocument>,
  ) {}

  async create(dto: CreateGreetingDto): Promise<GreetingDocument> {
    return this.greetingModel.create(dto);
  }

  async findAll(): Promise<GreetingDocument[]> {
    return this.greetingModel
      .find({ isAnonymous: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();
  }
}
