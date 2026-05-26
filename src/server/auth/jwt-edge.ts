import { jwtVerify } from 'jose';

interface TokenPayload {
  sub: string;
  email: string;
}

export async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = process.env.JWT_SECRET ?? 'dev-secret-change-in-production-must-be-32-chars';
    const encoded = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, encoded, { algorithms: ['HS256'] });

    if (typeof payload.sub === 'string' && typeof payload['email'] === 'string') {
      return { sub: payload.sub, email: payload['email'] as string };
    }
    return null;
  } catch {
    return null;
  }
}
