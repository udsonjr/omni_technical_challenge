import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../src/auth/auth.service';
import { AuthRepository } from '../../../src/auth/auth.repository';
import { AuthToken } from '../../../src/auth/auth.interfaces';

const mockAuthToken = (overrides: Partial<AuthToken> = {}): AuthToken => ({
        id: 'uuid-1',
        userId: 'uuid-1',
        token: 'token-1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        expired: false,
        ...overrides,
    });

describe('AuthService', () => {
    let service: AuthService;
    let authRepository: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        authRepository = {
            createToken: jest.fn(),
            refreshToken: jest.fn(),
            expireToken: jest.fn(),
            validateToken: jest.fn(),
        } as unknown as jest.Mocked<AuthRepository>;

        service = new AuthService(authRepository);
    });

    describe('refreshToken', () => {
        it('deve retornar newToken quando o token é renovado com sucesso', () => {
            const expectedToken = 'token-1';
            authRepository.refreshToken.mockReturnValue(mockAuthToken({ token: expectedToken, expiresAt: new Date(Date.now() + 1000 * 60 * 60) }));

            const result = service.refreshToken('someToken');

            expect(result.token).toEqual(expectedToken);
        });

        it('deve chamar authRepository.refreshToken com o token informado', () => {
            authRepository.refreshToken.mockReturnValue(mockAuthToken());

            service.refreshToken('someToken');

            expect(authRepository.refreshToken).toHaveBeenCalledWith('someToken');
        });

        it('deve lançar BadRequestException se token estiver vazio', () => {
            expect(() =>
                service.refreshToken('')
            ).toThrow(BadRequestException);
        });

        it('não deve chamar authRepository.refreshToken se token estiver vazio', () => {
            try { service.refreshToken(''); }
            catch {}

            expect(authRepository.refreshToken).not.toHaveBeenCalled();
        });

        it('deve lançar UnauthorizedException se token for inválido ou expirado', () => {
            authRepository.refreshToken.mockReturnValue(undefined);

            expect(() =>
                service.refreshToken('token-invalido')
            ).toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('deve chamar authRepository.expireToken com o token informado', () => {
            service.logout('someToken');

            expect(authRepository.expireToken).toHaveBeenCalledWith('someToken');
        });

        it('deve lançar BadRequestException se token estiver vazio', () => {
            expect(() =>
                service.logout('')
            ).toThrow(BadRequestException);
        });

        it('não deve chamar authRepository.expireToken se token estiver vazio', () => {
            try { service.logout(''); }
            catch {}

            expect(authRepository.expireToken).not.toHaveBeenCalled();
        });
    });

    describe('validateToken', () => {
        it('deve retornar true se token for válido', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken());

            const result = service.validateToken('someToken');

            expect(result).toBe(true);
        });

        it('deve retornar false se token for inválido ou expirado', () => {
            authRepository.validateToken.mockReturnValue(undefined);

            const result = service.validateToken('token-invalido');

            expect(result).toBe(false);
        });
    });
});
