const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/campusiq')
  .then(() => console.log('MongoDB Connected to campusiq database'))
  .catch(err => console.log('DB Connection Error: ', err));

app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get('/api/rooms', async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.get('/api/bookings', async (req, res) => {
  const bookings = await Booking.find().sort({ startTime: -1 });
  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const saved = await newBooking.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const updated = await Booking.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  const users = [
    { id: 'ADMIN123', name: 'System Admin', role: 'Administrator' },
    { id: 'FACULTY123', name: 'Prof. Sharma', role: 'Faculty' },
    { id: 'STU123', name: 'Student Council', role: 'Student' }
  ];
  const rooms = [
    { id: '1', name: 'Advanced Robotics Lab', type: 'Lab', capacity: 50, building: 'Science Block', floor: 4, features: ['Workstations', 'Robotic Arms', '3D Printers'] },
    { id: '2', name: 'Main Auditorium', type: 'Auditorium', capacity: 450, building: 'Admin Central', floor: 1, features: ['A/V System', 'Stage', 'WiFi'] },
    { id: '3', name: 'Data Science Lab II', type: 'Lab', capacity: 60, building: 'Block F', floor: 1, features: ['GPU Clusters', 'Whiteboard'] },
    { id: '4', name: 'Seminar Hall A', type: 'Seminar Hall', capacity: 120, building: 'Main Tower', floor: 3, features: ['Projector', 'AC'] },
    { id: '5', name: 'Classroom 302', type: 'Classroom', capacity: 40, building: 'Science Block', floor: 3, features: ['Smart Board'] },
    { id: '6', name: 'Classroom 405', type: 'Classroom', capacity: 40, building: 'Science Block', floor: 4, features: ['WiFi'] },
    { id: '7', name: 'Mobile Projector Kit', type: 'Equipment', capacity: 0, building: 'AV Storage', floor: 1, features: ['4K Projector', 'Screen'] }
  ];
  
  const now = new Date();
  const todayAt = (hours) => { const d = new Date(now); d.setHours(hours, 0, 0, 0); return d; };
  const bookings = [
    { id: 'b1', roomId: '1', userId: 'FACULTY123', userName: 'Prof. Sharma', startTime: todayAt(9), endTime: todayAt(11), purpose: 'Robotics Seminar', status: 'Approved', priority: 2, reminderMinutes: 60 },
    { id: 'b2', roomId: '2', userId: 'STU123', userName: 'Student Council', startTime: todayAt(14), endTime: todayAt(17), purpose: 'Annual Fest Meeting', status: 'Approved', priority: 1, reminderMinutes: 30 },
    { id: 'b3', roomId: '4', userId: 'ADMIN123', userName: 'Admin Dept', startTime: todayAt(10), endTime: todayAt(12), purpose: 'Faculty Training', status: 'Approved', priority: 3, reminderMinutes: 15 }
  ];

  await User.deleteMany({});
  await Room.deleteMany({});
  await Booking.deleteMany({});

  await User.insertMany(users);
  await Room.insertMany(rooms);
  await Booking.insertMany(bookings);

  res.json({ message: 'Database seeded successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
