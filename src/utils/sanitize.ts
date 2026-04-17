/**
 * Input Sanitisation Utilities
 *
 * Protects against:
 * - XSS: strips HTML tags so payloads like <script>alert(1)</script> are stored as plain text
 * - Whitespace abuse: trims leading/trailing spaces from all string fields
 * - Null/undefined safety: non-string values pass through untouched
 *
 * Does NOT protect against SQL injection — that is handled by
 * parameterised queries (mysql2 `?` placeholders) throughout the app.
 */

/**
 * Sanitise a single string value.
 * - Trims whitespace
 * - Strips all HTML tags (converts < and > to entities)
 */
export function sanitizeString(value: unknown): string {
    if (typeof value !== 'string') return value as any;
    return value
        .trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Sanitise every string field in a plain object.
 * Non-string values (numbers, booleans, null) are left untouched.
 *
 * @example
 * const clean = sanitizeObject({ name: '  <b>John</b>  ', age: 30 });
 * // → { name: '&lt;b&gt;John&lt;/b&gt;', age: 30 }
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        result[key] = typeof val === 'string' ? sanitizeString(val) : val;
    }
    return result as T;
}
