import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { GreetingService } from './greeting.service';
import { CreateGreetingDto } from './dto/create-greeting.dto';

@Controller('api/greetings')
export class GreetingController {
  constructor(private readonly greetingService: GreetingService) {}

  /** POST /api/greetings — save a new greeting */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGreetingDto) {
    return this.greetingService.create(dto);
  }

  /** GET /api/greetings — fetch all greetings newest-first */
  @Get()
  findAll() {
    return this.greetingService.findAll();
  }
}
