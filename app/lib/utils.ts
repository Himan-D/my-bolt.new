import { clsx, type ClassValue } from 'clsx';

/**
 * Merge classNames using clsx for efficient conditional styling.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
