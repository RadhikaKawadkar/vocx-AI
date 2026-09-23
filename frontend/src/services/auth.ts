import { api } from './api';
import { User } from '../types';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
  role: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, full_name: string, password: string, role = 'Analyst'): Promise<User> => {
    const response = await api.post<User>('/auth/register', { email, full_name, password, role });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};
