import { Injectable } from '@nestjs/common';
import { AuthToken } from './auth.interfaces';

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthRepository {
  // Simula um "banco de dados" com tokens vazios
  private tokens: AuthToken[] = [];

  createToken(userId: string): AuthToken {
    const now = new Date();
    const authToken: AuthToken = {
      id: crypto.randomUUID(),
      userId,
      token: crypto.randomUUID(),
      createdAt: now,
      expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
      expired: false,
    };
    this.tokens.push(authToken);
    return authToken;
  }

  findByToken(token: string): AuthToken | undefined {
    return this.tokens.find((t) => t.token === token);
  }

  findByUserId(userId: string): AuthToken[] {
    return this.tokens.filter((t) => t.userId === userId);
  }

  validateToken(token: string): AuthToken | undefined {
    const authToken = this.findByToken(token);
    if (!authToken || authToken.expired) return undefined;
    if (new Date() > authToken.expiresAt) {
      authToken.expired = true;
      return undefined;
    }
    return authToken;
  }

  refreshToken(oldToken: string): AuthToken | undefined {
    const existing = this.validateToken(oldToken);
    if (!existing) return undefined;
    existing.expired = true;
    return this.createToken(existing.userId);
  }

  expireToken(token: string): boolean {
    const authToken = this.findByToken(token);
    if (!authToken) return false;
    authToken.expired = true;
    return true;
  }
}
