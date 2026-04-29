const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Faculty', 'Administrator'], default: 'Student' }
});

module.exports = mongoose.model('User', UserSchema);
