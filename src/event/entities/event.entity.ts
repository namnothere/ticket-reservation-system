import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  constructor(partial: Partial<Event>) {
    Object.assign(this, partial);
  }
}
