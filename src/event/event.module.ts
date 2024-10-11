import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { EventEntity } from './event.entity';
import { AuthModule } from '../auth/auth.module';
import { ParticipationEntity } from '../participation/participation.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([EventEntity, UserEntity, ParticipationEntity]),
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
