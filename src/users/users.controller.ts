import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SigninDto } from './dto/signin.dto';

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

    // API 2: login de usuário. (API pública)
    @Post('signin')
    @HttpCode(HttpStatus.OK)
    signin(@Body() dto: SigninDto) {
        try {
            const authToken = this.usersService.signin(dto);
            return { token: authToken.token, expiresAt: authToken.expiresAt };
        }
        catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Erro ao realizar login');
        }
    }
}
    