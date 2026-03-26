import axios from 'axios';
import { getApiBaseUrl } from './utils';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true
});

export const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return 'Something went wrong';
};
