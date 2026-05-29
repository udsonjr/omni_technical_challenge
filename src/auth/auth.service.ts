import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { PublicAuthTokenDto } from './dto/auth-token.dto';

@Injectable()
export class AuthService {

    constructor(private readonly authRepository: AuthRepository) {}

    public refreshToken(token: string): PublicAuthTokenDto {
        if (!token) {
            throw new BadRequestException('Token inválido');
        }

        const newAuthToken = this.authRepository.refreshToken(token);
        if (!newAuthToken) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }

        return new PublicAuthTokenDto(newAuthToken);
    }

    public logout(token: string): void {
        if (!token) {
            throw new BadRequestException('Token inválido');
        }

        this.authRepository.expireToken(token);
    }

    public validateToken(token: string): boolean {
        return this.authRepository.validateToken(token) !== undefined;
    }
}
