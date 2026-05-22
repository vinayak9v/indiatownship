import { hashPassword, comparePassword, signTokens, verifyAccessToken } from '../src/services/auth.service';

describe('hashPassword', () => {
  it('returns a bcrypt hash different from the input', async () => {
    const hash = await hashPassword('mypassword123');
    expect(hash).not.toBe('mypassword123');
    expect(hash.startsWith('$2')).toBe(true);
  });
});

describe('comparePassword', () => {
  it('returns true for matching password', async () => {
    const hash = await hashPassword('secret');
    expect(await comparePassword('secret', hash)).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('secret');
    expect(await comparePassword('wrong', hash)).toBe(false);
  });
});

describe('signTokens + verifyAccessToken', () => {
  it('signs and verifies a token round-trip', () => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars!!';
    const { accessToken } = signTokens({ userId: 'abc123', role: 'user' });
    const payload = verifyAccessToken(accessToken);
    expect(payload.userId).toBe('abc123');
    expect(payload.role).toBe('user');
  });

  it('throws on invalid token', () => {
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
    expect(() => verifyAccessToken('bad.token.here')).toThrow();
  });
});
