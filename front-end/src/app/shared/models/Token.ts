export interface Token {
  email: any;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  nome?: string;
  cognome?: string;
  displayName?: string;
}

// Legacy interface for backward compatibility
export interface TokenLegacy {
  token: string;
}
