import express from 'express';
import { categoryUpload } from '../config/uploadConfig.js';
import { errorHandler } from '../middleware/errorMiddleware.js';

const app = express();
app.use(express.json());

app.post('/test-upload', categoryUpload('test').array('files'), (req: any, res) => {
  res.json({ success: true, files: req.files.map((f: any) => f.originalname) });
});

app.use(errorHandler);

const server = app.listen(5098, async () => {
  console.log('===========================================================');
  console.log('  TESTING FILE UPLOAD SECURITY & RESTRICTIONS');
  console.log('===========================================================');

  const testFiles = [
    { name: 'shell.php', mime: 'image/jpeg', content: '<?php echo "shell"; ?>' },
    { name: 'Untitled.svg.jpeg', mime: 'image/jpeg', content: '<svg></svg>' },
    { name: 'script.html', mime: 'text/html', content: '<h1>test</h1>' },
    { name: 'malicious.jsp', mime: 'application/octet-stream', content: 'jsp' },
    { name: 'valid_photo.jpg', mime: 'image/jpeg', content: 'fake-jpg-content' }
  ];

  for (const file of testFiles) {
    const formData = new FormData();
    const blob = new Blob([file.content], { type: file.mime });
    formData.append('files', blob, file.name);

    const res = await fetch('http://127.0.0.1:5098/test-upload', {
      method: 'POST',
      body: formData
    });

    const body: any = await res.json();
    if (res.status === 200) {
      console.log(`  File: "${file.name}" -> 🟢 ALLOWED (Status ${res.status})`);
    } else {
      console.log(`  File: "${file.name}" -> ❌ BLOCKED (Status ${res.status}) -> "${body.message}"`);
    }
  }

  console.log('===========================================================');
  server.close(() => process.exit(0));
});
