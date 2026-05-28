import { BadRequestException } from '@nestjs/common';
import { UsersService } from '../../../src/users/users.service';
import { UsersRepository } from '../../../src/users/users.repository';
import { User } from '../../../src/users/users.interface';

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

describe('UsersService', () => {
    let service: UsersService;
    let repository: jest.Mocked<UsersRepository>;

    beforeEach(() => {
        // Cria um mock do repository — substitui todos os métodos por jest.fn()
        repository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByUsername: jest.fn(),
            create: jest.fn(),
        } as unknown as jest.Mocked<UsersRepository>;

        service = new UsersService(repository);
    });

    describe('signup', () => {
        it('deve criar usuário e retornar PublicUserDto sem a senha', () => {
            repository.findByUsername.mockReturnValue(undefined);
            repository.create.mockReturnValue(mockUser());

            const result = service.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' });

            expect(result.id).toBe('uuid-1');
            expect(result.username).toBe('joao');
            expect((result as any).password).toBeUndefined();
        });

        it('deve chamar repository.create com os dados informados', () => {
            repository.findByUsername.mockReturnValue(undefined);
            repository.create.mockReturnValue(mockUser());

            const dto = { username: 'joao', password: '123456', birthdate: '2000-01-01' };
            service.signup(dto);

            expect(repository.create).toHaveBeenCalledWith(dto);
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
            repository.findByUsername.mockReturnValue(mockUser());

            expect(() =>
                service.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' })
            ).toThrow(BadRequestException);
        });

        it('não deve chamar repository.create se o usuário já existir', () => {
            repository.findByUsername.mockReturnValue(mockUser());

            try { service.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' }); }
            catch {}

            expect(repository.create).not.toHaveBeenCalled();
        });
    });
});
