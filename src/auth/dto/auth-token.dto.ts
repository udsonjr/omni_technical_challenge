import { AuthToken } from '../auth.interfaces';

export class PublicAuthTokenDto {
  userId: string;
  token: string;
  expiresAt: Date;
  expired: boolean;

  constructor(authToken: AuthToken) {
    this.userId = authToken.userId;
    this.token = authToken.token;
    this.expiresAt = authToken.expiresAt;
    this.expired = authToken.expired;
  }
}
