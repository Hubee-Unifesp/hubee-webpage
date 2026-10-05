export type User = {
  id: string;
  fullName: string;
  email: string;
  profileComplete: boolean;
  signupIntent: 'BUY' | 'ORGANIZE';
};

// Funções preparadas para receber o cliente da API depois
export const login = async (data: unknown) => {
  console.log('Login chamado com:', data);
};

export const register = async (data: unknown) => {
  console.log('Register chamado com:', data);
};

export const getMe = async (): Promise<User | null> => {
  console.log('A procurar dados do utilizador...');
  return null; 
};

export const logout = async () => {
  console.log('Sessão terminada');
};