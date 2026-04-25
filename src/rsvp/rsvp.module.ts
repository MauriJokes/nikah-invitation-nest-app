import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RsvpController } from './rsvp.controller';
import { RsvpService } from './rsvp.service';
import { Rsvp, RsvpSchema } from './schemas/rsvp.schema';
import { Greeting, GreetingSchema } from '../greeting/schemas/greeting.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Rsvp.name, schema: RsvpSchema }]),
    MongooseModule.forFeature([{ name: Greeting.name, schema: GreetingSchema }]),
  ],
  controllers: [RsvpController],
  providers: [RsvpService],
})
export class RsvpModule {}
