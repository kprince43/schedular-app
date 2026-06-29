// @ts-nocheck
import { Response } from 'express';
import prisma from '../utils/prisma';
import { sendSuccess, sendServerError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

// Utility: get start of day in UTC
const startOfDay = (d: Date) => { const x = new Date(d); x.setUTCHours(0,0,0,0); return x; };
const endOfDay   = (d: Date) => { const x = new Date(d); x.setUTCHours(23,59,59,999); return x; };

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now    = new Date();

    // Date ranges
    const today      = startOfDay(now);
    const weekAgo    = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo   = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);
    const weekStart  = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); startOfDay(weekStart);

    // ── Core counts ──────────────────────────────────────────────────────────
    const [
      totalSchedules,
      completedSchedules,
      missedSchedules,
      pendingSchedules,
      inProgressSchedules,
      cancelledSchedules,
    ] = await prisma.$transaction([
      prisma.schedule.count({ where: { userId } }),
      prisma.schedule.count({ where: { userId, status: 'COMPLETED' } }),
      prisma.schedule.count({ where: { userId, status: 'CANCELLED', endTime: { lt: now } } }),
      prisma.schedule.count({ where: { userId, status: 'PENDING' } }),
      prisma.schedule.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.schedule.count({ where: { userId, status: 'CANCELLED' } }),
    ]);

    const completionRate = totalSchedules > 0
      ? Math.round((completedSchedules / totalSchedules) * 100)
      : 0;

    // ── Category distribution ─────────────────────────────────────────────────
    const byCategory = await prisma.schedule.groupBy({
      by: ['category'],
      where: { userId },
      _count: { _all: true },
      orderBy: { _count: { category: 'desc' } },
    });

    // ── Priority distribution ─────────────────────────────────────────────────
    const byPriority = await prisma.schedule.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { _all: true },
    });

    // ── Status distribution ───────────────────────────────────────────────────
    const byStatus = await prisma.schedule.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });

    // ── Last 30 days: daily completed count (trend line) ─────────────────────
    const last30Schedules = await prisma.schedule.findMany({
      where: { userId, createdAt: { gte: monthAgo } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build 30-day array
    const dailyMap: Record<string, { created: number; completed: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { created: 0, completed: 0 };
    }
    for (const s of last30Schedules as { createdAt: Date; status: string }[]) {
      const key = s.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) {
        dailyMap[key].created++;
        if (s.status === 'COMPLETED') dailyMap[key].completed++;
      }
    }
    const dailyTrend = Object.entries(dailyMap).map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created:   v.created,
      completed: v.completed,
    }));

    // ── Last 7 days: completion by day of week ────────────────────────────────
    const last7 = await prisma.schedule.findMany({
      where: { userId, startTime: { gte: weekAgo } },
      select: { startTime: true, status: true },
    });
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeklyMap: Record<string, { total: number; completed: number }> = {};
    dayNames.forEach((d) => { weeklyMap[d] = { total: 0, completed: 0 }; });
    for (const s of last7) {
      const day = dayNames[new Date(s.startTime).getDay()];
      weeklyMap[day].total++;
      if (s.status === 'COMPLETED') weeklyMap[day].completed++;
    }
    const weeklyActivity = dayNames.map((day) => ({
      day,
      total:     weeklyMap[day].total,
      completed: weeklyMap[day].completed,
      rate: weeklyMap[day].total > 0
        ? Math.round((weeklyMap[day].completed / weeklyMap[day].total) * 100)
        : 0,
    }));

    // ── Hour distribution (when are schedules typically scheduled?) ───────────
    const allSchedules = await prisma.schedule.findMany({
      where: { userId },
      select: { startTime: true, status: true },
    });
    const hourMap: number[] = Array(24).fill(0);
    for (const s of allSchedules) {
      hourMap[new Date(s.startTime).getHours()]++;
    }
    const hourlyDistribution = hourMap.map((count, hour) => ({
      hour: `${hour.toString().padStart(2,'0')}:00`,
      count,
    }));

    // ── Productivity score (composite metric) ────────────────────────────────
    const recentCompleted = await prisma.schedule.count({
      where: { userId, status: 'COMPLETED', updatedAt: { gte: weekAgo } },
    });
    const recentTotal = await prisma.schedule.count({
      where: { userId, createdAt: { gte: weekAgo } },
    });
    const weeklyRate = recentTotal > 0 ? Math.round((recentCompleted / recentTotal) * 100) : 0;
    const streak = await getCompletionStreak(userId);
    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) + (weeklyRate * 0.4) + (Math.min(streak, 7) / 7 * 20)
    ));

    sendSuccess(res, 'Analytics retrieved', {
      summary: {
        total:       totalSchedules,
        completed:   completedSchedules,
        missed:      missedSchedules,
        pending:     pendingSchedules,
        inProgress:  inProgressSchedules,
        cancelled:   cancelledSchedules,
        completionRate,
        productivityScore,
        streak,
        weeklyRate,
      },
      byCategory: byCategory.map((c: { category: string; _count: { _all: number } }) => ({ name: c.category, value: c._count._all })),
      byPriority: byPriority.map((p: { priority: string; _count: { _all: number } }) => ({ name: p.priority, value: p._count._all })),
      byStatus:   byStatus.map((s: { status: string; _count: { _all: number } }) => ({ name: s.status,   value: s._count._all })),
      dailyTrend,
      weeklyActivity,
      hourlyDistribution,
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    sendServerError(res);
  }
};

// Helper: count consecutive days with at least 1 completed schedule
async function getCompletionStreak(userId: string): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logs = await prisma.schedule.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 60,
  });

  const days = new Set(logs.map((l) => l.updatedAt.toISOString().slice(0, 10)));
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
