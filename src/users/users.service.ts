import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';
import { PublicUserDto } from './dto/public-user.dto';

@Injectable()
export class UsersService {

    constructor(private readonly usersRepository: UsersRepository) {}

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
}
