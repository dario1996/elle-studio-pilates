export interface Token {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

// Legacy interface for backward compatibility
export interface TokenLegacy {
  token: string;
}
