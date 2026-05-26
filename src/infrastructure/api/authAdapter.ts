import { api } from './client';
import type { AuthPort } from '../../core/domain/ports/AuthPort';
import type { AuthResponse, User } from '../../core/domain/entities/types';

export const authAdapter: AuthPort = {
  login(email: string, password: string) {
    return api.post<AuthResponse>('/auth/login', { email, password });
  },

  register(email: string, password: string, name: string) {
    return api.post<AuthResponse>('/auth/register', { email, password, name });
  },

  me() {
    return api.get<User>('/auth/me');
  },

  listUsers() {
    return api.get<User[]>('/auth/users');
  },

  createTeamMember(email: string, password: string, name: string) {
    return api.post<User>('/auth/users', { email, password, name });
  },
};
