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

  // Generate SVG with security noise
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

  // Background
  svg += `<rect width="100%" height="100%" fill="#f3f4f6" />`;

  // Bezier Noise Curves (Harder for OCR than straight lines)
  for (let i = 0; i < 3; i++) {
    const y1 = Math.random() * height;
    const y2 = Math.random() * height;
    const cy1 = Math.random() * height;
    const cy2 = Math.random() * height;
    svg += `<path d="M 0 ${y1} C ${width / 3} ${cy1}, ${2 * width / 3} ${cy2}, ${width} ${y2}" stroke="#cbd5e1" stroke-width="1.5" fill="none" opacity="0.5" />`;
  }

  // Text with balanced distortion
  const letters = text.split('');
  const charWidth = width / (letters.length + 0.5);

  letters.forEach((char, i) => {
    const x = (i + 0.75) * charWidth;
    const y = 32 + (Math.random() * 6 - 3);
    const rotation = Math.random() * 24 - 12; // Moderate rotation
    const scale = 0.9 + Math.random() * 0.2; // Moderate scaling

    svg += `<text x="${x}" y="${y}" 
      font-family="'Times New Roman', serif" 
      font-weight="900" 
      font-size="24" 
      fill="#1e293b" 
      transform="rotate(${rotation}, ${x}, ${y}) scale(${scale})" 
      text-anchor="middle"
    >${char}</text>`;
  });

  // Noise grains
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    svg += `<circle cx="${x}" cy="${y}" r="1" fill="#cbd5e1" opacity="0.6" />`;
  }

  svg += `</svg>`;


  res.json(ApiResponse.success({
    svg: Buffer.from(svg).toString('base64'), // Base64 for easy transport
    token
  }, 'Captcha generated successfully'));
};
