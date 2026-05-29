import { Injectable, NotFoundException } from '@nestjs/common';
import { Transfer } from './transfer.interfaces';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class TransferRepository {
  constructor(private readonly usersRepository: UsersRepository) {}

  // Simula um "banco de dados" com tokens vazios
  private transfers: Transfer[] = [];

  createTransfer(toUserId: string, fromUserId: string, amount: number): Transfer {
    const now = new Date();
    const transfer: Transfer = {
      id: crypto.randomUUID(),
      toUserId,
      fromUserId,
      amount,
      date: now.toISOString(),
    };
    this.transfers.push(transfer);
    this.createUsersTransactions(transfer);
    return transfer;
  }

  private createUsersTransactions(transfer: Transfer): void {
    // Cria a transação do usuário de origem
    const fromUser = this.usersRepository.findById(transfer.fromUserId);
    if (!fromUser) {
      throw new NotFoundException('Usuário de origem não encontrado');
    }
    fromUser.transactions.push({
      type: 'sent',
      toId: transfer.toUserId,
      amount: transfer.amount,
      date: transfer.date,
    });
    this.usersRepository.update(fromUser);

    // Cria a transação do usuário de destino
    const toUser = this.usersRepository.findById(transfer.toUserId);
    if (!toUser) {
      throw new NotFoundException('Usuário de destino não encontrado');
    }
    toUser.transactions.push({
      type: 'received',
      fromId: transfer.fromUserId,
      amount: transfer.amount,
      date: transfer.date,
    });
    this.usersRepository.update(toUser);
  }

  findAllByUserId(userId: string): Transfer[] {
    return this.transfers.filter((t) => t.toUserId === userId || t.fromUserId === userId);
  }
}
