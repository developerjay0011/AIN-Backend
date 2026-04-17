import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * Custom SVG CAPTCHA Generator
 * Generates an SVG image string and a signed token containing the answer.
 */

const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars (I, 1, O, 0)
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateCaptcha = (req: Request, res: Response) => {
  const text = generateRandomString(6);
  const width = 200;


  const height = 50;

  // Sign the text into a token (expires in 5 mins)
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new Error('JWT_SECRET not set');

  const token = jwt.sign({ captcha: text }, jwtSecret, { expiresIn: '5m' });

  // Generate SVG with noise
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Background
  svg += `<rect width="100%" height="100%" fill="#f3f4f6" />`;

  // Random noise lines
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0c0c0cff" stroke-width="1" />`;
  }

  // Text with random rotation and positioning
  const letters = text.split('');
  const charWidth = width / (letters.length + 0.5);
  letters.forEach((char, i) => {
    const x = (i + 0.75) * charWidth;
    const y = 32 + (Math.random() * 6 - 3);
    const rotation = Math.random() * 20 - 10;
    svg += `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#1e293b" transform="rotate(${rotation}, ${x}, ${y})" text-anchor="middle">${char}</text>`;
  });


  // Random noise dots
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    svg += `<circle cx="${x}" cy="${y}" r="1" fill="#94a3b8" />`;
  }

  svg += `</svg>`;

  res.json(ApiResponse.success({
    svg: Buffer.from(svg).toString('base64'), // Base64 for easy transport
    token
  }, 'Captcha generated successfully'));
};
