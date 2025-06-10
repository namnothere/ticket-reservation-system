import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './providers/event.service';
import * as controllers from './controllers';
import { Event } from './entities/event.entity';
import { SeatModule } from '../seat/seat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    SeatModule
  ],
  controllers: [...Object.values(controllers)],
  providers: [EventService],
  exports: [EventService]
})
export class EventModule {}
