import { useAuthStore } from '../../store/auth.store';
import { useMutation } from '@tanstack/react-query';
import { authApi } from './api';

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      // TODO: backend should return { token, user } on login
      login(data.token, data.user);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return logout;
}
