/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Student' | 'Faculty' | 'Administrator';

export interface AppNotification {
  id: string;
  type: 'Success' | 'Warning' | 'Error' | 'Info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export interface Room {
  id: string;
  name: string;
  type: 'Classroom' | 'Lab' | 'Auditorium' | 'Seminar Hall';
  capacity: number;
  building: string;
  floor: number;
  features: string[];
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: number; // 1 (Student), 2 (Faculty), 3 (Admin)
}

export interface ConflictAlert {
  roomName: string;
  startTime: string;
  endTime: string;
  reason: string;
}
