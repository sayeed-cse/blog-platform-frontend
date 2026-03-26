'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { api } from '@/lib/api';
import { User } from '@/types';

export function useMe() {
  return useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data.data as User;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    }
  });
}
