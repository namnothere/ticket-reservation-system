import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { Seat, SeatStatus } from './entities/seat.entity';
import { In } from 'typeorm';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) {}

  async createSeatsForEvent(eventId: string, totalSeats: number): Promise<Seat[]> {
    const seats: Seat[] = [];
    
    for (let i = 1; i <= totalSeats; i++) {
      const seat = this.seatRepository.create({
        seatNumber: i,
        eventId,
        status: SeatStatus.AVAILABLE
      });
      seats.push(seat);
    }

    return this.seatRepository.save(seats);
  }

  async reserveSeats(seatNumbers: number[], eventId: string, reservationId: string, queryRunner?: QueryRunner): Promise<Seat[]> {
    const repository = queryRunner ? queryRunner.manager.getRepository(Seat) : this.seatRepository;
    
    const seats = await repository.find({
      where: {
        seatNumber: In(seatNumbers),
        eventId,
        status: SeatStatus.AVAILABLE
      },
      lock: { mode: 'pessimistic_write' }
    });

    if (seats.length !== seatNumbers.length) {
      throw new NotFoundException('Some seats are not available');
    }

    seats.forEach(seat => {
      seat.status = SeatStatus.RESERVED;
      seat.reservationId = reservationId;
    });

    return repository.save(seats);
  }

  async releaseSeats(reservationId: string, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner ? queryRunner.manager.getRepository(Seat) : this.seatRepository;
    
    const seats = await repository.find({
      where: { reservationId }
    });

    seats.forEach(seat => {
      seat.status = SeatStatus.AVAILABLE;
      seat.reservationId = null;
    });

    await repository.save(seats);
  }

  async getEventSeats(eventId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { eventId },
      relations: ['reservation']
    });
  }
} 