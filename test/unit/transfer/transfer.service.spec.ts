import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TransferService } from '../../../src/transfer/transfer.service';
import { TransferRepository } from '../../../src/transfer/transfer.repository';
import { AuthRepository } from '../../../src/auth/auth.repository';
import { UsersRepository } from '../../../src/users/users.repository';
import { Transfer } from '../../../src/transfer/transfer.interfaces';
import { User } from '../../../src/users/users.interface';
import { AuthToken } from '../../../src/auth/auth.interfaces';

const mockUser = (overrides: Partial<User> = {}): User => ({
    id: 'uuid-1',
    username: 'joao',
    password: '123456',
    birthdate: '2000-01-01',
    balance: 500,
    transactions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
});

const mockAuthToken = (overrides: Partial<AuthToken> = {}): AuthToken => ({
    id: 'uuid-token',
    userId: 'uuid-1',
    token: 'token-1',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    expired: false,
    ...overrides,
});

const mockTransfer = (overrides: Partial<Transfer> = {}): Transfer => ({
    id: 'transfer-uuid',
    fromUserId: 'uuid-1',
    toUserId: 'uuid-2',
    amount: 100,
    date: new Date().toISOString(),
    ...overrides,
});

describe('TransferService', () => {
    let service: TransferService;
    let transferRepository: jest.Mocked<TransferRepository>;
    let authRepository: jest.Mocked<AuthRepository>;
    let usersRepository: jest.Mocked<UsersRepository>;

    beforeEach(() => {
        transferRepository = {
            createTransfer: jest.fn(),
            findAllByUserId: jest.fn(),
        } as unknown as jest.Mocked<TransferRepository>;

        authRepository = {
            validateToken: jest.fn(),
        } as unknown as jest.Mocked<AuthRepository>;

        usersRepository = {
            findById: jest.fn(),
        } as unknown as jest.Mocked<UsersRepository>;

        service = new TransferService(transferRepository, authRepository, usersRepository);
    });

    describe('transfer', () => {
        it('deve realizar a transferência com sucesso e retornar o Transfer', () => {
            const expectedTransfer = mockTransfer();
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }))
                .mockReturnValueOnce(mockUser({ id: 'uuid-2', username: 'maria' }));
            transferRepository.createTransfer.mockReturnValue(expectedTransfer);

            const result = service.transfer('token-1', { toId: 'uuid-2', amount: 100 });

            expect(result).toEqual(expectedTransfer);
        });

        it('deve chamar transferRepository.createTransfer com toUserId, fromUserId e amount corretos', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }))
                .mockReturnValueOnce(mockUser({ id: 'uuid-2', username: 'maria' }));
            transferRepository.createTransfer.mockReturnValue(mockTransfer());

            service.transfer('token-1', { toId: 'uuid-2', amount: 200 });

            expect(transferRepository.createTransfer).toHaveBeenCalledWith('uuid-2', 'uuid-1', 200);
        });

        it('deve lançar UnauthorizedException se o token for inválido', () => {
            authRepository.validateToken.mockReturnValue(undefined);

            expect(() =>
                service.transfer('token-invalido', { toId: 'uuid-2', amount: 100 })
            ).toThrow(UnauthorizedException);
        });

        it('não deve chamar transferRepository.createTransfer se o token for inválido', () => {
            authRepository.validateToken.mockReturnValue(undefined);

            try { service.transfer('token-invalido', { toId: 'uuid-2', amount: 100 }); }
            catch {}

            expect(transferRepository.createTransfer).not.toHaveBeenCalled();
        });

        it('deve lançar UnauthorizedException se o usuário de origem não for encontrado', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById.mockReturnValueOnce(undefined);

            expect(() =>
                service.transfer('token-1', { toId: 'uuid-2', amount: 100 })
            ).toThrow(UnauthorizedException);
        });

        it('deve lançar UnauthorizedException se o usuário de destino não for encontrado', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }))
                .mockReturnValueOnce(undefined);

            expect(() =>
                service.transfer('token-1', { toId: 'uuid-inexistente', amount: 100 })
            ).toThrow(UnauthorizedException);
        });

        it('deve lançar BadRequestException se fromUser e toUser forem o mesmo usuário', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }))
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }));

            expect(() =>
                service.transfer('token-1', { toId: 'uuid-1', amount: 100 })
            ).toThrow(BadRequestException);
        });

        it('não deve chamar transferRepository.createTransfer se fromUser === toUser', () => {
            authRepository.validateToken.mockReturnValue(mockAuthToken({ userId: 'uuid-1' }));
            usersRepository.findById
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }))
                .mockReturnValueOnce(mockUser({ id: 'uuid-1' }));

            try { service.transfer('token-1', { toId: 'uuid-1', amount: 100 }); }
            catch {}

            expect(transferRepository.createTransfer).not.toHaveBeenCalled();
        });
    });
});
