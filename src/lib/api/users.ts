import { apiClient } from './apiClient';
import type { User } from './auth';

export type UpdateMePayload = {
  fullName: string;
  email: string;
  /** Só dígitos: a API recusa a máscara. `null` apaga o telefone. */
  phone: string | null;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export const updateMe = async (payload: UpdateMePayload): Promise<User> => {
  const response = await apiClient.patch<User>('/users/me', payload);
  return response.data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  // 401 aqui é "senha atual incorreta", não sessão expirada.
  await apiClient.patch('/users/me/password', payload, { skipAuthRedirect: true });
};

export const deleteMe = async (): Promise<void> => {
  await apiClient.delete('/users/me');
};
