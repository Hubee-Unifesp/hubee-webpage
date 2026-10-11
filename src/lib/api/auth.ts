import { apiClient } from './apiClient';
import { LoginFormInputs, RegisterFormInputs, SignupIntent } from '../validations/auth.schema';

export type User = {
  id: string;
  fullName: string;
  email: string;
  profileComplete: boolean;
  signupIntent: SignupIntent;
};

type AuthResponse = {
  user: User;
  access_token: string;
};

export const login = async (data: LoginFormInputs): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  if (typeof window !== 'undefined') {
    localStorage.setItem('hubee_token', response.data.access_token);
  }
  return response.data;
};

export const register = async (data: RegisterFormInputs): Promise<AuthResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { confirmPassword, ...payload } = data;
  
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  if (typeof window !== 'undefined') {
    localStorage.setItem('hubee_token', response.data.access_token);
  }
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
};

export const logout = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hubee_token');
  }
};