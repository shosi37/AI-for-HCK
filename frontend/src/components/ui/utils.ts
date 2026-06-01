/**
 * @fileoverview Utility functions for UI styling and class joining.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind class names dynamically, resolving style conflicts.
 * Combines clsx and tailwind-merge.
 * @param inputs - Array of class names or conditional class expressions.
 * @returns Combined and clean class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
