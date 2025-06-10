import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Reservation } from './entities';
import { Event } from '../event/entities';
import { SeatModule } from '../seat/seat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Event]),
    SeatModule
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
  exports: [ReservationService]
})
export class ReservationModule {} 