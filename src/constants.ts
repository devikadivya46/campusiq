/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Room, Booking } from './types';

export const INITIAL_ROOMS: Room[] = [
  { id: '1', name: 'Advanced Robotics Lab', type: 'Lab', capacity: 50, building: 'Science Block', floor: 4, features: ['Workstations', 'Robotic Arms', '3D Printers'] },
  { id: '2', name: 'Main Auditorium', type: 'Auditorium', capacity: 450, building: 'Admin Central', floor: 1, features: ['A/V System', 'Stage', 'WiFi'] },
  { id: '3', name: 'Data Science Lab II', type: 'Lab', capacity: 60, building: 'Block F', floor: 1, features: ['GPU Clusters', 'Whiteboard'] },
  { id: '4', name: 'Seminar Hall A', type: 'Seminar Hall', capacity: 120, building: 'Main Tower', floor: 3, features: ['Projector', 'AC'] },
  { id: '5', name: 'Classroom 302', type: 'Classroom', capacity: 40, building: 'Science Block', floor: 3, features: ['Smart Board'] },
  { id: '6', name: 'Classroom 405', type: 'Classroom', capacity: 40, building: 'Science Block', floor: 4, features: ['WiFi'] },
];

const now = new Date();
const todayAt = (hours: number) => {
  const d = new Date(now);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomId: '1',
    userId: 'u1',
    userName: 'Prof. Sharma',
    startTime: todayAt(9),
    endTime: todayAt(11),
    purpose: 'Robotics Seminar',
    status: 'Approved',
    priority: 2,
  },
  {
    id: 'b2',
    roomId: '2',
    userId: 'u2',
    userName: 'Student Council',
    startTime: todayAt(14),
    endTime: todayAt(17),
    purpose: 'Annual Fest Meeting',
    status: 'Approved',
    priority: 1,
  },
  {
    id: 'b3',
    roomId: '4',
    userId: 'u3',
    userName: 'Admin Dept',
    startTime: todayAt(10),
    endTime: todayAt(12),
    purpose: 'Faculty Training',
    status: 'Approved',
    priority: 3,
  },
];
