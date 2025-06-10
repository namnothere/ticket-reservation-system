import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatService } from './seat.service';
import { Seat } from './entities/seat.entity';
import { Reservation } from '../reservation/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Reservation])],
  providers: [SeatService],
  exports: [SeatService]
})
export class SeatModule {} 