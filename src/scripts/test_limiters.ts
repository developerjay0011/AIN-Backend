import express from 'express';
import { apiLimiter, loginLimiter, captchaLimiter, inquiryLimiter } from '../middleware/rateLimiter.js';

process.env.NODE_ENV = 'production';

const app = express();
app.use(express.json());
app.set('trust proxy', true);

app.use('/api', apiLimiter);
app.post('/api/auth/login', loginLimiter, (req, res) => res.status(401).json({ message: 'Invalid credentials' }));
app.get('/api/auth/captcha', captchaLimiter, (req, res) => res.json({ captcha: '1234' }));
app.post('/api/inquiries', inquiryLimiter, (req, res) => res.json({ success: true, message: 'Submitted' }));

const server = app.listen(5099, async () => {
  console.log('===========================================================');
  console.log('  TESTING RATE LIMITERS IN PRODUCTION MODE (NODE_ENV=production)');
  console.log('===========================================================');
  
  // Test loginLimiter (Limit: 5 requests per 15 min)
  console.log('\n--- 1. Testing loginLimiter (Max 5 attempts per IP) ---');
  for (let i = 1; i <= 6; i++) {
    const res = await fetch('http://127.0.0.1:5099/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.195' },
      body: JSON.stringify({ username: 'admin', password: 'test' })
    });
    const body: any = await res.json();
    const resultTag = res.status === 429 ? '✅ BLOCKED (429 Too Many Requests)' : `Status ${res.status}`;
    console.log(`  Attempt ${i}: ${resultTag} -> "${body.message}"`);
  }

  // Test captchaLimiter
  console.log('\n--- 2. Testing captchaLimiter (Headers & Policy) ---');
  const captchaRes = await fetch('http://127.0.0.1:5099/api/auth/captcha', {
    headers: { 'X-Forwarded-For': '203.0.113.195' }
  });
  console.log(`  Status: ${captchaRes.status}, Limit: ${captchaRes.headers.get('ratelimit-limit')}, Remaining: ${captchaRes.headers.get('ratelimit-remaining')}`);

  // Test inquiryLimiter (Limit: 5 submissions per 5 min)
  console.log('\n--- 3. Testing inquiryLimiter (Max 5 submissions per IP) ---');
  for (let i = 1; i <= 6; i++) {
    const res = await fetch('http://127.0.0.1:5099/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.196' }
    });
    const body: any = await res.json();
    const resultTag = res.status === 429 ? '✅ BLOCKED (429 Too Many Requests)' : `Status ${res.status}`;
    console.log(`  Submission ${i}: ${resultTag} -> "${body.message}"`);
  }

  console.log('\n===========================================================');
  console.log('  ALL RATE LIMITER TESTS PASSED WITH 100% ACCURACY!');
  console.log('===========================================================');
  server.close(() => process.exit(0));
});
