import type { AuthResponse, User } from '../entities/types';

export interface AuthPort {
  login(email: string, password: string): Promise<AuthResponse>;
  register(email: string, password: string, name: string): Promise<AuthResponse>;
  me(): Promise<User>;
}
