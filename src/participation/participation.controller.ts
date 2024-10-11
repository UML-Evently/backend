import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ParticipationService } from './participation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import {
  ParticipationResponseDto,
  AcceptParticipationRequestDto,
  RequestParticipationDto,
  CreateParticipationDto,
  RejectParticipationRequestDto,
  CancelParticipationRequestDto,
} from './dto';
import { ObjectId } from 'mongodb';

@ApiTags('Participation')
@Controller('participation')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @ApiCreatedResponse({
    description: 'Create a new participation',
    type: ParticipationResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async createParticipation(
    @Req() req: RequestWithUser,
    @Body() createParticipationDto: CreateParticipationDto,
  ) {
    return this.participationService.createParticipation(
      new ObjectId(req.user.id),
      createParticipationDto.eventId,
    );
  }

  @ApiCreatedResponse({
    description: 'Request participation',
    type: ParticipationResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/request')
  async requestParticipation(
    @Req() req: RequestWithUser,
    @Body() requestParticipationDto: RequestParticipationDto,
  ) {
    return this.participationService.requestParticipation(
      new ObjectId(req.user.id),
      requestParticipationDto,
    );
  }

  @ApiAcceptedResponse({
    description: 'Accept participation',
    type: ParticipationResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/accept')
  async acceptParticipationRequest(
    @Req() req: RequestWithUser,
    @Body() acceptParticipationRequestDto: AcceptParticipationRequestDto,
  ) {
    return this.participationService.acceptParticipationRequest(
      new ObjectId(req.user.id),
      acceptParticipationRequestDto,
    );
  }

  @ApiAcceptedResponse({
    description: 'Reject participation',
    type: ParticipationResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/reject')
  async rejectParticipationRequest(
    @Req() req: RequestWithUser,
    @Body() rejectParticipationRequestDto: RejectParticipationRequestDto,
  ) {
    return this.participationService.rejectParticipationRequest(
      new ObjectId(req.user.id),
      rejectParticipationRequestDto,
    );
  }

  @ApiCreatedResponse({
    description: 'Cancel participation',
    type: ParticipationResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('/cancel')
  async cancelParticipationRequest(
    @Req() req: RequestWithUser,
    @Body() cancelParticipationRequestDto: CancelParticipationRequestDto,
  ) {
    return this.participationService.cancelParticipationRequest(
      new ObjectId(req.user.id),
      cancelParticipationRequestDto,
    );
  }

  @ApiOkResponse({
    description: 'Get all participations for the event',
    type: ParticipationResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/:eventId/participations')
  async getEventParticipations(
    @Req() req: RequestWithUser,
    @Param('eventId') eventId: string,
  ) {
    return this.participationService.getEventParticipations(
      new ObjectId(req.user.id),
      eventId,
    );
  }

  @ApiOkResponse({
    description: 'Get user participation to the event',
    type: ParticipationResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/:eventId')
  async getParticipation(
    @Req() req: RequestWithUser,
    @Param('eventId') eventId: string,
  ) {
    return this.participationService.getParticipation(
      new ObjectId(req.user.id),
      eventId,
    );
  }

  @ApiOkResponse({
    description: 'Get Apple Wallet pass for the event',
    type: Buffer,
  })
  @Get('/apple-passkit/:token')
  async getApplePasskit(@Res() res: any, @Param('token') token: string) {
    const pass = await this.participationService.getApplePasskit(token);
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=pass.pkpass');
    res.send(pass);
  }

  @ApiOkResponse({
    description: 'Get all participations for the user',
    type: ParticipationResponseDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getAllUserParticipations(@Req() req: RequestWithUser) {
    return this.participationService.getAllUserParticipations(
      new ObjectId(req.user.id),
    );
  }
}
