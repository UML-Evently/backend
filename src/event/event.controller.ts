import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import { EventResponseDto, EditEventDto, CreateEventDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { EventOwnerGuard } from './event-owner.guard';
import { ObjectId } from 'mongodb';

@ApiTags('Event')
@Controller('event')
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly EventService: EventService) {}

  @ApiOkResponse({
    description: 'Get all events for the user',
    type: EventResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @Get('/')
  async getAllUserEvents(@Req() req: RequestWithUser) {
    return this.EventService.getAllUserEvents(new ObjectId(req.user.id));
  }

  @ApiCreatedResponse({
    description: 'Create a new event',
    type: EventResponseDto,
  })
  @ApiBearerAuth()
  @Post('/')
  async createEvent(
    @Req() req: RequestWithUser,
    @Body() CreateEventDto: CreateEventDto,
  ) {
    return this.EventService.createEvent(
      new ObjectId(req.user.id),
      CreateEventDto,
    );
  }

  @ApiOkResponse({
    description: 'Get event data',
    type: EventResponseDto,
  })
  @ApiBearerAuth()
  @Get('/:eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return this.EventService.findOne(eventId);
  }

  @ApiOkResponse({
    description: 'Get event data',
    type: EventResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @Get('/search/:name')
  async searchEvents(@Param('name') name: string) {
    return this.EventService.searchEvents(name);
  }

  @ApiOkResponse({
    description: 'Edit event data',
    type: EventResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(EventOwnerGuard)
  @Put('/:eventId')
  async editEvent(
    @Req() req: RequestWithUser,
    @Param('eventId') eventId: string,
    @Body() EditEventDto: EditEventDto,
  ) {
    return this.EventService.editEvent(
      new ObjectId(req.user.id),
      new ObjectId(eventId),
      EditEventDto,
    );
  }

  @ApiNoContentResponse({
    description: 'Delete specific event with check for the owner',
    type: EventResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(EventOwnerGuard)
  @Delete('/:eventId')
  async deleteEvent(
    @Req() req: RequestWithUser,
    @Param('eventId') eventId: string,
  ) {
    return this.EventService.deleteEvent(
      new ObjectId(req.user.id),
      new ObjectId(eventId),
    );
  }
}
