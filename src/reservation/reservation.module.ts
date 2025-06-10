import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationService } from './providers';
import * as controllers from './controllers';
import { Reservation } from './entities';
import { Event } from '../event/entities';
import { SeatModule } from '../seat/seat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservation, Event]),
    SeatModule
  ],
  controllers: [...Object.values(controllers)],
  providers: [ReservationService],
  exports: [ReservationService]
})
export class ReservationModule {} 