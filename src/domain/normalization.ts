// src/domain/normalization.ts

/**
 * Normalizes a string by converting it to lowercase and removing diacritics (accents).
 * This is useful for case-insensitive and accent-insensitive searching.
 * @param str The input string.
 * @returns The normalized string.
 */
export function normalizeString(str: string): string {
  return str
    .normalize('NFD') // Decompose combined graphemes into base characters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase(); // Convert to lowercase
}
