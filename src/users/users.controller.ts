import { Controller, Post, Body, HttpCode, HttpStatus, Get, Put, Delete } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SigninDto } from './dto/signin.dto';
import { BearerToken } from '../auth/bearer-token.decorator';

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
    } catch (error) {
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
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao realizar login');
    }
  }

  // API 4: lista de usuários. (Autenticada)
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllUsers(@BearerToken() token: string) {
    try {
      return this.usersService.getAllUsers(token);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao consultar usuários');
    }
  }

  // API 5: Saldo de usuário. (Autenticada)
  @Get('me/balance')
  @HttpCode(HttpStatus.OK)
  getBalance(@BearerToken() token: string) {
    try {
      const balance = this.usersService.getUserBalance(token);
      return { balance: balance };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao consultar saldo');
    }
  }

  // API 6: Histórico de transações do usuário. (Autenticada)
  @Get('me/transactions')
  @HttpCode(HttpStatus.OK)
  getTransactions(@BearerToken() token: string) {
    try {
      return this.usersService.getUserTransactions(token);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao consultar transações');
    }
  }

  // API 8: Atualizar dados do usuário. (Autenticada)
  @Put('me')
  @HttpCode(HttpStatus.OK)
  updateUser(@BearerToken() token: string, @Body() dto: UpdateUserDto) {
    try {
      return this.usersService.updateUser(token, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar informações');
    }
  }

  // API 9: Excluir usuário. (Autenticada)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@BearerToken() token: string) {
    try {
      return this.usersService.deleteUser(token);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao deletar usuário');
    }
  }
}
