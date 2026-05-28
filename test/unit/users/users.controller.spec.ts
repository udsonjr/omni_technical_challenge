import { BadRequestException } from '@nestjs/common';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { PublicUserDto } from '../../../src/users/dto/public-user.dto';
import { mock } from 'node:test';

const mockPublicUser = (overrides: Partial<PublicUserDto> = {}): PublicUserDto =>
    Object.assign(new PublicUserDto({
        id: 'uuid-1',
        username: 'joao',
        password: '123456',
        birthdate: '2000-01-01',
        balance: 0,
        transactions: [],
    }), overrides);

describe('UsersController', () => {
    let controller: UsersController;
    let service: jest.Mocked<UsersService>;

    beforeEach(() => {
        // Cria um mock da service — o controller não deve conhecer a implementação interna
        service = {
            signup: jest.fn(),
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

        it('deve relançar BadRequestException vinda da service', () => {
            service.signup.mockImplementation(() => {
                throw new BadRequestException('Usuário já cadastrado');
            });

            expect(() =>
                controller.signup({ username: 'joao', password: '123456', birthdate: '2000-01-01' })
            ).toThrow(BadRequestException);
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
});
