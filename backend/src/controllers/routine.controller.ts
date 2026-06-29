// @ts-nocheck
import { Response } from 'express';
import prisma from '../utils/prisma';
import {
  sendSuccess, sendCreated, sendError,
  sendNotFound, sendForbidden, sendServerError,
} from '../utils/response';
import { AuthenticatedRequest } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDateOnly = (d: Date | string) => {
  const dt = new Date(d);
  return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
};

// Should this routine run on a given date?
const shouldRunOn = (routine: { frequency: string; targetDays: number[] }, date: Date): boolean => {
  const dow = date.getDay(); // 0=Sun
  switch (routine.frequency) {
    case 'DAILY':    return true;
    case 'WEEKDAYS': return dow >= 1 && dow <= 5;
    case 'WEEKENDS': return dow === 0 || dow === 6;
    case 'WEEKLY':   return routine.targetDays.includes(dow);
    default:         return true;
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────
export const listRoutines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const routines = await prisma.routine.findMany({
      where: { userId },
      include: {
        logs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, 'Routines retrieved', routines);
  } catch (err) {
    console.error('listRoutines error:', err);
    sendServerError(res);
  }
};

export const getRoutine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const routine = await prisma.routine.findUnique({
      where: { id: req.params.id },
      include: { logs: { orderBy: { date: 'desc' }, take: 90 } },
    });
    if (!routine)                           { sendNotFound(res, 'Routine not found'); return; }
    if (routine.userId !== req.user!.id)    { sendForbidden(res);                    return; }
    sendSuccess(res, 'Routine retrieved', routine);
  } catch (err) {
    console.error('getRoutine error:', err);
    sendServerError(res);
  }
};

export const createRoutine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, frequency, targetDays, startTime, endTime, category } = req.body;
    const routine = await prisma.routine.create({
      data: {
        title,
        description: description ?? null,
        frequency:   frequency   ?? 'DAILY',
        targetDays:  targetDays  ?? [],
        startTime:   startTime   ?? '09:00',
        endTime:     endTime     ?? '10:00',
        category:    category    ?? 'OTHER',
        userId:      req.user!.id,
      },
    });
    sendCreated(res, 'Routine created', routine);
  } catch (err) {
    console.error('createRoutine error:', err);
    sendServerError(res);
  }
};

export const updateRoutine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.routine.findUnique({ where: { id: req.params.id } });
    if (!existing)                          { sendNotFound(res, 'Routine not found'); return; }
    if (existing.userId !== req.user!.id)   { sendForbidden(res);                    return; }

    const { title, description, frequency, targetDays, startTime, endTime, category, isActive } = req.body;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (title       !== undefined) data.title       = title;
    if (description !== undefined) data.description = description;
    if (frequency   !== undefined) data.frequency   = frequency;
    if (targetDays  !== undefined) data.targetDays  = targetDays;
    if (startTime   !== undefined) data.startTime   = startTime;
    if (endTime     !== undefined) data.endTime     = endTime;
    if (category    !== undefined) data.category    = category;
    if (isActive    !== undefined) data.isActive    = isActive;

    const routine = await prisma.routine.update({ where: { id: req.params.id }, data });
    sendSuccess(res, 'Routine updated', routine);
  } catch (err) {
    console.error('updateRoutine error:', err);
    sendServerError(res);
  }
};

export const deleteRoutine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.routine.findUnique({ where: { id: req.params.id } });
    if (!existing)                          { sendNotFound(res, 'Routine not found'); return; }
    if (existing.userId !== req.user!.id)   { sendForbidden(res);                    return; }
    await prisma.routine.delete({ where: { id: req.params.id } });
    sendSuccess(res, 'Routine deleted');
  } catch (err) {
    console.error('deleteRoutine error:', err);
    sendServerError(res);
  }
};

// ── Daily check-in ────────────────────────────────────────────────────────────
// GET /routines/today — returns all active routines + today's log status
export const getTodayRoutines = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const today  = toDateOnly(new Date());

    const routines = await prisma.routine.findMany({
      where: { userId, isActive: true },
      include: {
        logs: {
          where: { date: today },
          take: 1,
        },
      },
    });

    // Filter to those scheduled for today
    const todayRoutines = routines
      .filter((r) => shouldRunOn(r, new Date()))
      .map((r) => ({
        ...r,
        todayLog: r.logs[0] ?? null,
        todayStatus: r.logs[0]?.status ?? 'PENDING',
      }));

    sendSuccess(res, 'Today routines retrieved', todayRoutines);
  } catch (err) {
    console.error('getTodayRoutines error:', err);
    sendServerError(res);
  }
};

