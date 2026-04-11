/**
 * Standard API Response Class
 */
export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;

  constructor(success: boolean, message: string, data?: T) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message: string = 'Success') {
    return new ApiResponse(true, message, data);
  }

  static error(message: string = 'Error', data?: any) {
    return new ApiResponse(false, message, data);
  }
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
