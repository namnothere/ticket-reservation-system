import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Seat } from '../../seat/entities';
import { Reservation } from '../../reservation/entities';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  totalSeats: number;

  @Column()
  availableSeats: number;

  @OneToMany(() => Seat, seat => seat.event, { cascade: true, onDelete: 'CASCADE' })
  seats: Seat[];

  @OneToMany(() => Reservation, reservation => reservation.event, { cascade: true, onDelete: 'CASCADE' })
  reservations: Reservation[];

  constructor(partial: Partial<Event>) {
    Object.assign(this, partial);
  }
}
