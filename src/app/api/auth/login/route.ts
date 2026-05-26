import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/server/validation/auth-schemas';
import { getDb } from '@/server/db/client';
import { verifyPassword } from '@/server/auth/password';
import { signToken } from '@/server/auth/jwt';
import { setAuthCookie } from '@/server/auth/cookies';

export const runtime = 'nodejs';

// Dummy hash used for constant-time comparison when user is not found.
// Pre-computed bcrypt hash of a random string at cost 10.
const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ01234';

interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Parse JSON body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  // 2. Validate with zod
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || 'unknown';
      fields[key] = issue.message;
    }
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Validation failed', fields } },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  // 3. Query user
  const db = getDb();
  const user = db
    .prepare<[string], DbUser>('SELECT id, email, password_hash, name FROM users WHERE email = ?')
    .get(email);

  // 4. User not found — delay to mitigate timing attacks, then return same error
  if (!user) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    // Perform a dummy bcrypt compare so timing is similar to a real compare
    await verifyPassword(password, DUMMY_HASH).catch(() => false);
    return NextResponse.json(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
      { status: 401 }
    );
  }

  // 5. Verify password
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
      { status: 401 }
    );
  }

  // 6. Sign JWT
  const token = signToken({ sub: user.id, email: user.email });

  // 7. Build response with cookie
  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });
  setAuthCookie(response, token);

  return response;
}
