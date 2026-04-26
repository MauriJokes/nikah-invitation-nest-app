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
    const { message, isAnonymous, ...rsvpData } = dto;

    if (message !== undefined) {
      const session = await this.rsvpModel.db.startSession();

      try {
        session.startTransaction();
        const [greeting] = await this.greetingModel.create(
          [
            {
              name: dto.name,
              message,
              isAnonymous,
              colorIndex: dto.colorIndex,
            },
          ],
          { session },
        );
        const [rsvp] = await this.rsvpModel.create(
          [{ ...rsvpData, greetingId: greeting._id.toString() }],
          { session },
        );

        await session.commitTransaction();

        return rsvp;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    return this.rsvpModel.create(rsvpData);
  }

  async findAll(): Promise<RsvpDocument[]> {
    return this.rsvpModel.find().sort({ createdAt: -1 }).exec();
  }
}
