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
 */
export function getConflict(newBooking: Partial<Booking>, existingBookings: Booking[]): Booking | null {
  if (!newBooking.startTime || !newBooking.endTime || !newBooking.roomId) return null;

  return existingBookings.find(b => 
    b.roomId === newBooking.roomId && 
    b.status === 'Approved' &&
    areIntervalsOverlapping(newBooking.startTime!, newBooking.endTime!, b.startTime, b.endTime)
  ) || null;
}
