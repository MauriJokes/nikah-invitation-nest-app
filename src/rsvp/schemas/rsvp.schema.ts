import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RsvpDocument = HydratedDocument<Rsvp>;

@Schema({ timestamps: true })
export class Rsvp {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 1 })
  guests!: number;

  @Prop({ required: true, enum: ['yes', 'no'] })
  attendance!: 'yes' | 'no';

  @Prop({ trim: true })
  message?: string;
}

export const RsvpSchema = SchemaFactory.createForClass(Rsvp);
