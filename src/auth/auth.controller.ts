import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BearerToken } from './bearer-token.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    // API 3: Refresh token (Bearer token)
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refreshToken(@BearerToken() token: string) {
        try {
            return this.authService.refreshToken(token);
        }
        catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Erro ao renovar token');
        }
    }
}
