import { db } from '../db/index';
import { ownerAvailabilityWindows, appointments } from '../db/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import type { AvailabilityWindowFormData, TimeSlot } from '../../types/availability';

export class AvailabilityService {
	/**
	 * Create a new availability window for an owner
	 */
	async createAvailabilityWindow(
		ownerId: string,
		data: AvailabilityWindowFormData
	): Promise<number> {
		const [window] = await db
			.insert(ownerAvailabilityWindows)
			.values({
				ownerId,
				date: data.date,
				startTime: data.startTime,
				endTime: data.endTime,
				slotDuration: data.slotDuration,
				notes: data.notes,
				timezone: data.timezone
			})
			.returning({ id: ownerAvailabilityWindows.id });

		return window.id;
	}

	/**
	 * Get all availability windows for an owner
	 */
	async getOwnerAvailabilityWindows(ownerId: string, startDate?: string, endDate?: string) {
		try {
			console.log('Fetching availability windows for owner:', ownerId);

			let query = db.query.ownerAvailabilityWindows.findMany({
				where: eq(ownerAvailabilityWindows.ownerId, ownerId),
				orderBy: (windows, { asc }) => [asc(windows.date), asc(windows.startTime)]
			});

			if (startDate && endDate) {
				query = db.query.ownerAvailabilityWindows.findMany({
					where: and(
						eq(ownerAvailabilityWindows.ownerId, ownerId),
						gte(ownerAvailabilityWindows.date, startDate),
						lte(ownerAvailabilityWindows.date, endDate)
					),
					orderBy: (windows, { asc }) => [asc(windows.date), asc(windows.startTime)]
				});
			}

			const result = await query;
			console.log('Found availability windows:', result.length);
			return result;
		} catch (error) {
			console.error('Error fetching availability windows:', error);
			throw error;
		}
	}

	/**
	 * Generate available time slots for a specific date
	 */
	async generateTimeSlots(
		ownerId: string,
		date: string,
		_propertyId?: number
	): Promise<TimeSlot[]> {
		// Get availability windows for this date
		const windows = await db.query.ownerAvailabilityWindows.findMany({
			where: and(
				eq(ownerAvailabilityWindows.ownerId, ownerId),
				eq(ownerAvailabilityWindows.date, date),
				eq(ownerAvailabilityWindows.isActive, true)
			)
		});

		const timeSlots: TimeSlot[] = [];

		for (const window of windows) {
			// Generate slots within this window
			const slotDuration = window.slotDuration ?? 30;
			const slots = this.generateSlotsInWindow(window.startTime, window.endTime, slotDuration);

			// Check for existing appointments
			const existingAppointments = await db.query.appointments.findMany({
				where: and(
					eq(appointments.ownerId, ownerId),
					eq(appointments.scheduledAt, new Date(`${date}T00:00:00`)),
					or(eq(appointments.status, 'confirmed'), eq(appointments.status, 'requested'))
				)
			});

			// Mark slots as unavailable if they conflict with appointments
			for (const slot of slots) {
				const isBooked = existingAppointments.some((appointment) => {
					const appointmentStart = new Date(appointment.scheduledAt);
					const appointmentEnd = new Date(
						appointmentStart.getTime() + (appointment.duration || 60) * 60000
					);

					const slotStart = new Date(`${date}T${slot.startTime}:00`);
					const slotEnd = new Date(`${date}T${slot.endTime}:00`);

					return slotStart < appointmentEnd && slotEnd > appointmentStart;
				});

				timeSlots.push({
					startTime: slot.startTime,
					endTime: slot.endTime,
					isAvailable: !isBooked
				});
			}
		}

		return timeSlots;
	}

	/**
	 * Generate time slots within a time window
	 */
	private generateSlotsInWindow(
		startTime: string,
		endTime: string,
		slotDuration: number
	): Array<{ startTime: string; endTime: string }> {
		const slots: Array<{ startTime: string; endTime: string }> = [];

		const start = this.timeToMinutes(startTime);
		const end = this.timeToMinutes(endTime);

		for (let current = start; current + slotDuration <= end; current += slotDuration) {
			slots.push({
				startTime: this.minutesToTime(current),
				endTime: this.minutesToTime(current + slotDuration)
			});
		}

		return slots;
	}

	/**
	 * Convert time string (HH:MM) to minutes
	 */
	private timeToMinutes(time: string): number {
		const [hours, minutes] = time.split(':').map(Number);
		return hours * 60 + minutes;
	}

	/**
	 * Convert minutes to time string (HH:MM)
	 */
	private minutesToTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
	}

	/**
	 * Delete an availability window
	 */
	async deleteAvailabilityWindow(windowId: number, ownerId: string): Promise<boolean> {
		const result = await db
			.delete(ownerAvailabilityWindows)
			.where(
				and(
					eq(ownerAvailabilityWindows.id, windowId),
					eq(ownerAvailabilityWindows.ownerId, ownerId)
				)
			);

		return result.rowCount > 0;
	}

	/**
	 * Update an availability window
	 */
	async updateAvailabilityWindow(
		windowId: number,
		ownerId: string,
		data: Partial<AvailabilityWindowFormData>
	): Promise<boolean> {
		const result = await db
			.update(ownerAvailabilityWindows)
			.set({
				date: data.date,
				startTime: data.startTime,
				endTime: data.endTime,
				slotDuration: data.slotDuration,
				notes: data.notes,
				timezone: data.timezone,
				updatedAt: new Date()
			})
			.where(
				and(
					eq(ownerAvailabilityWindows.id, windowId),
					eq(ownerAvailabilityWindows.ownerId, ownerId)
				)
			);

		return result.rowCount > 0;
	}

	/**
	 * Check if an owner has any availability for a given date
	 */
	async hasAvailabilityForDate(ownerId: string, date: string): Promise<boolean> {
		try {
			const windows = await db.query.ownerAvailabilityWindows.findMany({
				where: and(
					eq(ownerAvailabilityWindows.ownerId, ownerId),
					eq(ownerAvailabilityWindows.date, date),
					eq(ownerAvailabilityWindows.isActive, true)
				)
			});

			if (windows.length === 0) {
				return false;
			}

			// Check if there are any available time slots (not fully booked)
			const timeSlots = await this.generateTimeSlots(ownerId, date);
			return timeSlots.some((slot) => slot.isAvailable);
		} catch (error) {
			console.error('Error checking availability for date:', error);
			return false;
		}
	}

	/**
	 * Get all dates with availability for an owner within a date range
	 */
	async getAvailableDates(ownerId: string, startDate: string, endDate: string): Promise<string[]> {
		try {
			const windows = await db.query.ownerAvailabilityWindows.findMany({
				where: and(
					eq(ownerAvailabilityWindows.ownerId, ownerId),
					gte(ownerAvailabilityWindows.date, startDate),
					lte(ownerAvailabilityWindows.date, endDate),
					eq(ownerAvailabilityWindows.isActive, true)
				),
				orderBy: (windows, { asc }) => [asc(windows.date)]
			});

			const availableDates: string[] = [];
			const uniqueDates = [...new Set(windows.map((w) => w.date))];

			for (const date of uniqueDates) {
				const hasAvailability = await this.hasAvailabilityForDate(ownerId, date);
				if (hasAvailability) {
					availableDates.push(date);
				}
			}

			return availableDates;
		} catch (error) {
			console.error('Error getting available dates:', error);
			return [];
		}
	}
}
