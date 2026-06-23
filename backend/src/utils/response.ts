import { Response } from 'express';
import { ApiResponse, ValidationError } from '../types';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): Response => {
  const response: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: ValidationError[]
): Response => {
  const response: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, message: string, data?: T): Response => {
  return sendSuccess(res, message, data, 201);
};

export const sendUnauthorized = (res: Response, message = 'Unauthorized'): Response => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message = 'Forbidden'): Response => {
  return sendError(res, message, 403);
};

export const sendNotFound = (res: Response, message = 'Resource not found'): Response => {
  return sendError(res, message, 404);
};

export const sendServerError = (res: Response, message = 'Internal server error'): Response => {
  return sendError(res, message, 500);
};
