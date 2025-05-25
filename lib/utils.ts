import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ar-EG').format(num);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getImageUrl(imagePath?: string): string {
  if (!imagePath) return '/images/default-quiz.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `/images/${imagePath}`;
}

export function generateShareUrl(quizId: number, resultId?: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://facequizz.com';
  if (resultId) {
    return `${baseUrl}/quiz/${quizId}/result/${resultId}`;
  }
  return `${baseUrl}/quiz/${quizId}`;
}