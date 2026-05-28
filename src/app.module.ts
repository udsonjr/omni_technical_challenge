import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [UsersModule, AuthModule, TransferModule],
})
export class AppModule {}
