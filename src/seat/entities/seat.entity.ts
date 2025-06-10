import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Reservation } from '../../reservation/entities/reservation.entity';

export enum SeatStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved'
}

@Entity()
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seatNumber: number;

  @Column({
    type: 'enum',
    enum: SeatStatus,
    default: SeatStatus.AVAILABLE
  })
  status: SeatStatus;

  @Column()
  eventId: string;

  @Column({ nullable: true })
  reservationId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => Reservation, { nullable: true })
  @JoinColumn({ name: 'reservationId' })
  reservation: Reservation;

  constructor(partial: Partial<Seat>) {
    Object.assign(this, partial);
  }
} 