/**
 * Normalizes a string by converting it to lowercase and removing diacritics (accents), spaces, hyphens and apostrophes
 * This is useful for case-insensitive and accent-insensitive searching.
 * @param str The input string.
 * @returns The normalized string.
 */
export function normalizeString(str: string): string {
  return str
    .normalize("NFD") // Decompose combined graphemes into base characters and diacritics
    .replace(/[\u0300-\u036f -']/g, "") // Remove diacritics, spaces, hyphens and apostrophes
    .toLowerCase(); // Convert to lowercase
}
