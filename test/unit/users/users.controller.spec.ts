import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { PublicUserDto } from '../../../src/users/dto/public-user.dto';
import { AuthToken } from '../../../src/auth/auth.interfaces';

const mockPublicUser = (overrides: Partial<PublicUserDto> = {}): PublicUserDto =>
    Object.assign(new PublicUserDto({
        id: 'uuid-1',
        username: 'joao',
        password: '123456',
        birthdate: '2000-01-01',
        balance: 0,
        transactions: [],
    }), overrides);

const mockAuthToken = (overrides: Partial<AuthToken> = {}): AuthToken => ({
    id: 'uuid-1',
    userId: 'uuid-1',
    token: 'token-1',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    expired: false,
    ...overrides,
});

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    beforeEach(() => {
        service = {
            signup: jest.fn(),
            signin: jest.fn(),
            getAllUsers: jest.fn(),
            getUserBalance: jest.fn(),
        } as unknown as jest.Mocked<UsersService>;

        controller = new UsersController(service);
    });

    describe('signup', () => {
        it('deve retornar { id } quando a service cria o usuário com sucesso', () => {
            service.signup.mockReturnValue(mockPublicUser({ id: 'uuid-1' }));

            const result = controller.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' });

            expect(result).toEqual({ id: 'uuid-1' });
        });

        it('deve chamar service.signup com o dto recebido', () => {
            service.signup.mockReturnValue(mockPublicUser());

            const dto = { username: 'joao', password: '123456', birthdate: '2000-01-01' };
            controller.signup(dto);

            expect(service.signup).toHaveBeenCalledWith(dto);
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.signup.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' })
            ).toThrow(BadRequestException);
        });

        it('deve preservar a mensagem da BadRequestException original da service', () => {
            service.signup.mockImplementation(() => {
                throw new BadRequestException('Usuário já cadastrado');
            });

            try {
                controller.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' });
            } catch (err) {
                expect(err).toBeInstanceOf(BadRequestException);
                expect((err as BadRequestException).message).toBe('Usuário já cadastrado');
            }
        });
    });

    describe('signin', () => {
        it('deve retornar { token, expiresAt } quando o login é feito com sucesso', () => {
            const expectedToken = 'token-1';
            service.signin.mockReturnValue(mockAuthToken({ token: expectedToken }) as any);

            const result = controller.signin({ username: 'joao', password: '123456' });

            expect(result.token).toEqual(expectedToken);
        });

        it('deve chamar service.signin com o dto recebido', () => {
            service.signin.mockReturnValue(mockAuthToken() as any);

            const dto = { username: 'joao', password: '123456' };
            controller.signin(dto);

            expect(service.signin).toHaveBeenCalledWith(dto);
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.signin.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.signin({ username: 'joao', password: '123456' })
            ).toThrow(BadRequestException);
        });

        it('deve preservar a mensagem da BadRequestException original da service', () => {
            const errorMessage = 'Username ou password inválidos';
            service.signin.mockImplementation(() => {
                throw new BadRequestException(errorMessage);
            });

            try {
                controller.signin({ username: 'joao', password: '123456' });
            } catch (err) {
                expect(err).toBeInstanceOf(BadRequestException);
                expect((err as BadRequestException).message).toBe(errorMessage);
            }
        });
    });

    describe('getAllUsers', () => {
        it('deve retornar uma lista de usuários quando o token é válido', () => {
            const expectedUserId = 'uuid-1';
            service.getAllUsers.mockReturnValue([mockPublicUser({ id: expectedUserId })]);

            const result = controller.getAllUsers('token-1');

            expect(result.length).toBeGreaterThan(0);
            expect(result[0].id).toBe(expectedUserId);
        });

        it('deve chamar service.getAllUsers com o token recebido', () => {
            service.getAllUsers.mockReturnValue([]);

            controller.getAllUsers('token-1');

            expect(service.getAllUsers).toHaveBeenCalledWith('token-1');
        });

        it('deve preservar UnauthorizedException original da service', () => {
            service.getAllUsers.mockImplementation(() => {
                throw new UnauthorizedException('Você não tem permissão para consultar usuários');
            });

            try {
                controller.getAllUsers('token-invalido');
            } catch (err) {
                expect(err).toBeInstanceOf(UnauthorizedException);
            }
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.getAllUsers.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.getAllUsers('token-1')
            ).toThrow(BadRequestException);
        });
    });

    describe('getBalance', () => {
        it('deve retornar { balance } quando o token é válido', () => {
            service.getUserBalance.mockReturnValue(150);

            const result = controller.getBalance('token-1');

            expect(result).toEqual({ balance: 150 });
        });

        it('deve chamar service.getUserBalance com o token recebido', () => {
            service.getUserBalance.mockReturnValue(0);

            controller.getBalance('token-1');

            expect(service.getUserBalance).toHaveBeenCalledWith('token-1');
        });

        it('deve preservar UnauthorizedException original da service', () => {
            service.getUserBalance.mockImplementation(() => {
                throw new UnauthorizedException('Você não tem permissão para consultar saldo');
            });

            try {
                controller.getBalance('token-invalido');
            } catch (err) {
                expect(err).toBeInstanceOf(UnauthorizedException);
            }
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.getUserBalance.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.getBalance('token-1')
            ).toThrow(BadRequestException);
        });
    });
});
