import { db } from '../db';
import { appointments, properties } from '../db/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import type { NewAppointment, AppointmentStatus } from '../../types/appointment';
import { BuyerProfileService } from './buyer-profile-service';

export class AppointmentService {
	/**
	 * Create a new appointment request
	 */
	static async createAppointment(appointmentData: NewAppointment) {
		try {
			// Validate that the property exists and belongs to the specified owner
			const property = await db.query.properties.findFirst({
				where: eq(properties.id, appointmentData.propertyId)
			});

			if (!property) {
				throw new Error('Property not found');
			}

			if (property.ownerId !== appointmentData.ownerId) {
				throw new Error('Property owner mismatch');
			}

			// Check for scheduling conflicts (same property, overlapping time)
			const conflictingAppointment = await this.checkForConflicts(
				appointmentData.propertyId,
				appointmentData.scheduledAt,
				appointmentData.duration || 60
			);

			if (conflictingAppointment) {
				throw new Error('Time slot is not available');
			}

			// Create buyer profile snapshot
			const buyerProfileSnapshot = await BuyerProfileService.createSnapshot(
				appointmentData.buyerId
			);

			// Create the appointment
			const [newAppointment] = await db
				.insert(appointments)
				.values({
					...appointmentData,
					buyerProfileSnapshot: buyerProfileSnapshot ? JSON.stringify(buyerProfileSnapshot) : null,
					status: 'requested',
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			return newAppointment;
		} catch (error) {
			console.error('Error creating appointment:', error);
			throw error;
		}
	}

	/**
	 * Get appointments for a user (as buyer or owner)
	 */
	static async getUserAppointments(userId: string, role: 'buyer' | 'owner' = 'buyer') {
		try {
			const whereClause =
				role === 'buyer' ? eq(appointments.buyerId, userId) : eq(appointments.ownerId, userId);

			const userAppointments = await db.query.appointments.findMany({
				where: whereClause,
				with: {
					property: {
						with: {
							location: true
						}
					},
					buyer: true,
					owner: true
				},
				orderBy: [desc(appointments.scheduledAt)]
			});

			return userAppointments;
		} catch (error) {
			console.error('Error fetching user appointments:', error);
			throw error;
		}
	}

	/**
	 * Get appointments for a specific property
	 */
	static async getPropertyAppointments(propertyId: number) {
		try {
			const propertyAppointments = await db.query.appointments.findMany({
				where: eq(appointments.propertyId, propertyId),
				with: {
					buyer: true,
					owner: true
				},
				orderBy: [asc(appointments.scheduledAt)]
			});

			return propertyAppointments;
		} catch (error) {
			console.error('Error fetching property appointments:', error);
			throw error;
		}
	}

	/**
	 * Update appointment status
	 */
	static async updateAppointmentStatus(
		appointmentId: number,
		status: AppointmentStatus,
		userId: string,
		notes?: string
	) {
		try {
			// Get the appointment to verify permissions
			const appointment = await db.query.appointments.findFirst({
				where: eq(appointments.id, appointmentId)
			});

			if (!appointment) {
				throw new Error('Appointment not found');
			}

			// Only owner can confirm/cancel appointments
			if (appointment.ownerId !== userId) {
				throw new Error('Unauthorized to update appointment status');
			}

			const updateData: {
				status: AppointmentStatus;
				updatedAt: Date;
				confirmedAt?: Date;
				cancelledAt?: Date;
				ownerNotes?: string;
			} = {
				status,
				updatedAt: new Date()
			};

			// Add status-specific timestamps
			if (status === 'confirmed') {
				updateData.confirmedAt = new Date();
			} else if (status === 'cancelled') {
				updateData.cancelledAt = new Date();
			}

			// Add notes if provided
			if (notes) {
				updateData.ownerNotes = notes;
			}

			const [updatedAppointment] = await db
				.update(appointments)
				.set(updateData)
				.where(eq(appointments.id, appointmentId))
				.returning();

			return updatedAppointment;
		} catch (error) {
			console.error('Error updating appointment status:', error);
			throw error;
		}
	}

	/**
	 * Update appointment notes (buyer can update their notes)
	 */
	static async updateAppointmentNotes(
		appointmentId: number,
		userId: string,
		notes: string,
		noteType: 'buyer' | 'owner' = 'buyer'
	) {
		try {
			const appointment = await db.query.appointments.findFirst({
				where: eq(appointments.id, appointmentId)
			});

			if (!appointment) {
				throw new Error('Appointment not found');
			}

			// Verify user has permission to update notes
			const isOwner = appointment.ownerId === userId;
			const isBuyer = appointment.buyerId === userId;

			if (!isOwner && !isBuyer) {
				throw new Error('Unauthorized to update appointment notes');
			}

			// Only owner can update owner notes, only buyer can update buyer notes
			if ((noteType === 'owner' && !isOwner) || (noteType === 'buyer' && !isBuyer)) {
				throw new Error('Unauthorized to update this type of notes');
			}

			const updateData = {
				[noteType === 'buyer' ? 'buyerNotes' : 'ownerNotes']: notes,
				updatedAt: new Date()
			};

			const [updatedAppointment] = await db
				.update(appointments)
				.set(updateData)
				.where(eq(appointments.id, appointmentId))
				.returning();

			return updatedAppointment;
		} catch (error) {
			console.error('Error updating appointment notes:', error);
			throw error;
		}
	}

	/**
	 * Delete an appointment (only buyer can delete their own requests)
	 */
	static async deleteAppointment(appointmentId: number, userId: string) {
		try {
			const appointment = await db.query.appointments.findFirst({
				where: eq(appointments.id, appointmentId)
			});

			if (!appointment) {
				throw new Error('Appointment not found');
			}

			// Only buyer can delete their own appointment requests
			if (appointment.buyerId !== userId) {
				throw new Error('Unauthorized to delete appointment');
			}

			// Only allow deletion of requested appointments
			if (appointment.status !== 'requested') {
				throw new Error('Cannot delete confirmed or completed appointments');
			}

			await db.delete(appointments).where(eq(appointments.id, appointmentId));

			return { success: true };
		} catch (error) {
			console.error('Error deleting appointment:', error);
			throw error;
		}
	}

	/**
	 * Check for scheduling conflicts
	 */
	private static async checkForConflicts(propertyId: number, scheduledAt: Date, duration: number) {
		const startTime = new Date(scheduledAt);
		const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

		// Check for overlapping appointments by getting all confirmed appointments
		// and checking for overlaps in JavaScript
		const confirmedAppointments = await db.query.appointments.findMany({
			where: and(eq(appointments.propertyId, propertyId), eq(appointments.status, 'confirmed'))
		});

		// Check for overlaps
		const conflictingAppointment = confirmedAppointments.find((appointment) => {
			const appointmentStart = new Date(appointment.scheduledAt);
			const appointmentEnd = new Date(
				appointmentStart.getTime() + (appointment.duration || 60) * 60 * 1000
			);

			// Check if appointments overlap
			return startTime < appointmentEnd && endTime > appointmentStart;
		});

		return conflictingAppointment;
	}

	/**
	 * Get available time slots for a property
	 */
	static async getAvailableTimeSlots(propertyId: number, date: Date) {
		try {
			const startOfDay = new Date(date);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(date);
			endOfDay.setHours(23, 59, 59, 999);

			// Get all confirmed appointments for the day
			const confirmedAppointments = await db.query.appointments.findMany({
				where: and(
					eq(appointments.propertyId, propertyId),
					eq(appointments.status, 'confirmed'),
					gte(appointments.scheduledAt, startOfDay),
					lte(appointments.scheduledAt, endOfDay)
				),
				orderBy: [asc(appointments.scheduledAt)]
			});

			// Generate available time slots (9 AM to 6 PM, 1-hour slots)
			const availableSlots = [];
			const businessHours = { start: 9, end: 18 }; // 9 AM to 6 PM

			for (let hour = businessHours.start; hour < businessHours.end; hour++) {
				const slotStart = new Date(date);
				slotStart.setHours(hour, 0, 0, 0);

				const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour

				// Check if this slot conflicts with any confirmed appointment
				const hasConflict = confirmedAppointments.some((appointment) => {
					const appointmentEnd = new Date(
						appointment.scheduledAt.getTime() + (appointment.duration || 60) * 60 * 1000
					);
					return appointment.scheduledAt < slotEnd && appointmentEnd > slotStart;
				});

				if (!hasConflict) {
					availableSlots.push({
						start: slotStart,
						end: slotEnd,
						formatted: slotStart.toLocaleTimeString('en-US', {
							hour: 'numeric',
							minute: '2-digit',
							hour12: true
						})
					});
				}
			}

			return availableSlots;
		} catch (error) {
			console.error('Error getting available time slots:', error);
			throw error;
		}
	}
}
