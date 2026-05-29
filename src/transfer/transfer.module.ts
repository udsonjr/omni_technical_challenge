import { Module } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { TransferRepository } from './transfer.repository';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [TransferController],
  providers: [TransferService, TransferRepository],
  exports: [TransferService, TransferRepository],
})
export class TransferModule {}
