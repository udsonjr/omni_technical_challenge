import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Transfer } from './transfer.interfaces';
import { TransferRepository } from './transfer.repository';
import { AuthRepository } from '../auth/auth.repository';
import { UsersRepository } from '../users/users.repository';
import { TransferRequestDto } from './dto/transfer-request.dto';
import { AuthToken } from '../auth/auth.interfaces';
import { User } from '../users/users.interface';

@Injectable()
export class TransferService {
  constructor(
    private readonly transferRepository: TransferRepository,
    private readonly authRepository: AuthRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  private validateToken(token: string): AuthToken {
    const authToken = this.authRepository.validateToken(token);
    if (!authToken) {
      throw new UnauthorizedException('Você não tem permissão para realizar esta ação');
    }
    return authToken;
  }

  private validateUser(userId: string): User {
    const user = this.usersRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado. Id: ' + userId);
    }
    return user;
  }

  public transfer(token: string, dto: TransferRequestDto): Transfer {
    const authToken = this.validateToken(token);
    const fromUser = this.validateUser(authToken.userId);
    const toUser = this.validateUser(dto.toId);

    if (fromUser.id === toUser.id) {
      throw new BadRequestException('Não é possível transferir para si mesmo');
    }

    if (fromUser.balance < dto.amount) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const transfer = this.transferRepository.createTransfer(toUser.id, fromUser.id, dto.amount);
    return transfer;
  }
}
