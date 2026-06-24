import { Response } from 'express';
import prisma from '../utils/prisma';
import {
  sendSuccess, sendCreated,
  sendNotFound, sendForbidden, sendServerError,
} from '../utils/response';
import { AuthenticatedRequest, PaginatedResponse } from '../types';

// ── GET /schedules ────────────────────────────────────────────────────────────
export const listSchedules = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId    = req.user!.id;
    const page      = Math.max(1, Number(req.query.page)  || 1);
    const limit     = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const sortBy    = (req.query.sortBy    as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
    const search    = req.query.search    as string | undefined;
    const status    = req.query.status    as string | undefined;
    const category  = req.query.category  as string | undefined;
    const priority  = req.query.priority  as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate   = req.query.endDate   as string | undefined;

    // Build where clause dynamically to avoid Prisma namespace issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };
    if (status)   where.status   = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search)   where.OR = [
      { title:       { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate);
      if (endDate)   where.startTime.lte = new Date(endDate);
    }

    const [items, total] = await prisma.$transaction([
      prisma.schedule.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.schedule.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const payload: PaginatedResponse<typeof items[0]> = {
      items, total, page, limit, totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };

    sendSuccess(res, 'Schedules retrieved', payload);
  } catch (err) {
    console.error('listSchedules error:', err);
    sendServerError(res);
  }
};

// ── GET /schedules/stats ──────────────────────────────────────────────────────
export const getScheduleStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId    = req.user!.id;
    const now       = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const [byStatus, byCategory, byPriority, thisWeek, upcoming] = await prisma.$transaction([
      prisma.schedule.groupBy({ by: ['status'],   where: { userId }, _count: true }),
      prisma.schedule.groupBy({ by: ['category'], where: { userId }, _count: true }),
      prisma.schedule.groupBy({ by: ['priority'], where: { userId }, _count: true }),
      prisma.schedule.count({ where: { userId, startTime: { gte: weekStart } } }),
      prisma.schedule.count({ where: { userId, startTime: { gte: now }, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
    ]);

    sendSuccess(res, 'Stats retrieved', { byStatus, byCategory, byPriority, thisWeek, upcoming });
  } catch (err) {
    console.error('getScheduleStats error:', err);
    sendServerError(res);
  }
};

// ── GET /schedules/:id ────────────────────────────────────────────────────────
export const getSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const schedule = await prisma.schedule.findUnique({ where: { id: req.params.id } });
    if (!schedule)                          { sendNotFound(res, 'Schedule not found'); return; }
    if (schedule.userId !== req.user!.id)   { sendForbidden(res);                     return; }
    sendSuccess(res, 'Schedule retrieved', schedule);
  } catch (err) {
    console.error('getSchedule error:', err);
    sendServerError(res);
  }
};

// ── POST /schedules ───────────────────────────────────────────────────────────
export const createSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, priority, status, startTime, endTime } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        title,
        description: description ?? null,
        category:    category    ?? 'OTHER',
        priority:    priority    ?? 'MEDIUM',
        status:      status      ?? 'PENDING',
        startTime:   new Date(startTime),
        endTime:     new Date(endTime),
        userId:      req.user!.id,
      },
    });
    sendCreated(res, 'Schedule created', schedule);
  } catch (err) {
    console.error('createSchedule error:', err);
    sendServerError(res);
  }
};

// ── PATCH /schedules/:id ──────────────────────────────────────────────────────
export const updateSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.schedule.findUnique({ where: { id: req.params.id } });
    if (!existing)                          { sendNotFound(res, 'Schedule not found'); return; }
    if (existing.userId !== req.user!.id)   { sendForbidden(res);                     return; }

    const { title, description, category, priority, status, startTime, endTime } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (title       !== undefined) data.title       = title;
    if (description !== undefined) data.description = description;
    if (category    !== undefined) data.category    = category;
    if (priority    !== undefined) data.priority    = priority;
    if (status      !== undefined) data.status      = status;
    if (startTime   !== undefined) data.startTime   = new Date(startTime);
    if (endTime     !== undefined) data.endTime     = new Date(endTime);

    const schedule = await prisma.schedule.update({ where: { id: req.params.id }, data });
    sendSuccess(res, 'Schedule updated', schedule);
  } catch (err) {
    console.error('updateSchedule error:', err);
    sendServerError(res);
  }
};

// ── DELETE /schedules/:id ─────────────────────────────────────────────────────
export const deleteSchedule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.schedule.findUnique({ where: { id: req.params.id } });
    if (!existing)                          { sendNotFound(res, 'Schedule not found'); return; }
    if (existing.userId !== req.user!.id)   { sendForbidden(res);                     return; }
    await prisma.schedule.delete({ where: { id: req.params.id } });
    sendSuccess(res, 'Schedule deleted');
  } catch (err) {
    console.error('deleteSchedule error:', err);
    sendServerError(res);
  }
};
