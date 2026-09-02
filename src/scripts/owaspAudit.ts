import http from 'http';
import https from 'https';

interface AuditResult {
    category: string;
    check: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    details: string;
}

const results: AuditResult[] = [];

async function fetchUrl(url: string, headers: Record<string, string> = {}): Promise<{ statusCode: number; headers: Record<string, string | string[] | undefined>; body: string }> {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const client = parsed.protocol === 'https:' ? https : http;
        const req = client.request(url, { method: 'GET', headers }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                statusCode: res.statusCode || 0,
                headers: res.headers,
                body: data
            }));
        });
        req.on('error', reject);
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        req.end();
    });
}

async function runAudit() {
    console.log('\n============================================================');
    console.log('🛡️  LOCAL OWASP SECURITY AUDIT FOR AIN WEB APPLICATION');
    console.log('============================================================\n');

    // 1. Test Email Harvesting (OWASP OAT-011) on Frontend
    try {
        const frontend = await fetchUrl('http://localhost:1002');
        const emailMatches = frontend.body.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        const mailtoMatches = frontend.body.match(/mailto:[^\s"'>]+/gi) || [];

        const hasInstitutionalEmail = frontend.body.includes('ain@awesindia.edu.in');

        if (!hasInstitutionalEmail && mailtoMatches.length === 0) {
            results.push({
                category: 'OAT-011 Email Harvesting',
                check: 'Raw HTML & DOM Email Exposure',
                status: 'PASS',
                details: 'No plaintext institutional emails or mailto: links found in static HTML.'
            });
        } else {
            results.push({
                category: 'OAT-011 Email Harvesting',
                check: 'Raw HTML & DOM Email Exposure',
                status: 'WARN',
                details: `Found potential email references: ${emailMatches.join(', ')}`
            });
        }
    } catch (err: any) {
        results.push({
            category: 'OAT-011 Email Harvesting',
            check: 'Frontend Service Availability',
            status: 'FAIL',
            details: `Could not reach http://localhost:1002: ${err.message}`
        });
    }

    // 2. Test Security Headers & Clickjacking (OWASP A05) on Backend
    try {
        const backend = await fetchUrl('http://localhost:5001/api/health');
        const h = backend.headers;

        const xFrame = h['x-frame-options'];
        const xContentType = h['x-content-type-options'];

        if (xFrame) {
            results.push({
                category: 'A05 Security Misconfiguration',
                check: 'Clickjacking Protection (X-Frame-Options)',
                status: 'PASS',
                details: `Header present: ${xFrame}`
            });
        } else {
            results.push({
                category: 'A05 Security Misconfiguration',
                check: 'Clickjacking Protection (X-Frame-Options)',
                status: 'WARN',
                details: 'Missing X-Frame-Options on API responses (configured via .htaccess on production Apache).'
            });
        }

        if (xContentType === 'nosniff') {
            results.push({
                category: 'A05 Security Misconfiguration',
                check: 'MIME Sniffing Protection (X-Content-Type-Options)',
                status: 'PASS',
                details: 'X-Content-Type-Options: nosniff present'
            });
        } else {
            results.push({
                category: 'A05 Security Misconfiguration',
                check: 'MIME Sniffing Protection (X-Content-Type-Options)',
                status: 'WARN',
                details: 'X-Content-Type-Options not returned by local dev server.'
            });
        }
    } catch (err: any) {
        results.push({
            category: 'A05 Security Misconfiguration',
            check: 'Backend Service Availability',
            status: 'FAIL',
            details: `Could not reach http://localhost:5001: ${err.message}`
        });
    }

    // 3. Test Email Validation & SMTP Header Injection (OWASP A03)
    const { isValidEmail, containsHtml } = await import('../utils/sanitize.js');
    const injectionEmails = [
        'user@domain.com\r\nBcc:spammer@evil.com',
        'user@domain.com\nSubject:Injected',
        '<script>alert(1)</script>@ain.edu.in',
        'test@1234.com'
    ];

    let allInjectionBlocked = true;
    for (const inj of injectionEmails) {
        if (isValidEmail(inj) || (containsHtml(inj) === false && inj.includes('<script>'))) {
            allInjectionBlocked = false;
        }
    }

    if (allInjectionBlocked) {
        results.push({
            category: 'A03 Injection Defense',
            check: 'SMTP Header Injection & XSS Payloads in Email',
            status: 'PASS',
            details: 'All CRLF header injections, script tags, and numeric dummy domains blocked.'
        });
    } else {
        results.push({
            category: 'A03 Injection Defense',
            check: 'SMTP Header Injection & XSS Payloads in Email',
            status: 'FAIL',
            details: 'One or more injection payloads passed validation.'
        });
    }

    // Print Results
    for (const r of results) {
        const badge = r.status === 'PASS' ? '\x1b[32m✔ PASS\x1b[0m' : r.status === 'WARN' ? '\x1b[33m▲ WARN\x1b[0m' : '\x1b[31m✖ FAIL\x1b[0m';
        console.log(`${badge} [${r.category}] ${r.check}`);
        console.log(`       ↳ ${r.details}\n`);
    }

    console.log('============================================================\n');
}

runAudit().catch(console.error);
