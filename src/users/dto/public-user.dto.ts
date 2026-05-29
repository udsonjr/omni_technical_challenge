import { User } from '../users.interface';

export class PublicUserDto {
  id: string;
  username: string;
  birthdate: string;
  balance: number;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.birthdate = user.birthdate;
    this.balance = user.balance;
  }
}
