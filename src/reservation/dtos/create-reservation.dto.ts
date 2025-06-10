import { IsArray, IsUUID, ArrayMinSize, IsNumber, Min, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @ArrayMinSize(1)
  @Type(() => Number)
  seats: number[];
} 