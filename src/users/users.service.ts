import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '../auth/auth.repository';
import { User } from './users.interface';
import { AuthToken } from '../auth/auth.interfaces';
import { CreateUserDto } from './dto/create-user.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { PublicAuthTokenDto } from '../auth/dto/auth-token.dto';
import { SigninDto } from './dto/signin.dto';
import { Transaction } from './users.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  public signup(dto: CreateUserDto): PublicUserDto {
    // Verificações de dados e lançamento de exceções
    if (!dto.username || !dto.password) {
      throw new BadRequestException('Username ou password inválidos');
    }

    const exists = this.usersRepository.findByUsername(dto.username);
    if (exists) {
      throw new BadRequestException('Usuário já cadastrado');
    }

    // Criação do usuário e retorno do DTO público, sem campos sensíveis (password)
    const user = this.usersRepository.create(dto);
    return new PublicUserDto(user);
  }

  public signin(dto: SigninDto): PublicAuthTokenDto {
    // Verificações de dados e lançamento de exceções
    if (!dto.username || !dto.password) {
      throw new BadRequestException('Username ou password inválidos');
    }

    const user = this.usersRepository.findByUsername(dto.username);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Username ou password inválidos');
    }

    const authToken = this.authRepository.createToken(user.id);
    return new PublicAuthTokenDto(authToken);
  }

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
      throw new UnauthorizedException('Usuário não encontrado');
    }
    return user;
  }

  public getAllUsers(token: string): PublicUserDto[] {
    this.validateToken(token);

    const users = this.usersRepository.findAllActive();
    return users.map((user) => new PublicUserDto(user));
  }

  public getUserBalance(token: string): number {
    const authToken = this.validateToken(token);
    const user = this.validateUser(authToken.userId);

    return user.balance;
  }

  public getUserTransactions(token: string): Transaction[] {
    const authToken = this.validateToken(token);
    const user = this.validateUser(authToken.userId);

    return user.transactions;
  }

  public updateUser(token: string, dto: UpdateUserDto): PublicUserDto {
    const authToken = this.validateToken(token);
    const user = this.validateUser(authToken.userId);

    // Nessa implementação, apenas o birthdate é atualizável. A senha tambem poderia ser, mas o ideal é ter um fluxo prórpio de updatePassword.
    if (dto.birthdate) {
      user.birthdate = dto.birthdate;
    }

    this.usersRepository.update(user);
    return new PublicUserDto(user);
  }

  public deleteUser(token: string): void {
    const authToken = this.validateToken(token);
    const user = this.validateUser(authToken.userId);

    this.usersRepository.softDelete(user.id);
    this.authRepository.expireToken(token);
  }
}
