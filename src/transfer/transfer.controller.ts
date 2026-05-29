import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { BearerToken } from '../auth/bearer-token.decorator';
import { TransferService } from './transfer.service';
import { TransferRequestDto } from './dto/transfer-request.dto';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  // API 7: Transferência de dinheiro entre usuários (Autenticado)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  refreshToken(@BearerToken() token: string, @Body() dto: TransferRequestDto) {
    try {
      this.transferService.transfer(token, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao realizar transferência');
    }
  }
}
