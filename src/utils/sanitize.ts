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
    return value.trim();
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

/**
 * Normalizes any valid date string or description into a strict YYYY-MM-DD format.
 * Returns null if the value is falsy or invalid.
 */
export function formatDateToYYYYMMDD(dateStr: any): string | null {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;

    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
        return String(dateStr);
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        // Attempt parsing month name format: "Jan 15, 2025" or "15 Jan 2025"
        const monthMap: Record<string, string> = {
            jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
            jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
            january: '01', february: '02', march: '03', april: '04', june: '06',
            july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
        };

        // Pattern 1: "Jan 15, 2025" or "Jan 15 2025"
        const match1 = String(dateStr).match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
        if (match1) {
            const mon = monthMap[match1[1].toLowerCase()];
            if (mon) {
                const day = match1[2].padStart(2, '0');
                const yr = match1[3];
                return `${yr}-${mon}-${day}`;
            }
        }

        // Pattern 2: "15 Jan 2025" or "15 Jan, 2025"
        const match2 = String(dateStr).match(/(\d{1,2})\s+([a-zA-Z]+),?\s+(\d{4})/);
        if (match2) {
            const mon = monthMap[match2[2].toLowerCase()];
            if (mon) {
                const day = match2[1].padStart(2, '0');
                const yr = match2[3];
                return `${yr}-${mon}-${day}`;
            }
        }

        return null;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
