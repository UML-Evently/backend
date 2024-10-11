import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipationController } from './participation.controller';
import { AuthModule } from '../auth/auth.module';
import { ParticipationEntity } from './participation.entity';
import { EventEntity } from '../event/event.entity';
import { UserEntity } from '../user/user.entity';
import { PasskitModule } from '@app/passkit';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([ParticipationEntity, EventEntity, UserEntity]),
    PasskitModule,
  ],
  providers: [ParticipationService],
  controllers: [ParticipationController],
  exports: [ParticipationService],
})
export class ParticipationModule {}
