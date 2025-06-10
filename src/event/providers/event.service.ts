import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { SeatService } from '../../seat/seat.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    private seatService: SeatService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...createEventDto,
      availableSeats: createEventDto.totalSeats,
    });
    
    const savedEvent = await this.eventRepository.save(event);
    
    // Create seats for the event
    await this.seatService.createSeatsForEvent(savedEvent.id, createEventDto.totalSeats);
    
    return savedEvent;
  }

  findAll() {
    const events = this.eventRepository.find({
      relations: ['seats'],
    });

    return events;
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  async remove(id: string) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.reservations.length > 0) {
      throw new BadRequestException('Event has reservations');
    }

    await this.eventRepository.delete(id);

    return event;
  }
}
