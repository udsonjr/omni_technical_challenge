import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {

    constructor(private readonly authRepository: AuthRepository) {}

    public refreshToken(token: string): { token: string; expiresIn: string } {
        if (!token) {
            throw new BadRequestException('Token inválido');
        }

        const newAuthToken = this.authRepository.refreshToken(token);
        if (!newAuthToken) {
            throw new UnauthorizedException('Token inválido ou expirado');
        }

        return { token: newAuthToken.token, expiresIn: '1h' };
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
