import validator from 'validator';
import deepEmailValidator from 'deep-email-validator';

/**
 * ============================================================================
 * INPUT SANITISATION & OWASP DATA VALIDATION UTILITIES
 * ============================================================================
 */

/**
 * Sanitise a string value by trimming whitespace, stripping script/HTML tags and null bytes.
 * Punctuation like ' and & are preserved as normal characters because React automatically escapes JSX.
 */
export function sanitizeString(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value
        .trim()
        .replace(/\0/g, '') // strip null bytes
        .replace(/<[^>]*>/g, ''); // strip HTML tags
}

/**
 * Decodes common HTML entities if previously double-escaped.
 */
export function unescapeHtml(value: string): string {
    if (!value || typeof value !== 'string') return '';
    return value
        .replace(/&amp;/g, '&')
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

/**
 * Normalises an email address (trims and converts domain to lowercase).
 */
export function sanitizeEmail(email: unknown): string {
    if (typeof email !== 'string') return '';
    const normalized = validator.normalizeEmail(email.trim(), {
        all_lowercase: true,
        gmail_lowercase: true,
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_lowercase: true,
        yahoo_lowercase: true,
        icloud_lowercase: true
    });
    return normalized || email.trim().toLowerCase();
}

/**
 * Checks if a string contains HTML/script tags, angle brackets, or javascript: pseudo-protocols.
 */
export function containsHtml(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return /<[^>]*>|[<>]|javascript:|data:\s*text\/html/i.test(value);
}

/**
 * Validates email syntax, length, RFC 5322 compliance, and blocks SMTP header injection / numeric domains.
 */
export function isValidEmail(email: unknown): boolean {
    if (typeof email !== 'string') return false;
    const trimmed = email.normalize('NFKC').trim();

    if (trimmed.length < 6 || trimmed.length > 254) return false;

    // Reject control characters, CRLF newlines, tabs, null bytes, quotes, angle brackets, or backslashes
    if (/[\r\n\t\0\s<>"'\\]/.test(trimmed)) return false;

    // Validate standard RFC format via validator.js
    if (!validator.isEmail(trimmed, { allow_utf8_local_part: false, require_tld: true, allow_ip_domain: false })) {
        return false;
    }

    const atIndex = trimmed.indexOf('@');
    if (atIndex <= 0 || atIndex !== trimmed.lastIndexOf('@')) return false;

    const localPart = trimmed.slice(0, atIndex);
    const domainPart = trimmed.slice(atIndex + 1).toLowerCase();

    if (localPart.length < 1 || localPart.length > 64) return false;
    if (domainPart.length < 4 || domainPart.length > 255) return false;

    // Domain name labels before TLD cannot be purely numeric (rejects dummy domains like 1234.com)
    const labels = domainPart.split('.');
    const mainLabels = labels.slice(0, -1);
    if (mainLabels.every(label => /^[0-9]+$/.test(label))) return false;

    return true;
}

/**
 * Full Deliverability Pipeline:
 * Validates Syntax + Domain + Typo + DNS MX + 3000+ Disposable Domains via deep-email-validator.
 */
export async function validateEmailDeliverable(
    email: unknown
): Promise<{ valid: boolean; error?: string; normalizedEmail?: string }> {
    if (!isValidEmail(email)) {
        return { valid: false, error: 'Please enter a valid email address format' };
    }

    const normalizedEmail = sanitizeEmail(email);

    // Deep checks (MX, Typo, 3000+ Disposable Domains) are enforced in production
    if (process.env.NODE_ENV !== 'development') {
        try {
            const validateFunc = (deepEmailValidator as any).default || deepEmailValidator;
            const res = await validateFunc({
                email: normalizedEmail,
                validateRegex: false,
                validateMx: true,
                validateTypo: true,
                validateDisposable: true,
                validateSMTP: false
            });

            if (!res.valid) {
                if (res.reason === 'disposable') {
                    return { valid: false, error: 'Disposable or temporary email addresses are not permitted', normalizedEmail };
                }
                if (res.reason === 'mx') {
                    return { valid: false, error: 'The email domain provided cannot receive emails (no valid mail server found)', normalizedEmail };
                }
                if (res.reason === 'typo') {
                    return { valid: false, error: 'The email domain appears to contain a typo. Please check your spelling', normalizedEmail };
                }
                return { valid: false, error: 'Invalid or non-deliverable email address', normalizedEmail };
            }
        } catch {
            return { valid: true, normalizedEmail }; // Fail open on network blips
        }
    }

    return { valid: true, normalizedEmail };
}

/**
 * Validates standard phone numbers (7-20 characters, international format).
 */
export function isValidPhone(phone: unknown): boolean {
    if (typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    return /^[+0-9\s()-]{7,20}$/.test(trimmed);
}

/**
 * Validates personal full names (2-50 chars, alphabetic and standard name characters).
 */
export function isValidName(name: unknown): boolean {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    return /^[a-zA-Z\s.'-]{2,50}$/.test(trimmed);
}

/**
 * Validates subject field (no HTML, no newlines/CRLF).
 */
export function isValidSubject(subject: unknown, minLength = 2, maxLength = 150): boolean {
    if (typeof subject !== 'string') return false;
    const trimmed = subject.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) return false;
    if (containsHtml(trimmed)) return false;
    if (/[\r\n\t\0]/.test(trimmed)) return false;
    return true;
}

/**
 * Validates message or description field (no HTML tags).
 */
export function isValidMessage(message: unknown, minLength = 5, maxLength = 3000): boolean {
    if (typeof message !== 'string') return false;
    const trimmed = message.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) return false;
    if (containsHtml(trimmed)) return false;
    return true;
}

/**
 * Validates general safe text fields (address, occupation, etc.).
 */
export function isValidSafeText(text: unknown, minLength = 1, maxLength = 500): boolean {
    if (typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) return false;
    if (containsHtml(trimmed)) return false;
    return true;
}

/**
 * Sanitises every string field in a plain object.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (key.toLowerCase().includes('email')) {
            result[key] = typeof val === 'string' ? sanitizeEmail(val) : val;
        } else {
            result[key] = typeof val === 'string' ? sanitizeString(val) : val;
        }
    }
    return result as T;
}

/**
 * Normalises any date string into strict YYYY-MM-DD format.
 */
export function formatDateToYYYYMMDD(dateStr: any): string | null {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr))) {
        return String(dateStr);
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        const monthMap: Record<string, string> = {
            jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
            jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
            january: '01', february: '02', march: '03', april: '04', june: '06',
            july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
        };

        const match1 = String(dateStr).match(/([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})/);
        if (match1) {
            const mon = monthMap[match1[1].toLowerCase()];
            if (mon) {
                return `${match1[3]}-${mon}-${match1[2].padStart(2, '0')}`;
            }
        }

        const match2 = String(dateStr).match(/(\d{1,2})\s+([a-zA-Z]+),?\s+(\d{4})/);
        if (match2) {
            const mon = monthMap[match2[2].toLowerCase()];
            if (mon) {
                return `${match2[3]}-${mon}-${match2[1].padStart(2, '0')}`;
            }
        }

        return null;
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
