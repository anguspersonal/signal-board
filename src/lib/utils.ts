import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRatingColor(rating: number) {
  if (rating >= 4) return 'text-green-600'
  if (rating >= 3) return 'text-yellow-600'
  return 'text-red-600'
}

export function formatRating(rating?: number) {
  if (!rating) return 'Not rated'
  return rating.toFixed(1)
}

export function getMockUser() {
  return { id: '1' }
} 