const mongoose = require('mongoose');

// Profile Schema
const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: String, required: true },
  interests: { type: String, required: true },
  homeImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Link Schema
const linkSchema = new mongoose.Schema({
  linkId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ['work', 'presence'], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Note Schema
const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  publishedAt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Learning Schema
const learningSchema = new mongoose.Schema({
  learningId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Models
const Profile = mongoose.model('Profile', profileSchema);
const Link = mongoose.model('Link', linkSchema);
const Note = mongoose.model('Note', noteSchema);
const Learning = mongoose.model('Learning', learningSchema);

module.exports = {
  Profile,
  Link,
  Note,
  Learning,
};
