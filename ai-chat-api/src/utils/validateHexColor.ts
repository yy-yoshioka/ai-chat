/**
 * Validate hex color format
 * @param color The color string to validate
 * @returns True if the color is a valid 6-digit hex color (e.g., #FF0000)
 */
export function validateHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Sanitize hex color by ensuring it starts with # and is uppercase
 * @param color The color string to sanitize
 * @returns Sanitized color string or null if invalid
 */
export function sanitizeHexColor(color: string): string | null {
  const trimmed = color.trim();
  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (validateHexColor(withHash)) {
    return withHash.toUpperCase();
  }

  return null;
}
