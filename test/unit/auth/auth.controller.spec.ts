import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { AuthToken } from '../../../src/auth/auth.interfaces';
import { PublicAuthTokenDto } from '../../../src/auth/dto/auth-token.dto';

const mockAuthToken = (overrides: Partial<AuthToken> = {}): AuthToken => ({
    id: 'uuid-1',
    userId: 'uuid-1',
    token: 'token-1',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    expired: false,
    ...overrides,
});

const mockPublicAuthTokenDto = (overrides: Partial<AuthToken> = {}): PublicAuthTokenDto =>
    new PublicAuthTokenDto(mockAuthToken(overrides));

describe('AuthController', () => {
    let controller: AuthController;
    let service: jest.Mocked<AuthService>;

    beforeEach(() => {
        service = {
            refreshToken: jest.fn(),
            logout: jest.fn(),
            validateToken: jest.fn(),
        } as unknown as jest.Mocked<AuthService>;

        controller = new AuthController(service);
    });

    describe('refreshToken', () => {
        it('deve retornar newToken quando o token é renovado com sucesso', () => {
            const expectedToken = 'token-1';
            service.refreshToken.mockReturnValue(mockPublicAuthTokenDto({ token: expectedToken }));

            const result = controller.refreshToken('someToken');

            expect(result.token).toEqual(expectedToken);
        });

        it('deve chamar service.refreshToken com o token recebido', () => {
            service.refreshToken.mockReturnValue(mockPublicAuthTokenDto());

            controller.refreshToken('someToken');

            expect(service.refreshToken).toHaveBeenCalledWith('someToken');
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.refreshToken.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.refreshToken('someToken')
            ).toThrow(BadRequestException);
        });

        it('deve preservar BadRequestException original da service', () => {
            service.refreshToken.mockImplementation(() => {
                throw new BadRequestException('Token inválido');
            });

            try {
                controller.refreshToken('');
            } catch (err) {
                expect(err).toBeInstanceOf(BadRequestException);
                expect((err as BadRequestException).message).toBe('Token inválido');
            }
        });

        it('deve preservar UnauthorizedException original da service', () => {
            service.refreshToken.mockImplementation(() => {
                throw new UnauthorizedException('Token inválido ou expirado');
            });

            try {
                controller.refreshToken('token-expirado');
            } catch (err) {
                expect(err).toBeInstanceOf(UnauthorizedException);
                expect((err as UnauthorizedException).message).toBe('Token inválido ou expirado');
            }
        });
    });

    describe('logout', () => {
        it('deve chamar service.logout com o token recebido', () => {
            controller.logout('someToken');

            expect(service.logout).toHaveBeenCalledWith('someToken');
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.logout.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.logout('someToken')
            ).toThrow(BadRequestException);
        });

        it('deve preservar BadRequestException original da service', () => {
            service.logout.mockImplementation(() => {
                throw new BadRequestException('Token inválido');
            });

            try {
                controller.logout('');
            } catch (err) {
                expect(err).toBeInstanceOf(BadRequestException);
                expect((err as BadRequestException).message).toBe('Token inválido');
            }
        });
    });

    describe('validateToken', () => {
        it('deve retornar { valid: true } se token for válido', () => {
            service.validateToken.mockReturnValue(true);

            const result = controller.validateToken('someToken');

            expect(result).toEqual({ valid: true });
        });

        it('deve lançar UnauthorizedException se token for inválido ou expirado', () => {
            service.validateToken.mockReturnValue(false);

            expect(() =>
                controller.validateToken('token-invalido')
            ).toThrow(UnauthorizedException);
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.validateToken.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.validateToken('someToken')
            ).toThrow(BadRequestException);
        });
    });
});
