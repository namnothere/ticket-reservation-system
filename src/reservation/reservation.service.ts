import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { Event } from '../event/entities/event.entity';
import { CreateReservationDto } from './dtos/create-reservation.dto';
import { SeatService } from '../seat/seat.service';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private seatService: SeatService,
  ) {}

  async create(eventId: string, createReservationDto: CreateReservationDto): Promise<Reservation> {
    // Get event with lock
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      lock: { mode: 'pessimistic_write' }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if requested seats exceed available seats
    if (createReservationDto.seatNumbers.length > event.availableSeats) {
      throw new ConflictException('Not enough seats available');
    }

    // Create reservation
    const reservation = this.reservationRepository.create({
      userId: createReservationDto.userId,
      eventId,
      status: ReservationStatus.PENDING
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    try {
      // Reserve the seats
      await this.seatService.reserveSeats(
        createReservationDto.seatNumbers,
        eventId,
        savedReservation.id
      );

      // Update event's available seats
      event.availableSeats -= createReservationDto.seatNumbers.length;
      await this.eventRepository.save(event);

      // Update reservation status to confirmed
      savedReservation.status = ReservationStatus.CONFIRMED;
      await this.reservationRepository.save(savedReservation);

      return this.findOne(savedReservation.id);
    } catch (error) {
      // Mark reservation as failed
      await this.reservationRepository.update(
        savedReservation.id,
        { status: ReservationStatus.FAILED }
      )
      throw error;
    }
  }

  async cancel(reservationId: string): Promise<void> {
    const reservation = await this.findOne(reservationId);

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // Release the seats
    await this.seatService.releaseSeats(reservationId);

    // Update event's available seats
    const event = await this.eventRepository.findOne({
      where: { id: reservation.eventId },
      lock: { mode: 'pessimistic_write' }
    });

    if (event) {
      event.availableSeats += reservation.seats.length;
      await this.eventRepository.save(event);
    }

    // Delete reservation
    await this.reservationRepository.remove(reservation);
  }

  async findOne(id: string): Promise<Reservation> {
    return this.reservationRepository.findOne({
      where: { id },
      relations: ['event', 'seats']
    });
  }

  async getEventAvailability(eventId: string): Promise<{ availableSeats: number, totalSeats: number }> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return {
      availableSeats: event.availableSeats,
      totalSeats: event.totalSeats
    };
  }
} 