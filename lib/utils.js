import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Deterministic UTC formatting to avoid SSR/client mismatch from locale differences
export function formatDateTime(value) {
  try {
    if (!value) return '';
    const d = new Date(value);
    // Use fixed ISO then trim seconds if desired
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return '';
  }
}

export function formatDate(value) {
  try {
    if (!value) return '';
    const d = new Date(value);
    return d.toISOString().substring(0, 10); // YYYY-MM-DD
  } catch {
    return '';
  }
}
