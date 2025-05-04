import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function extractHttpCode(str: string): number | null {
  console.log("STR",str)
  const match = str?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

