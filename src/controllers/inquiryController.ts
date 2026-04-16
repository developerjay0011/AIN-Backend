import { Request, Response, NextFunction } from 'express';
import pool from '../config/db.js';
import { ApiResponse, ApiError } from '../utils/ApiResponse.js';

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Admission Inquiries ---

export const createAdmissionInquiry = asyncHandler(async (req: Request, res: Response) => {
    const { studentName, parentName, email, phone, grade, message } = req.body;

    if (!studentName || !parentName || !email || !phone || !grade) {
        throw new ApiError(400, 'Student Name, Parent Name, Email, Phone, and Grade are required');
    }

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
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
        throw new ApiError(400, 'Full Name, Email, Subject, and Message are required');
    }

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
