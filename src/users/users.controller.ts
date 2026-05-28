import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { BadRequestException } from '@nestjs/common';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    // API 1: cadastro de usuário. (API pública)
    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body() dto: CreateUserDto) {
        /*
        O uso de try/catch aqui é para tratar exceções de forma genérica. 
        No caso do desafio, o uso de permanência em memória limita a possibilidade de erros, mas em um cenário real, ele se torna importante.
        */
        try {
            const user = this.usersService.signup(dto);
            return { id: user.id };
        }
        catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Erro ao cadastrar usuário');
        }
    }
}
    