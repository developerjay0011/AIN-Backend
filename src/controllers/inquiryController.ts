import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';
import {
    sanitizeString,
    sanitizeEmail,
    isValidEmail,
    validateEmailDeliverable,
    isValidPhone,
    isValidName,
    containsHtml,
    containsDangerousChars,
    isValidSubject,
    isValidMessage
} from '../utils/sanitize.js';

/**
 * Helper to verify CAPTCHA token and answer
 */
const verifyCaptcha = (token: string, answer: string) => {
    if (!token || !answer) {
        throw new ApiError(400, 'CAPTCHA verification is required');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET not set');

    let decoded: { captcha: string };
    try {
        decoded = jwt.verify(token, jwtSecret) as { captcha: string };
    } catch (error: any) {
        throw new ApiError(401, 'CAPTCHA expired or invalid. Please refresh.');
    }

    if (!decoded || !decoded.captcha) {
        throw new ApiError(400, 'Invalid CAPTCHA token structure');
    }

    if (decoded.captcha.toUpperCase() !== answer.trim().toUpperCase()) {
        throw new ApiError(400, 'Incorrect CAPTCHA answer. Please try again.');
    }
};



// --- Admission Inquiries ---

export const createAdmissionInquiry = asyncHandler(async (req: Request, res: Response) => {
    // Use req.rawBody (original, pre-sanitization body) for rejection checks.
    // This ensures malicious payloads are actively rejected with 400 rather than
    // silently stripped by sanitizeMiddleware and accepted with 201 (CWE-20 fix).
    const original = (req as any).rawBody || req.body;
    const raw = req.body; // already sanitized by middleware

    // === Strict parameter whitelist and prototype pollution prevention (CWE-20) ===
    const allowedAdmissionFields = new Set(['studentName', 'parentName', 'email', 'phone', 'grade', 'message', 'captchaToken', 'captchaAnswer']);
    for (const key of Object.keys(original)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            throw new ApiError(400, 'Prototype pollution attempt detected');
        }
        if (!allowedAdmissionFields.has(key)) {
            throw new ApiError(400, `Unexpected field '${key}' is not allowed in form submissions`);
        }
    }

    // === Strict type enforcement: all expected fields must be plain strings ===
    const stringFields = ['studentName', 'parentName', 'email', 'phone', 'grade', 'message', 'captchaToken', 'captchaAnswer'];
    for (const field of stringFields) {
        const val = original[field];
        if (val !== undefined && val !== null && typeof val !== 'string') {
            throw new ApiError(400, `Invalid input: '${field}' must be a plain text string`);
        }
    }

    // === Reject malicious content detected in the ORIGINAL (pre-sanitized) body ===
    if (
        containsDangerousChars(original.studentName) ||
        containsDangerousChars(original.parentName) ||
        containsDangerousChars(original.email) ||
        containsDangerousChars(original.phone) ||
        containsDangerousChars(original.grade) ||
        containsDangerousChars(original.message)
    ) {
        throw new ApiError(400, 'HTML tags, script elements, angle brackets (< >), curly braces ({ }), and dangerous characters are not allowed in form submissions');
    }

    // Reject CRLF injection in name, grade, and phone (header injection / log poisoning)
    if (/[\r\n\0]/.test(original.studentName || '') ||
        /[\r\n\0]/.test(original.parentName || '') ||
        /[\r\n\0]/.test(original.phone || '') ||
        /[\r\n\0]/.test(original.grade || '')) {
        throw new ApiError(400, 'Control characters (newlines, null bytes) are not permitted in form fields');
    }

    const studentName = sanitizeString(raw.studentName);
    const parentName = sanitizeString(raw.parentName);
    const email = sanitizeEmail(raw.email);
    const phone = sanitizeString(raw.phone);
    const grade = sanitizeString(raw.grade);
    const message = sanitizeString(raw.message ?? '');

    if (!studentName || !parentName || !email || !phone || !grade) {
        throw new ApiError(400, 'Student Name, Parent Name, Email, Phone, and Grade are required');
    }

    if (!isValidName(studentName)) {
        throw new ApiError(400, 'Invalid Student Name format. Names must be 2-50 characters, contain valid syllables/vowels, and no keyboard mash or special characters.');
    }

    if (!isValidName(parentName)) {
        throw new ApiError(400, 'Invalid Parent Name format. Names must be 2-50 characters, contain valid syllables/vowels, and no keyboard mash or special characters.');
    }

    const emailCheck = await validateEmailDeliverable(email);
    if (!emailCheck.valid) {
        throw new ApiError(400, emailCheck.error || 'Invalid Email address format');
    }

    if (!isValidPhone(phone)) {
        throw new ApiError(400, 'Invalid Phone number format. Please enter a valid 10-digit Indian mobile number or international format (+...).');
    }

    // Validate message using the sanitized variable (not raw) for length/content checks
    if (message && !isValidMessage(message, 1, 3000)) {
        throw new ApiError(400, 'Message cannot exceed 3000 characters and must not contain HTML tags, template injection ({ }), or keyboard gibberish');
    }

    // Verify CAPTCHA
    verifyCaptcha(raw.captchaToken, raw.captchaAnswer);


    const id = `ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const query = `
        INSERT INTO admission_inquiries (id, studentName, parentName, email, phone, grade, message, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')
    `;

    await pool.query(query, [id, studentName, parentName, email, phone, grade, message]);

    res.status(201).json(ApiResponse.success({ id }, 'Admission inquiry submitted successfully'));
});

export const getAdmissionInquiries = asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await pool.query('SELECT * FROM admission_inquiries ORDER BY createdAt DESC');
    res.json(ApiResponse.success(rows, 'Admission inquiries fetched successfully'));
});

export const updateAdmissionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, 'Status is required');
    }

    const [result]: any = await pool.query(
        'UPDATE admission_inquiries SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
    );

    if (result.affectedRows === 0) {
        throw new ApiError(404, 'Inquiry not found');
    }

    res.json(ApiResponse.success(null, 'Status updated successfully'));
});

export const deleteAdmissionInquiry = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM admission_inquiries WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        throw new ApiError(404, 'Inquiry not found');
    }

    res.json(ApiResponse.success(null, 'Inquiry deleted successfully'));
});

// --- Contact Inquiries ---

export const createContactInquiry = asyncHandler(async (req: Request, res: Response) => {
    // Use req.rawBody (original, pre-sanitization body) for rejection checks.
    // This ensures malicious payloads are actively rejected with 400 rather than
    // silently stripped by sanitizeMiddleware and accepted with 201 (CWE-20 fix).
    const original = (req as any).rawBody || req.body;
    const raw = req.body; // already sanitized by middleware

    // === Strict parameter whitelist and prototype pollution prevention (CWE-20) ===
    const allowedContactFields = new Set(['fullName', 'email', 'phone', 'subject', 'message', 'captchaToken', 'captchaAnswer']);
    for (const key of Object.keys(original)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            throw new ApiError(400, 'Prototype pollution attempt detected');
        }
        if (!allowedContactFields.has(key)) {
            throw new ApiError(400, `Unexpected field '${key}' is not allowed in form submissions`);
        }
    }

    // === Strict type enforcement: all expected fields must be plain strings ===
    const stringFields = ['fullName', 'email', 'phone', 'subject', 'message', 'captchaToken', 'captchaAnswer'];
    for (const field of stringFields) {
        const val = original[field];
        if (val !== undefined && val !== null && typeof val !== 'string') {
            throw new ApiError(400, `Invalid input: '${field}' must be a plain text string`);
        }
    }

    // === Reject malicious content detected in the ORIGINAL (pre-sanitized) body ===
    if (
        containsDangerousChars(original.fullName) ||
        containsDangerousChars(original.email) ||
        containsDangerousChars(original.phone) ||
        containsDangerousChars(original.subject) ||
        containsDangerousChars(original.message)
    ) {
        throw new ApiError(400, 'HTML tags, script elements, angle brackets (< >), curly braces ({ }), and dangerous characters are not allowed in form submissions');
    }

    // Reject CRLF injection in name and phone (prevents header injection / log poisoning)
    if (/[\r\n\0]/.test(original.fullName || '') ||
        /[\r\n\0]/.test(original.phone || '')) {
        throw new ApiError(400, 'Control characters (newlines, null bytes) are not permitted in form fields');
    }

    const fullName = sanitizeString(raw.fullName);
    const email = sanitizeEmail(raw.email);
    const phone = sanitizeString(raw.phone ?? '');
    const subject = sanitizeString(raw.subject);
    const message = sanitizeString(raw.message);

    if (!fullName || !email || !subject || !message) {
        throw new ApiError(400, 'Full Name, Email, Subject, and Message are required');
    }

    if (!isValidName(fullName)) {
        throw new ApiError(400, 'Invalid Full Name format. Names must be 2-50 characters, contain valid syllables/vowels, and no keyboard mash or special characters.');
    }

    const emailCheck = await validateEmailDeliverable(email);
    if (!emailCheck.valid) {
        throw new ApiError(400, emailCheck.error || 'Invalid Email address format');
    }

    if (phone && !isValidPhone(phone)) {
        throw new ApiError(400, 'Invalid Phone number format. Please enter a valid 10-digit Indian mobile number or international format (+...).');
    }

    // Validate subject and message using sanitized variables (not raw) — fixes the
    // previous inconsistency where raw.subject / raw.message were validated after
    // the middleware had already modified them via sanitizeDeep.
    if (!isValidSubject(subject)) {
        throw new ApiError(400, 'Subject must be between 3 and 150 characters and cannot contain HTML, template injection ({ }), or keyboard gibberish');
    }

    if (!isValidMessage(message)) {
        throw new ApiError(400, 'Message must be between 5 and 3000 characters and cannot contain HTML tags, template injection ({ }), or keyboard gibberish');
    }

    // Verify CAPTCHA
    verifyCaptcha(raw.captchaToken, raw.captchaAnswer);


    const id = `CON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const query = `
        INSERT INTO contact_inquiries (id, fullName, email, phone, subject, message, status)
        VALUES (?, ?, ?, ?, ?, ?, 'New')
    `;

    await pool.query(query, [id, fullName, email, phone, subject, message]);

    res.status(201).json(ApiResponse.success({ id }, 'Message sent successfully'));
});

export const getContactInquiries = asyncHandler(async (req: Request, res: Response) => {
    const [rows] = await pool.query('SELECT * FROM contact_inquiries ORDER BY createdAt DESC');
    res.json(ApiResponse.success(rows, 'Contact inquiries fetched successfully'));
});

export const updateContactStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, 'Status is required');
    }

    const [result]: any = await pool.query(
        'UPDATE contact_inquiries SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
    );

    if (result.affectedRows === 0) {
        throw new ApiError(404, 'Inquiry not found');
    }

    res.json(ApiResponse.success(null, 'Status updated successfully'));
});

export const deleteContactInquiry = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM contact_inquiries WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        throw new ApiError(404, 'Inquiry not found');
    }

    res.json(ApiResponse.success(null, 'Inquiry deleted successfully'));
});
