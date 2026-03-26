import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
}

export function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api$/, '');
}

export function getAssetUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${getApiOrigin()}${url}`;
}
