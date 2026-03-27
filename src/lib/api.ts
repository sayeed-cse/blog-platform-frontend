import axios from 'axios';
import { getApiBaseUrl } from './utils';

export const LIVE_REFETCH_INTERVAL = 3000;

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true
});

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const validationErrors = error.response?.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length) {
      return validationErrors.map((item: { message?: string }) => item.message).filter(Boolean).join(', ');
    }
    return error.response?.data?.message || error.message;
  }
  return 'Something went wrong';
};
