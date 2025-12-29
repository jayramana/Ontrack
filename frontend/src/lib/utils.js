import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status) {
  if (!status) return "";
  // Split camelCase or PascalCase into words
  const result = status.replace(/([A-Z])/g, " $1").trim();
  // Capitalize only the first letter of the sentence
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}
