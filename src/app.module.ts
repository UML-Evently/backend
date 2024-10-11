import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ParticipationModule } from './participation/participation.module';
import { EventModule } from './event/event.module';
import { Database } from './database/database';

@Module({
  imports: [
    TypeOrmModule.forRoot(Database),
    AuthModule,
    UserModule,
    EventModule,
    ParticipationModule,
  ],
})
export class AppModule {}
