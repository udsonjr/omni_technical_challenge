import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BearerToken } from './bearer-token.decorator';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    // API 3a: Refresh token (Bearer token)
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

    // API 3b: Logout = expire token (Bearer token)
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout(@BearerToken() token: string) {
        try {
            return this.authService.logout(token);
        }
        catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Erro ao expirar token');
        }
    }

    // API 3c: Validate token (Bearer token)
    @Post('validate')
    @HttpCode(HttpStatus.OK)
    validateToken(@BearerToken() token: string) {
        try {
            if (!this.authService.validateToken(token)) {
                throw new UnauthorizedException('Token inválido ou expirado');
            }
            return { valid: true };
        }
        catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Erro ao validar token');
        }
    }
}
