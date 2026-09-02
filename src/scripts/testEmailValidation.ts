import {
    isValidEmail,
    validateEmailDeliverable,
    sanitizeEmail,
    containsHtml
} from '../utils/sanitize.js';

interface TestCase {
    category: string;
    description: string;
    email: string;
    expectedValid: boolean;
}

const testCases: TestCase[] = [
    // 1. Valid RFC 5321/5322 Emails
    { category: 'Valid RFC Formats', description: 'Standard standard email', email: 'student@ain.ac.in', expectedValid: true },
    { category: 'Valid RFC Formats', description: 'Dot in local part', email: 'john.doe@gmail.com', expectedValid: true },
    { category: 'Valid RFC Formats', description: 'Plus tag / alias', email: 'user+tag@domain.org', expectedValid: true },
    { category: 'Valid RFC Formats', description: 'Subdomain structure', email: 'admin@cs.university.edu.in', expectedValid: true },
    { category: 'Valid RFC Formats', description: 'Hyphens and numbers', email: 'user-123_abc@sub-domain.com', expectedValid: true },
    { category: 'Valid RFC Formats', description: 'Short 2-char TLD', email: 'contact@firm.co', expectedValid: true },

    // 2. SMTP Injection & Header Injection (OWASP Critical)
    { category: 'SMTP Header Injection', description: 'CRLF with injected Bcc header', email: 'victim@domain.com\r\nBcc:spammer@evil.com', expectedValid: false },
    { category: 'SMTP Header Injection', description: 'Newline with Subject injection', email: 'victim@domain.com\nSubject:Hacked', expectedValid: false },
    { category: 'SMTP Header Injection', description: 'Null byte injection (%00 / \\0)', email: 'user\0@domain.com', expectedValid: false },
    { category: 'SMTP Header Injection', description: 'Embedded carriage return \\r', email: 'user\r@domain.com', expectedValid: false },
    { category: 'SMTP Header Injection', description: 'Embedded tab character', email: 'user\t@domain.com', expectedValid: false },

    // 3. Cross-Site Scripting (XSS) & HTML Injection (OWASP Critical)
    { category: 'XSS & HTML Injection', description: 'Script tag in local part', email: '<script>alert(1)</script>@domain.com', expectedValid: false },
    { category: 'XSS & HTML Injection', description: 'SVG onload payload', email: '"><svg onload=alert(1)>@domain.com', expectedValid: false },
    { category: 'XSS & HTML Injection', description: 'HTML angle brackets', email: 'user<test>@domain.com', expectedValid: false },
    { category: 'XSS & HTML Injection', description: 'Quote escaping payload', email: 'user"name@domain.com', expectedValid: false },
    { category: 'XSS & HTML Injection', description: 'Javascript pseudo-protocol', email: 'javascript:alert(1)@domain.com', expectedValid: false },

    // 4. Malformed / RFC Violation Cases
    { category: 'Malformed Inputs', description: 'Missing @ symbol', email: 'plainaddress', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Multiple @ symbols', email: 'user@domain@another.com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Missing local part', email: '@domain.com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Missing domain part', email: 'user@', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Leading dot in local part', email: '.user@domain.com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Trailing dot in local part', email: 'user.@domain.com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Consecutive dots in local part', email: 'user..name@domain.com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Consecutive dots in domain part', email: 'user@domain..com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Single-character TLD', email: 'user@domain.c', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Numeric TLD', email: 'user@domain.123', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Purely numeric domain label (1234.com)', email: 'test@1234.com', expectedValid: false },
    { category: 'Malformed Inputs', description: 'Contains spaces in between', email: 'user name@domain.com', expectedValid: false },

    // 5. Length Boundaries (RFC 5321 limits)
    { category: 'Length Boundary', description: 'Total length > 254 chars', email: 'a'.repeat(60) + '@' + 'b'.repeat(190) + '.com', expectedValid: false },
    { category: 'Length Boundary', description: 'Local part > 64 chars', email: 'a'.repeat(65) + '@domain.com', expectedValid: false },
    { category: 'Length Boundary', description: 'Max valid local part (64 chars)', email: 'a'.repeat(64) + '@domain.com', expectedValid: true },

    // 6. ReDoS (Regular Expression Denial of Service)
    { category: 'ReDoS Resistance', description: 'Catastrophic backtracking attack pattern', email: 'a'.repeat(50) + '!@' + 'b'.repeat(50) + '.com', expectedValid: true }
];

async function runOwaspValidationTests() {
    console.log('\n==========================================================');
    console.log('       🛡️  OWASP EMAIL VALIDATION SECURITY TEST SUITE       ');
    console.log('==========================================================\n');

    let passed = 0;
    let failed = 0;

    let currentCategory = '';

    for (const test of testCases) {
        if (test.category !== currentCategory) {
            currentCategory = test.category;
            console.log(`\n\x1b[1m\x1b[36m▶ [Category] ${currentCategory}\x1b[0m`);
        }

        const startTime = process.hrtime.bigint();
        const actualValid = isValidEmail(test.email);
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1_000_000;

        const isSuccess = actualValid === test.expectedValid;

        if (isSuccess) {
            passed++;
            console.log(`  \x1b[32m✔ PASS\x1b[0m ${test.description.padEnd(45)} \x1b[90m(${durationMs.toFixed(3)}ms)\x1b[0m`);
        } else {
            failed++;
            console.log(`  \x1b[31m✖ FAIL\x1b[0m ${test.description.padEnd(45)} [Expected: ${test.expectedValid}, Got: ${actualValid}] Email: "${test.email}"`);
        }
    }

    console.log('\n----------------------------------------------------------');
    console.log(`\x1b[1m\x1b[36m▶ [Category] Deliverability & Normalization Checks\x1b[0m`);

    // Test Sanitization / Canonicalization (Lowercasing & Trimming)
    const sanitized = sanitizeEmail('  USER@Domain.COM  ');
    if (sanitized === 'user@domain.com') {
        passed++;
        console.log(`  \x1b[32m✔ PASS\x1b[0m Normalization & Canonicalization (trim & lowercase)`);
    } else {
        failed++;
        console.log(`  \x1b[31m✖ FAIL\x1b[0m Expected 'user@domain.com', got '${sanitized}'`);
    }

    // Test HTML Tag checking
    const hasHtml = containsHtml('<script>alert(1)</script>');
    if (hasHtml) {
        passed++;
        console.log(`  \x1b[32m✔ PASS\x1b[0m HTML tag detection (XSS prevention)`);
    } else {
        failed++;
        console.log(`  \x1b[31m✖ FAIL\x1b[0m Failed to detect HTML tags`);
    }

    console.log('\n==========================================================');
    if (failed === 0) {
        console.log(`\x1b[32m\x1b[1m  ALL ${passed} OWASP VALIDATION TESTS PASSED SUCCESSFULLY!  \x1b[0m`);
    } else {
        console.log(`\x1b[31m\x1b[1m  RESULTS: ${passed} Passed, ${failed} Failed.  \x1b[0m`);
    }
    console.log('==========================================================\n');
}

runOwaspValidationTests().catch(console.error);
