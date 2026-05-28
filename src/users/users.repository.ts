import { Injectable } from '@nestjs/common';
import { User } from './users.interface';

@Injectable()
export class UsersRepository {
  // Este array simula um "banco de dados" vazio
  private users: User[] = [];

  findAll(): User[] { return this.users; }
  findById(id: string): User | undefined { return this.users.find(u => u.id === id); }
  findByUsername(username: string): User | undefined { return this.users.find(u => u.username === username); }

  create(data: Omit<User, 'id' | 'balance' | 'transactions'>): User {
    const user: User = { id: crypto.randomUUID(), balance: 0, transactions: [], ...data };
    this.users.push(user);
    return user;
  }
}