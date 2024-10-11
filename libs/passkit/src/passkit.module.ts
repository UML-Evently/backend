import { Module } from '@nestjs/common';
import { PasskitService } from './passkit.service';

@Module({
  providers: [PasskitService],
  exports: [PasskitService],
})
export class PasskitModule {}
