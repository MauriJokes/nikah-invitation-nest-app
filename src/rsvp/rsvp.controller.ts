import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { RsvpService } from './rsvp.service';
import { CreateRsvpDto } from './dto/create-rsvp.dto';

@Controller('api/rsvp')
export class RsvpController {
  constructor(private readonly rsvpService: RsvpService) {}

  /** POST /api/rsvp — rate-limited: 5 requests per minute per IP */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  create(@Body() dto: CreateRsvpDto) {
    return this.rsvpService.create(dto);
  }

  /** GET /api/rsvp — fetch all RSVPs newest-first */
  @Get()
  findAll() {
    return this.rsvpService.findAll();
  }
}
