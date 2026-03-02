import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Default avatar image used when URL is missing or unsafe. */
export const DEFAULT_AVATAR_PATH = '/assets/images/default-user.avif';

/** Protocols that are never allowed for avatar URLs (XSS / open redirect). */
const FORBIDDEN_PROTOCOLS = new Set([
  'javascript:',
  'data:',
  'file:',
  'vbscript:',
  'blob:',
]);

/**
 * Returns whether the given string is a safe URL to use as an image source (e.g. avatar).
 * Allows only:
 * - Relative paths starting with /
 * - Absolute URLs with protocol https:
 * Rejects javascript:, data:, file:, and any other non-https protocol.
 */
export function isSafeAvatarUrl(url: string | null | undefined): boolean {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (!trimmed) return false;

  // Relative path: single leading / only (e.g. /assets/...), not protocol-relative (//)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (FORBIDDEN_PROTOCOLS.has(protocol)) return false;
    return protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns a safe URL for use as img src. If the given URL is unsafe or empty,
 * returns the default avatar path. Use this whenever binding user-provided avatar URLs.
 */
export function safeAvatarUrl(url: string | null | undefined): string {
  return isSafeAvatarUrl(url) ? url!.trim() : DEFAULT_AVATAR_PATH;
}

/**
 * Angular validator for avatar URL form controls.
 * Accepts empty (optional field) or a safe URL (https or relative path starting with /).
 */
export function safeAvatarUrlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null || String(value).trim() === '') return null;
    return isSafeAvatarUrl(value) ? null : { unsafeAvatarUrl: true };
  };
}
