import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop()
  phone?: string;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
