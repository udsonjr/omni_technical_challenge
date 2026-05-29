import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '../auth/auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { PublicAuthTokenDto } from '../auth/dto/auth-token.dto';
import { SigninDto } from './dto/signin.dto';

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
}
