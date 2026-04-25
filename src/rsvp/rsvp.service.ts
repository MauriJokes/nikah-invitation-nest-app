import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rsvp, RsvpDocument } from './schemas/rsvp.schema';
import { Greeting } from '../greeting/schemas/greeting.schema';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Injectable()
export class RsvpService {
  constructor(
    @InjectModel(Rsvp.name) private rsvpModel: Model<RsvpDocument>,
    @InjectModel(Greeting.name) private greetingModel: Model<Greeting>,
  ) {}

  async create(dto: CreateRsvpDto): Promise<RsvpDocument> {
    if (dto.message !== undefined) {
      const session = await this.rsvpModel.db.startSession();

      try {
        session.startTransaction();
        await this.greetingModel.create(
          [
            {
              name: dto.name,
              message: dto.message,
              isAnonymous: dto.isAnonymous,
            },
          ],
          { session: session },
        );
        const rsvp = await this.rsvpModel.create([dto], { session: session });

        await session.commitTransaction();

        return rsvp[0];
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return this.rsvpModel.create(dto);
  }

  async findAll(): Promise<RsvpDocument[]> {
    return this.rsvpModel
      .find({ isAnonymous: { $ne: true } })
      .sort({ createdAt: -1 })
      .exec();
  }
}
