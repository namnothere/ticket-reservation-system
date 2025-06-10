import { IsString, IsNumber, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  totalSeats: number;
}
