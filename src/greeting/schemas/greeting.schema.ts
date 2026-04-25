import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GreetingDocument = HydratedDocument<Greeting>;

@Schema({ timestamps: true })
export class Greeting {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ trim: true })
  isAnonymous?: boolean;
}

export const GreetingSchema = SchemaFactory.createForClass(Greeting);
