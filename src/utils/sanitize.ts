import validator from 'validator';
import deepEmailValidator from 'deep-email-validator';

/**
 * ============================================================================
 * INPUT SANITISATION & OWASP DATA VALIDATION UTILITIES
 * ============================================================================
 */

/**
 * Sanitise a string value by:
 * 1. Stripping null bytes
 * 2. Stripping complete and unclosed HTML/XML tags
 * 3. Stripping DOM event handlers (onclick=, onload=, onerror=, etc.)
 * 4. Stripping dangerous URL schemes (javascript:, data:text/html, vbscript:)
 * 5. Stripping raw angle brackets to prevent tag reconstruction
 */
export function sanitizeString(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value
        .normalize('NFKC')
        .replace(/\0/g, '') // strip null bytes
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '') // strip entire script blocks
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '') // strip entire style blocks
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '') // strip entire iframe blocks
        .replace(/<[^>]*>/g, '') // strip full HTML tags <...>
        .replace(/<\s*\/?\s*[a-zA-Z][^>]*>?/gi, '') // strip unclosed opening/closing tags e.g. "<script", "<iframe", "<img"
        .replace(/\b(on\w+)\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '') // strip DOM event handlers e.g. onclick=prompt(...)
        .replace(/\bjavascript:[^\s'"]*/gi, '') // strip javascript: pseudo-protocol
        .replace(/\bdata:\s*text\/html[^\s'"]*/gi, '') // strip data:text/html
        .replace(/\bvbscript:[^\s'"]*/gi, '') // strip vbscript:
        .replace(/[<>{}`]/g, '') // strip remaining raw angle brackets, curly braces, backticks
        .trim();
}

/**
 * Decodes numeric and named HTML entities (e.g. &#x3C;, &lt;) to unmask obfuscated injection payloads.
 */
export function decodeHtmlEntities(value: string): string {
    if (!value || typeof value !== 'string') return '';
    return value
        .replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#([0-9]+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#x27;/gi, "'")
        .replace(/&apos;/gi, "'")
        .replace(/&amp;/gi, '&');
}

/**
 * Checks if a string contains SQL injection signatures.
 */
export function containsSqlInjection(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const s = value.normalize('NFKC');
    // SQL comments
    if (/(--|\/\*|\*\/|;\s*--|#)/.test(s)) return true;
    // SQL stacked statements, drops, deletes, updates, alters
    if (/;\s*(?:DROP|DELETE|UPDATE|INSERT|SELECT|EXEC|ALTER|CREATE|TRUNCATE)\b/i.test(s)) return true;
    // UNION SELECT
    if (/\bUNION\s+(?:ALL\s+)?SELECT\b/i.test(s)) return true;
    // Tautologies like ' OR '1'='1, " OR ""=", ' OR 1=1, ' OR 'a'='a', ) OR ('1'='1
    if (/['"]\s*OR\s+['"\d\w]+=['"\d\w]+/i.test(s)) return true;
    if (/\bOR\s+1\s*=\s*1\b/i.test(s)) return true;
    if (/\bOR\s+['"]\w+['"]\s*=\s*['"]\w+['"]/i.test(s)) return true;
    if (/\bAND\s+['"\d\w]+=['"\d\w]+/i.test(s)) return true;
    if (/\bWAITFOR\s+DELAY\b/i.test(s)) return true;
    if (/\bpg_sleep\s*\(/i.test(s)) return true;
    if (/\bSLEEP\s*\(\d+\)/i.test(s)) return true;
    if (/\bORDER\s+BY\s+\d+--/i.test(s)) return true;
    if (/\bHAVING\s+\d+\s*=\s*\d+/i.test(s)) return true;
    if (/\bEXEC\s+(?:xp_|sp_)/i.test(s)) return true;
    if (/\bSELECT\s+.*FROM\b/i.test(s)) return true;
    return false;
}

/**
 * Checks if a string contains command injection or directory traversal signatures.
 */
export function containsCommandOrTraversal(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const s = value.normalize('NFKC');
    // Path traversal: ../, ..\, ....//
    if (/(?:\.\.[/\\]){2,}|\.{3,}[/\\]|%2e%2e/i.test(s)) return true;
    // Shell command chaining: ; ls, | cat, & net user, & id, $(whoami), `id`
    if (/[;&|`$]\s*(?:cat|dir|whoami|net\s+user|id\b|ls\b|ping\b|curl\b|wget\b|nslookup\b|powershell|bash|sh\b)/i.test(s)) return true;
    return false;
}

/**
 * Checks if a string contains dangerous characters such as HTML/XML tags,
 * template injection syntax ({ }, $), backslashes, backticks, control characters, pseudo-protocols,
 * SQL injection, or command injection/traversal.
 */
export function containsDangerousChars(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const decoded = decodeHtmlEntities(value).normalize('NFKC');

    // 1. HTML / Script / XSS / Event handlers / pseudo-protocols
    if (
        /<[^>]*>|<\s*\/?\s*[a-zA-Z]|[<>{}$\\^~|`]|[\0]|\b(on\w+)\s*=|\bjavascript:|\bdata:\s*text\/html|\bvbscript:/i.test(decoded) ||
        /<[^>]*>|<\s*\/?\s*[a-zA-Z]|[<>{}$\\^~|`]|[\0]|\b(on\w+)\s*=|\bjavascript:|\bdata:\s*text\/html|\bvbscript:/i.test(value)
    ) {
        return true;
    }

    // 2. SQL injection
    if (containsSqlInjection(value) || containsSqlInjection(decoded)) {
        return true;
    }

    // 3. Command injection and Path Traversal
    if (containsCommandOrTraversal(value) || containsCommandOrTraversal(decoded)) {
        return true;
    }

    return false;
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
 * Checks if a string contains HTML/script tags, DOM event handlers, angle brackets, or javascript: pseudo-protocols.
 */
export function containsHtml(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return /<[^>]*>|<\s*\/?\s*[a-zA-Z]|[<>]|\b(on\w+)\s*=|\bjavascript:|\bdata:\s*text\/html|\bvbscript:/i.test(value);
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

    // Block known disposable / burner temporary email domains
    const DISPOSABLE_DOMAINS = new Set([
        'tempmail.com', 'temp-mail.org', 'tempmail.net', 'tempmailo.com',
        'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
        'trashmail.com', 'trashmail.net', '10minutemail.com', '10minutemail.net',
        'yopmail.com', 'yopmail.net', 'throwawaymail.com', 'dispostable.com',
        'getairmail.com', 'sharklasers.com', 'fakeinbox.com', 'generator.email'
    ]);
    if (DISPOSABLE_DOMAINS.has(domainPart)) return false;

    return true;
}

/**
 * Full Deliverability Pipeline:
 * Validates Syntax + Domain + Typo + DNS MX + 3000+ Disposable Domains via deep-email-validator & validator.js.
 */
export async function validateEmailDeliverable(
    email: unknown,
    options: { checkMx?: boolean } = {}
): Promise<{ valid: boolean; error?: string; normalizedEmail?: string }> {
    if (!isValidEmail(email)) {
        return { valid: false, error: 'Please enter a valid email address format' };
    }

    const normalizedEmail = sanitizeEmail(email);

    try {
        const validateFunc = (deepEmailValidator as any).default || deepEmailValidator;
        let res = await validateFunc({
            email: normalizedEmail,
            validateRegex: true,
            validateMx: options.checkMx ?? true,
            validateTypo: true,
            validateDisposable: true,
            validateSMTP: false
        });

        // If flagged as typo on multi-part educational or regional ccTLD (.edu.in, .ac.in, .co.uk, etc.), re-verify with validateTypo: false
        if (!res.valid && res.reason === 'typo') {
            const domainParts = normalizedEmail.split('@')[1]?.toLowerCase().split('.') || [];
            const isMultiPartTld = domainParts.length >= 3 && [
                'in', 'uk', 'au', 'sg', 'np', 'bd', 'ca', 'nz', 'za', 'br', 'jp', 'my', 'lk'
            ].includes(domainParts[domainParts.length - 1]);

            if (isMultiPartTld) {
                res = await validateFunc({
                    email: normalizedEmail,
                    validateRegex: true,
                    validateMx: options.checkMx ?? true,
                    validateTypo: false,
                    validateDisposable: true,
                    validateSMTP: false
                });
            }
        }

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
            if (res.reason === 'regex') {
                return { valid: false, error: 'Please enter a valid email address format', normalizedEmail };
            }
            return { valid: false, error: 'Invalid or non-deliverable email address', normalizedEmail };
        }
    } catch {
        // Fallback to validator.js if network/DNS lookup encounters an unexpected issue
        if (!validator.isEmail(normalizedEmail)) {
            return { valid: false, error: 'Please enter a valid email address format', normalizedEmail };
        }
    }

    return { valid: true, normalizedEmail };
}

/**
 * Validates standard phone numbers.
 * Strictly enforces 10-digit Indian numbers (starting with 6-9, optional +91/0 prefix)
 * or international E.164 numbers (+ followed by 10-15 digits).
 * Actively blocks dummy repeating digits and invalid short numbers (e.g. 9-digit '564656454').
 */
export function isValidPhone(phone: unknown): boolean {
    if (typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    const cleaned = trimmed.replace(/[\s()-]/g, '');

    // Must consist only of digits, optionally prefixed with a single '+'
    if (!/^\+?\d+$/.test(cleaned)) return false;

    // Reject numbers shorter than 10 digits or longer than 16 characters
    const digitsOnly = cleaned.replace(/^\+/, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return false;

    // Reject dummy identical repeating digits (e.g. 9999999999, 0000000000)
    if (/^(\d)\1+$/.test(digitsOnly)) return false;

    // 1. Indian Mobile Number (10 digits starting with 6, 7, 8, 9, with optional +91, 91, or 0 prefix)
    const indianMatch = cleaned.match(/^(?:(?:\+|00)?91|0)?([6-9]\d{9})$/);
    if (indianMatch) {
        const nationalNumber = indianMatch[1];
        if (/^(\d)\1{9}$/.test(nationalNumber)) return false;
        return true;
    }

    // 2. International E.164 format: must start with '+' and have 10-15 digits total (excluding +91 which was validated above)
    if (/^\+[1-9]\d{9,14}$/.test(cleaned)) {
        if (cleaned.startsWith('+91')) return false;
        return true;
    }

    return false;
}

/**
 * Validates personal full names (2-50 chars).
 * Whitelist: alphabetic letters, spaces, dots, hyphens, and apostrophes.
 * Rejects keyboard mashing, consonant clusters (e.g. 'fgjhghkj'), and special characters.
 */
export function isValidName(name: unknown): boolean {
    if (typeof name !== 'string') return false;
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 50) return false;
    // Whitelist only letters, spaces, dots, hyphens, and apostrophes
    if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return false;
    // Reject HTML or dangerous characters
    if (containsDangerousChars(trimmed)) return false;
    // Must contain at least one vowel (a, e, i, o, u, y)
    if (!/[aeiouyAEIOUY]/.test(trimmed)) return false;
    // Must contain at least one valid word of 2+ letters
    if (!/[a-zA-Z]{2,}/.test(trimmed)) return false;
    // Reject 5 or more consecutive consonants (blocks keyboard mashing like "fgjhghkj")
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed)) return false;
    // Reject 4 or more repeated identical characters (e.g. "aaaa")
    if (/(.)\1{3,}/.test(trimmed)) return false;
    return true;
}

/**
 * Validates subject field (3-150 chars).
 * Disallows HTML, newlines, and dangerous template/code/SQL injection characters.
 * Rejects pure consonant gibberish (e.g. 'jkll', 'fgjhghkj') and non-word noise.
 */
export function isValidSubject(subject: unknown, minLength = 3, maxLength = 150): boolean {
    if (typeof subject !== 'string') return false;
    const trimmed = subject.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) return false;
    // Reject HTML, control chars, SQL injection, command injection, and template injection
    if (containsDangerousChars(trimmed)) return false;
    if (/[\r\n\t\0]/.test(trimmed)) return false;
    // Whitelist allowed characters: letters, numbers, spaces, and safe punctuation
    if (!/^[a-zA-Z0-9\s.,!?'":\-\/()&]+$/.test(trimmed)) return false;
    // Must contain at least one vowel
    if (!/[aeiouyAEIOUY]/.test(trimmed)) return false;
    // Must contain at least one valid alphabetical word with 2 or more letters
    if (!/[a-zA-Z]{2,}/.test(trimmed)) return false;
    // Reject 5 or more consecutive consonants
    if (/[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed)) return false;
    // Reject 4 or more repeated identical characters
    if (/(.)\1{3,}/.test(trimmed)) return false;
    return true;
}

/**
 * Validates message or description field (5-3000 chars).
 * Disallows HTML tags, script elements, and dangerous characters / template injection: < > { } $ \ ^ ~ | `
 * Rejects keyboard mash / consonant clusters (e.g. '{fgjhghkj}').
 */
export function isValidMessage(message: unknown, minLength = 5, maxLength = 3000): boolean {
    if (typeof message !== 'string') return false;
    const trimmed = message.trim();
    if (trimmed.length < minLength || trimmed.length > maxLength) return false;
    // Disallow HTML tags, script elements, and dangerous characters / template injection: < > { } $ \ ^ ~ | `
    if (containsDangerousChars(trimmed)) return false;
    if (containsHtml(trimmed)) return false;
    // Must contain at least one vowel or digit
    if (!/[aeiouyAEIOUY0-9]/.test(trimmed)) return false;
    // Words must not contain 6 or more consecutive consonants (rejects keyboard mash)
    const words = trimmed.split(/[\s\r\n]+/);
    for (const word of words) {
        if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(word)) return false;
    }
    // Reject 5 or more repeated identical characters
    if (/(.)\1{4,}/.test(trimmed)) return false;
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
 * Recursively sanitises strings in any data structure (objects, arrays, primitives).
 */
export function sanitizeDeep<T>(value: T): T {
    if (typeof value === 'string') {
        return sanitizeString(value) as unknown as T;
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeDeep(item)) as unknown as T;
    }
    if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
            // Do not sanitize passwords or binary buffers
            if (k.toLowerCase().includes('password')) {
                cleaned[k] = v;
            } else if (k.toLowerCase().includes('email') && typeof v === 'string') {
                cleaned[k] = sanitizeEmail(v);
            } else {
                cleaned[k] = sanitizeDeep(v);
            }
        }
        return cleaned as unknown as T;
    }
    return value;
}

/**
 * Sanitises every string field in a plain object.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    return sanitizeDeep(obj);
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
