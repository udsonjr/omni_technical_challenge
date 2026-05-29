import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../../src/users/users.service';
import { UsersRepository } from '../../../src/users/users.repository';
import { AuthRepository } from '../../../src/auth/auth.repository';
import { User } from '../../../src/users/users.interface';
import { AuthToken } from '../../../src/auth/auth.interfaces';

// Fábrica de usuário para reutilizar nos testes
const mockUser = (overrides: Partial<User> = {}): User => ({
    id: 'uuid-1',
    username: 'joao',
    password: '123456',
    birthdate: '2000-01-01',
    balance: 0,
    transactions: [],
    ...overrides,
});

const mockAuthToken = (overrides: Partial<AuthToken> = {}): AuthToken => ({
        id: 'uuid-1',
        userId: 'uuid-1',
        token: 'token-1',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        expired: false,
        ...overrides,
    });

describe('UsersService', () => {
    let service: UsersService;
    let usersRepository: jest.Mocked<UsersRepository>;
    let authRepository: jest.Mocked<AuthRepository>;

    beforeEach(() => {
        // Cria um mock do usersRepository — substitui todos os métodos por jest.fn()
        usersRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
        } as unknown as jest.Mocked<UsersRepository>;

        authRepository = {
            createToken: jest.fn(),
            refreshToken: jest.fn(),
            expireToken: jest.fn(),
            validateToken: jest.fn(),
        } as unknown as jest.Mocked<AuthRepository>;

        service = new UsersService(usersRepository, authRepository);
    });

    describe('signup', () => {
        it('deve criar usuário e retornar PublicUserDto sem a senha', () => {
            usersRepository.findByUsername.mockReturnValue(undefined);
            usersRepository.create.mockReturnValue(mockUser());

            const result = service.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' });

            expect(result.id).toBe('uuid-1');
            expect(result.username).toBe('joao');
            expect((result as any).password).toBeUndefined();
        });

        it('deve chamar usersRepository.create com os dados informados', () => {
            usersRepository.findByUsername.mockReturnValue(undefined);
            usersRepository.create.mockReturnValue(mockUser());

            const dto = { username: 'joao', password: '123456', birthdate: '2000-01-01' };
            service.signup(dto);

            expect(usersRepository.create).toHaveBeenCalledWith(dto);
        });

        it('deve lançar BadRequestException se username estiver vazio', () => {
            expect(() =>
                service.signup({ username: '', password: '123456', birthdate: '2000-01-01' })
            ).toThrow(BadRequestException);
        });

        it('deve lançar BadRequestException se password estiver vazio', () => {
            expect(() =>
                service.signup({ username: 'joao', password: '', birthdate: '2000-01-01' })
            ).toThrow(BadRequestException);
        });

        it('deve lançar BadRequestException se usuário já existir', () => {
            usersRepository.findByUsername.mockReturnValue(mockUser());

            expect(() =>
                service.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' })
            ).toThrow(BadRequestException);
        });

        it('não deve chamar usersRepository.create se o usuário já existir', () => {
            usersRepository.findByUsername.mockReturnValue(mockUser());

            try { service.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' }); }
            catch {}

            expect(usersRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('signin', () => {
        it('deve logar usuário e retornar token e expiresIn', () => {
            const expectedToken = 'token-1';
            usersRepository.findByUsername.mockReturnValue(mockUser());
            authRepository.createToken.mockReturnValue(mockAuthToken({ token: expectedToken }));

            const result = service.signin({ username: 'joao', password: '123456'});

            expect(result.token).toBe(expectedToken);
        });

        it('deve chamar authRepository.createToken com os dados informados', () => {
            const expectedUserId = 'uuid-1';
            usersRepository.findByUsername.mockReturnValue(mockUser({ id: expectedUserId }));
            authRepository.createToken.mockReturnValue(mockAuthToken({ userId: expectedUserId, token: 'token-1' }));

            const dto = { username: 'joao', password: '123456', birthdate: '2000-01-01' };
            service.signin(dto);

            expect(authRepository.createToken).toHaveBeenCalledWith(expectedUserId);
        });

        it('deve lançar BadRequestException se username estiver vazio', () => {
            expect(() =>
                service.signin({ username: '', password: '123456' })
            ).toThrow(BadRequestException);
        });

        it('deve lançar BadRequestException se password estiver vazio', () => {
            expect(() =>
                service.signin({ username: 'joao', password: '' })
            ).toThrow(BadRequestException);
        });

        it('deve lançar UnauthorizedException se usuário não existir', () => {
            usersRepository.findByUsername.mockReturnValue(undefined);

            expect(() =>
                service.signin({ username: 'joao', password: '123456' })
            ).toThrow(UnauthorizedException);
        });

        it('não deve chamar authRepository.createToken se credenciais forem inválidas', () => {
            usersRepository.findByUsername.mockReturnValue(undefined);

            try { service.signin({ username: 'joao', password: '123456' }); }
            catch {}

            expect(authRepository.createToken).not.toHaveBeenCalled();
        });
    });

    describe('getAllUsers', () => {
        it('deve retornar lista de PublicUserDto quando token é válido', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken());
            usersRepository.findAll.mockReturnValue([mockUser()]);

            const result = service.getAllUsers('token-1');

            expect(result.length).toBe(1);
            expect(result[0].id).toBe('uuid-1');
            expect((result[0] as any).password).toBeUndefined();
        });

        it('deve chamar usersRepository.findAll quando token é válido', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken());
            usersRepository.findAll.mockReturnValue([]);

            service.getAllUsers('token-1');

            expect(usersRepository.findAll).toHaveBeenCalled();
        });

        it('deve lançar UnauthorizedException se token for inválido', () => {
            authRepository.validateToken.mockReturnValue(undefined);

            expect(() =>
                service.getAllUsers('token-invalido')
            ).toThrow(UnauthorizedException);
        });

        it('não deve chamar usersRepository.findAll se token for inválido', () => {
            authRepository.validateToken.mockReturnValue(undefined);

            try { service.getAllUsers('token-invalido'); }
            catch {}

            expect(usersRepository.findAll).not.toHaveBeenCalled();
        });
    });

    describe('getUserBalance', () => {
        it('deve retornar o saldo do usuário autenticado', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById.mockReturnValue(mockUser({ id: 'uuid-1', balance: 250 }));

            const result = service.getUserBalance('token-1');

            expect(result).toBe(250);
        });

        it('deve chamar usersRepository.findById com o userId do token', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById.mockReturnValue(mockUser());

            service.getUserBalance('token-1');

            expect(usersRepository.findById).toHaveBeenCalledWith('uuid-1');
        });

        it('deve lançar UnauthorizedException se token for inválido', () => {
            authRepository.validateToken.mockReturnValue(undefined);

            expect(() =>
                service.getUserBalance('token-invalido')
            ).toThrow(UnauthorizedException);
        });

        it('deve lançar UnauthorizedException se usuário não for encontrado', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken());
            usersRepository.findById.mockReturnValue(undefined);

            expect(() =>
                service.getUserBalance('token-1')
            ).toThrow(UnauthorizedException);
        });
    });
});
