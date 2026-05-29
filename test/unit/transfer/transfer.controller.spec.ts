import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TransferController } from '../../../src/transfer/transfer.controller';
import { TransferService } from '../../../src/transfer/transfer.service';
import { Transfer } from '../../../src/transfer/transfer.interfaces';

const mockTransfer = (overrides: Partial<Transfer> = {}): Transfer => ({
    id: 'transfer-uuid',
    fromUserId: 'uuid-1',
    toUserId: 'uuid-2',
    amount: 100,
    date: new Date().toISOString(),
    ...overrides,
});

describe('TransferController', () => {
    let controller: TransferController;
    let service: jest.Mocked<TransferService>;

    beforeEach(() => {
        service = {
            transfer: jest.fn(),
        } as unknown as jest.Mocked<TransferService>;

        controller = new TransferController(service);
    });

    describe('transfer (POST /transfer)', () => {
        it('deve chamar service.transfer com o token e dto recebidos', () => {
            service.transfer.mockReturnValue(mockTransfer());

            const dto = { toId: 'uuid-2', amount: 100 };
            controller.refreshToken('token-1', dto);

            expect(service.transfer).toHaveBeenCalledWith('token-1', dto);
        });

        it('deve retornar sem corpo quando a transferência é bem-sucedida', () => {
            service.transfer.mockReturnValue(mockTransfer());

            const result = controller.refreshToken('token-1', { toId: 'uuid-2', amount: 100 });

            expect(result).toBeUndefined();
        });

        it('deve preservar BadRequestException original da service', () => {
            service.transfer.mockImplementation(() => {
                throw new BadRequestException('Não é possível transferir para si mesmo');
            });

            try {
                controller.refreshToken('token-1', { toId: 'uuid-1', amount: 100 });
            } catch (err) {
                expect(err).toBeInstanceOf(BadRequestException);
                expect((err as BadRequestException).message).toBe('Não é possível transferir para si mesmo');
            }
        });

        it('deve preservar UnauthorizedException original da service', () => {
            service.transfer.mockImplementation(() => {
                throw new UnauthorizedException('Você não tem permissão para realizar esta ação');
            });

            try {
                controller.refreshToken('token-invalido', { toId: 'uuid-2', amount: 100 });
            } catch (err) {
                expect(err).toBeInstanceOf(UnauthorizedException);
            }
        });

        it('deve encapsular erro inesperado em BadRequestException genérica', () => {
            service.transfer.mockImplementation(() => {
                throw new Error('Erro interno inesperado');
            });

            expect(() =>
                controller.refreshToken('token-1', { toId: 'uuid-2', amount: 100 })
            ).toThrow(BadRequestException);
        });

        it('não deve chamar service.transfer mais de uma vez por requisição', () => {
            service.transfer.mockReturnValue(mockTransfer());

            controller.refreshToken('token-1', { toId: 'uuid-2', amount: 100 });

            expect(service.transfer).toHaveBeenCalledTimes(1);
        });
    });
});
