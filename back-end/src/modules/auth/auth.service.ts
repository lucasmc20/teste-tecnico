import { ValidationError } from '../../errors/app-error.js';
import { env } from '../../config/env.js';
import bcrypt from 'bcryptjs';

interface Credentials {
  username: string;
  password: string;
}

class AuthService {
  private readonly users = new Map<string, string>();

  constructor() {
    this.users.set(env.adminUser, bcrypt.hashSync(env.adminPass, 10));
  }

  validate({ username, password }: Credentials): boolean {
    const expectedHash = this.users.get(username);
    if (!expectedHash) return false;
    return bcrypt.compareSync(password, expectedHash);
  }

  exists(username: string): boolean {
    return this.users.has(username);
  }

  register({ username, password }: Credentials): void {
    if (this.users.has(username)) {
      throw new ValidationError('Usuário já cadastrado', [
        { path: 'username', message: 'Este usuário já existe' },
      ]);
    }
    this.users.set(username, bcrypt.hashSync(password, 10));
  }
}

export const authService = new AuthService();