// POST /routines/:id/log — mark today's status
export const logRoutine = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const routine = await prisma.routine.findUnique({ where: { id: req.params.id } });
    if (!routine)                          { sendNotFound(res, 'Routine not found'); return; }
    if (routine.userId !== req.user!.id)   { sendForbidden(res);                    return; }

    const { status, note, date } = req.body;
    if (!['DONE', 'SKIPPED', 'MISSED', 'PENDING'].includes(status)) {
      sendError(res, 'Invalid status. Must be DONE, SKIPPED, MISSED, or PENDING', 422);
      return;
    }

    const logDate = date ? toDateOnly(date) : toDateOnly(new Date());

    const log = await prisma.routineLog.upsert({
      where: { routineId_date: { routineId: req.params.id, date: logDate } },
      update: { status, note: note ?? null },
      create: { routineId: req.params.id, date: logDate, status, note: note ?? null },
    });

    sendSuccess(res, 'Routine logged', log);
  } catch (err) {
    console.error('logRoutine error:', err);
    sendServerError(res);
  }
};

// GET /routines/:id/analytics — per-routine analytics
export const getRoutineAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const routine = await prisma.routine.findUnique({
      where: { id: req.params.id },
      include: { logs: { orderBy: { date: 'asc' } } },
    });
    if (!routine)                          { sendNotFound(res, 'Routine not found'); return; }
    if (routine.userId !== req.user!.id)   { sendForbidden(res);                    return; }

    const logs = routine.logs;
    const total     = logs.length;
    const done      = logs.filter((l) => l.status === 'DONE').length;
    const skipped   = logs.filter((l) => l.status === 'SKIPPED').length;
    const missed    = logs.filter((l) => l.status === 'MISSED').length;
    const adherence = total > 0 ? Math.round((done / total) * 100) : 0;

    // Current streak
    let streak = 0;
    const doneSet = new Set(logs.filter((l) => l.status === 'DONE').map((l) => l.date.toISOString().slice(0, 10)));
    const d = new Date();
    while (true) {
      if (!doneSet.has(d.toISOString().slice(0, 10))) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }

    // Best streak
    let bestStreak = 0, cur = 0;
    for (const log of logs) {
      if (log.status === 'DONE') { cur++; bestStreak = Math.max(bestStreak, cur); }
      else cur = 0;
    }

    // Last 30 days timeline
    const last30: { date: string; status: string }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date.toISOString().slice(0, 10) === key);
      const runs = shouldRunOn(routine, dt);
      last30.push({
        date: key,
        status: log?.status ?? (runs ? 'PENDING' : 'N/A'),
      });
    }

    // Day-of-week adherence
    const dowMap: number[] = Array(7).fill(0);
    const dowTotal: number[] = Array(7).fill(0);
    for (const log of logs) {
      const dow = new Date(log.date).getDay();
      dowTotal[dow]++;
      if (log.status === 'DONE') dowMap[dow]++;
    }
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const dowAdherence = dayNames.map((day, i) => ({
      day,
      done:     dowMap[i],
      total:    dowTotal[i],
      adherence: dowTotal[i] > 0 ? Math.round((dowMap[i] / dowTotal[i]) * 100) : 0,
    }));

    sendSuccess(res, 'Routine analytics retrieved', {
      routine: { id: routine.id, title: routine.title, frequency: routine.frequency },
      summary: { total, done, skipped, missed, adherence, streak, bestStreak },
      last30,
      dowAdherence,
    });
  } catch (err) {
    console.error('getRoutineAnalytics error:', err);
    sendServerError(res);
  }
};

// GET /routines/overview — aggregated analytics across all routines
export const getRoutinesOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);

    const routines = await prisma.routine.findMany({
      where: { userId },
      include: { logs: { where: { date: { gte: monthAgo } }, orderBy: { date: 'asc' } } },
    });

    const overview = routines.map((r) => {
      const total   = r.logs.length;
      const done    = r.logs.filter((l) => l.status === 'DONE').length;
      const adherence = total > 0 ? Math.round((done / total) * 100) : 0;

      let streak = 0;
      const doneSet = new Set(r.logs.filter((l) => l.status === 'DONE').map((l) => l.date.toISOString().slice(0,10)));
      const d = new Date();
      while (doneSet.has(d.toISOString().slice(0,10))) { streak++; d.setDate(d.getDate()-1); }

      return {
        id: r.id, title: r.title, category: r.category,
        frequency: r.frequency, isActive: r.isActive,
        adherence, streak, total, done,
      };
    });

    // Last 30 days: daily % of routines completed
    const dailyCompletion: { date: string; label: string; rate: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      let dayDone = 0, dayTotal = 0;
      for (const r of routines) {
        if (!r.isActive || !shouldRunOn(r, dt)) continue;
        dayTotal++;
        const log = r.logs.find((l) => l.date.toISOString().slice(0,10) === key);
        if (log?.status === 'DONE') dayDone++;
      }
      dailyCompletion.push({
        date: key,
        label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0,
      });
    }

    sendSuccess(res, 'Routines overview retrieved', { overview, dailyCompletion });
  } catch (err) {
    console.error('getRoutinesOverview error:', err);
    sendServerError(res);
  }
};
