import { Controller, Post, Delete, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dtos/create-reservation.dto';

@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('events/:eventId/reserve')
  @HttpCode(HttpStatus.CREATED)
  async createReservation(
    @Param('eventId') eventId: string,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const reservation = await this.reservationService.create(eventId, createReservationDto);
    return {
      id: reservation.id,
      message: 'Reservation created successfully'
    };
  }

  @Delete('reservations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelReservation(@Param('id') id: string) {
    await this.reservationService.cancel(id);
  }

  @Get('events/:eventId')
  @HttpCode(HttpStatus.OK)
  async getEventAvailability(@Param('eventId') eventId: string) {
    return this.reservationService.getEventAvailability(eventId);
  }
} 