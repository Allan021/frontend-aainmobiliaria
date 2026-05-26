import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAdapter } from '../../infrastructure/api/authAdapter';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authAdapter.me(),
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAdapter.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem('aa_token', data.token);
      qc.setQueryData(['me'], data.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authAdapter.register(email, password, name),
    onSuccess: (data) => {
      localStorage.setItem('aa_token', data.token);
      qc.setQueryData(['me'], data.user);
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    localStorage.removeItem('aa_token');
    qc.clear();
    window.location.href = '/admin/login';
  };
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => authAdapter.listUsers(),
  });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      authAdapter.createTeamMember(email, password, name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
