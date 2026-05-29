// Estrutura de um usuário na memória
export interface User {
    id: string;
    username: string;
    password: string;
    birthdate: string;
    balance: number;
    transactions: Transaction[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface Transaction {
    type: 'sent' | 'received';
    toId?: string;
    fromId?: string;
    amount: number;
    date: string;
}