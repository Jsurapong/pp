import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  email: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    // Development fallback — never used in production
    return 'dev-secret-change-in-production-must-be-32-chars';
  }
  return secret;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: '1h',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ['HS256'] }) as jwt.JwtPayload;
    if (typeof decoded.sub === 'string' && typeof decoded.email === 'string') {
      return { sub: decoded.sub, email: decoded.email };
    }
    return null;
  } catch {
    return null;
  }
}
