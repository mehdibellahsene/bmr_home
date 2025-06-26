import mongoose, { Schema, Document } from 'mongoose';

// Profile Model
export interface IProfile extends Document {
  name: string;
  title: string;
  location: string;
  email: string;
  skills: string;
  interests: string;
  homeImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: String, required: true },
  interests: { type: String, required: true },
  homeImage: { type: String, default: '' },
}, {
  timestamps: true,
});

// Links Model
export interface ILink extends Document {
  linkId: string;
  name: string;
  url: string;
  icon: string;
  category: 'work' | 'presence';
  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>({
  linkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['work', 'presence'], required: true },
}, {
  timestamps: true,
});

// Notes Model
export interface INote extends Document {
  noteId: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  noteId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  publishedAt: { type: String, required: true },
}, {
  timestamps: true,
});

// Learning Model
export interface ILearning extends Document {
  learningId: string;
  title: string;
  description: string;
  type: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
}

const LearningSchema = new Schema<ILearning>({
  learningId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
}, {
  timestamps: true,
});

// Export models
export const Profile = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
export const Link = mongoose.models.Link || mongoose.model<ILink>('Link', LinkSchema);
export const Note = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
export const Learning = mongoose.models.Learning || mongoose.model<ILearning>('Learning', LearningSchema);
