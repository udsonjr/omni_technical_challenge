export interface AuthToken {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  expired: boolean;
}
