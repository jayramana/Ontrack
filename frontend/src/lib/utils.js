import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"


export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatStatus(status) {
  if (!status) return "";
  return status
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .trim() // Remove leading/trailing spaces
    .replace(/^./, (str) => str.toUpperCase()); // Ensure first letter is capitalized (optional if data is clean)
}
