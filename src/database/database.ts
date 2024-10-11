import { UserEntity } from '../user/user.entity';
import { EventEntity } from '../event/event.entity';
import { ParticipationEntity } from '../participation/participation.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

export const Database: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: 'mongodb+srv://REDACTED:REDACTED@REDACTED/?retryWrites=true&w=majority&appName=REDACTED',
  entities: [UserEntity, EventEntity, ParticipationEntity],
  synchronize: true,
};

export const dataSourceOptions = Database as DataSourceOptions;
