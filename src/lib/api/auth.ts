import { apiClient } from './apiClient';
import { clearSession, saveSession } from '../session';
import { LoginFormInputs, RegisterFormInputs, SignupIntent } from '../validations/auth.schema';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profileComplete: boolean;
  signupIntent: SignupIntent;
};

type AuthResponse = {
  user: User;
  access_token: string;
};

export const login = async (data: LoginFormInputs): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  saveSession(response.data.access_token);
  return response.data;
};

export const register = async (data: RegisterFormInputs): Promise<AuthResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmPassword, ...payload } = data;

  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  saveSession(response.data.access_token);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  // 401 aqui só quer dizer "sem sessão": quem decide o que fazer é o AuthProvider, não o interceptor.
  const response = await apiClient.get<User>('/auth/me', { skipAuthRedirect: true });
  return response.data;
};

export const logout = async (): Promise<void> => {
  clearSession();
};
