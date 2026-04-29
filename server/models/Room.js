const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Classroom', 'Lab', 'Auditorium', 'Seminar Hall', 'Equipment'] },
  capacity: { type: Number },
  building: { type: String },
  floor: { type: Number },
  features: [{ type: String }]
});

module.exports = mongoose.model('Room', RoomSchema);
