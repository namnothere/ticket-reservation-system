import { IsArray, IsUUID, ArrayMinSize, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsUUID()
  eventId: string;

  @IsUUID()
  userId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMinSize(1)
  @Type(() => Number)
  seatNumbers: number[];
} 