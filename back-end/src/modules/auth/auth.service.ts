import { ValidationError } from '../../errors/app-error.js';
import { env } from '../../config/env.js';

interface Credentials {
  username: string;
  password: string;
}

class AuthService {
  private readonly users = new Map<string, string>();

  constructor() {
    this.users.set(env.adminUser, env.adminPass);
  }

  validate({ username, password }: Credentials): boolean {
    const expected = this.users.get(username);
    return typeof expected === 'string' && expected === password;
  }

  register({ username, password }: Credentials): void {
    if (this.users.has(username)) {
      throw new ValidationError('Usuário já cadastrado', [
        { path: 'username', message: 'Este usuário já existe' },
      ]);
    }
    this.users.set(username, password);
  }
}

export const authService = new AuthService();