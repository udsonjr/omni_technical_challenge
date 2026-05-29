import { Injectable } from '@nestjs/common';
import { User } from './users.interface';

@Injectable()
export class UsersRepository {
  // Este array simula um "banco de dados" vazio
  private users: User[] = [];

  findAllActive(): User[] { return this.users.filter(u => u.deletedAt === undefined); }
  findById(id: string): User | undefined { return this.users.find(u => u.id === id && u.deletedAt === undefined); }
  findByUsername(username: string): User | undefined { return this.users.find(u => u.username === username && u.deletedAt === undefined); }

  create(data: Omit<User, 'id' | 'balance' | 'transactions' | 'createdAt' | 'updatedAt' | 'deletedAt'>): User {
    const user: User = { 
      id: crypto.randomUUID(), 
      balance: 0, 
      transactions: [], 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(), ...data };
    this.users.push(user);
    return user;
  }

  update(user: User): void {
    user.updatedAt = new Date().toISOString();
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  softDelete(id: string): void {
    const user = this.findById(id);
    if (user) {
      user.deletedAt = new Date().toISOString();
      this.update(user);
    }
  }
}