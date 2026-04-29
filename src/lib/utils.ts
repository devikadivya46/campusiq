/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Booking } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Checks if two time intervals overlap.
 * Algorithm: Start1 < End2 AND Start2 < End1
 */
export function areIntervalsOverlapping(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();

  return s1 < e2 && s2 < e1;
}

/**
 * Checks for conflicts for a new booking request.
 * Considers priority level: if newBooking has strictly higher priority than b,
 * it returns the conflict but flags it as surmountable in UI.
 */
export function getConflict(newBooking: Partial<Booking>, existingBookings: Booking[]): Booking | null {
  if (!newBooking.startTime || !newBooking.endTime || !newBooking.roomId) return null;

  // We check against both Approved and Pending because we want to prevent double-booking 
  // even if something isn't yet approved.
  return existingBookings.find(b => 
    b.roomId === newBooking.roomId && 
    (b.status === 'Approved' || b.status === 'Pending') &&
    areIntervalsOverlapping(newBooking.startTime!, newBooking.endTime!, b.startTime, b.endTime)
  ) || null;
}

export function getPriorityLabel(priority: number): string {
  switch(priority) {
    case 3: return 'Administrator';
    case 2: return 'Faculty';
    case 1: return 'Student';
    default: return 'Student';
  }
}

export function findAvailableRooms(startTime: string, endTime: string, allRooms: any[], existingBookings: Booking[]): any[] {
  return allRooms.filter(room => !existingBookings.some(b => 
    b.roomId === room.id && 
    b.status === 'Approved' &&
    areIntervalsOverlapping(startTime, endTime, b.startTime, b.endTime)
  ));
}

export function findAvailableSlots(date: string, roomId: string, existingBookings: Booking[]): { start: string, end: string }[] {
  // Simple heuristic: check 1-hour slots throughout the day (8 AM to 8 PM)
  const slots = [];
  const roomBookings = existingBookings.filter(b => b.roomId === roomId && b.status === 'Approved');
  
  for (let hour = 8; hour < 20; hour++) {
    const startStr = `${date}T${hour.toString().padStart(2, '0')}:00:00`;
    const endStr = `${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`;
    
    const isOccupied = roomBookings.some(b => 
      areIntervalsOverlapping(startStr, endStr, b.startTime, b.endTime)
    );
    
    if (!isOccupied) {
      slots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
  }
  return slots;
}
