const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  priority: { type: Number, required: true },
  reminderMinutes: { type: Number }
});

module.exports = mongoose.model('Booking', BookingSchema);
