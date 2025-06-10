import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  async create(eventId: string, createReservationDto: CreateReservationDto): Promise<Reservation> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get event with lock
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // Check if requested seats exceed available seats
      if (createReservationDto.seats.length > event.availableSeats) {
        throw new ConflictException('Not enough seats available');
      }

      // Create reservation
      const reservation = this.reservationRepository.create({
        userId: createReservationDto.userId,
        eventId,
        status: ReservationStatus.PENDING
      });

      const savedReservation = await queryRunner.manager.save(Reservation, reservation);

      // Reserve the seats
      await this.seatService.reserveSeats(
        createReservationDto.seats,
        eventId,
        savedReservation.id,
        queryRunner
      );

      // Update event's available seats
      event.availableSeats -= createReservationDto.seats.length;
      await queryRunner.manager.save(Event, event);

      // Update reservation status to confirmed
      savedReservation.status = ReservationStatus.CONFIRMED;
      await queryRunner.manager.save(Reservation, savedReservation);

      await queryRunner.commitTransaction();
      return this.findOne(savedReservation.id);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      // Mark reservation as failed if it was created
      if (error.reservationId) {
        await this.reservationRepository.update(
          error.reservationId,
          { status: ReservationStatus.FAILED }
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(reservationId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = await this.findOne(reservationId);

      if (!reservation) {
        throw new NotFoundException('Reservation not found');
      }

      // Release the seats
      await this.seatService.releaseSeats(reservationId, queryRunner);

      // Update event's available seats
      const event = await queryRunner.manager.findOne(Event, {
        where: { id: reservation.eventId },
        lock: { mode: 'pessimistic_write' }
      });

      if (event) {
        event.availableSeats += reservation.seats.length;
        await queryRunner.manager.save(Event, event);
      }

      // Delete reservation
      await queryRunner.manager.remove(Reservation, reservation);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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