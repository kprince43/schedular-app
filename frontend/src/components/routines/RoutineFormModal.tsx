'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Routine, RoutineFormValues, RoutineFrequency } from '@/types';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const schema = z.object({
  title:       z.string().min(2, 'At least 2 characters').max(100),
  description: z.string().max(300).optional(),
  frequency:   z.enum(['DAILY', 'WEEKLY', 'WEEKDAYS', 'WEEKENDS']),
  targetDays:  z.array(z.number()).default([]),
  startTime:   z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  endTime:     z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format'),
  category:    z.enum(['WORK','PERSONAL','HEALTH','EDUCATION','FINANCE','SOCIAL','OTHER']),
  isActive:    z.boolean().default(true),
}).refine((d) => d.endTime > d.startTime, { message: 'End must be after start', path: ['endTime'] });

type FormValues = z.infer<typeof schema>;

interface RoutineFormModalProps {
  isOpen:       boolean;
  routine?:     Routine | null;
  onClose:      () => void;
  onSubmit:     (data: RoutineFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function RoutineFormModal({ isOpen, routine, onClose, onSubmit, isSubmitting }: RoutineFormModalProps) {
  const isEdit = !!routine;
  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '', frequency: 'DAILY', targetDays: [],
      startTime: '09:00', endTime: '10:00', category: 'WORK', isActive: true,
    },
  });

  const frequency = watch('frequency');

  useEffect(() => {
    if (!isOpen) return;
    if (routine) {
      reset({
        title:       routine.title,
        description: routine.description ?? '',
        frequency:   routine.frequency,
        targetDays:  routine.targetDays,
        startTime:   routine.startTime,
        endTime:     routine.endTime,
        category:    routine.category,
        isActive:    routine.isActive,
      });
    } else {
      reset({ title: '', description: '', frequency: 'DAILY', targetDays: [],
        startTime: '09:00', endTime: '10:00', category: 'WORK', isActive: true });
    }
  }, [isOpen, routine, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">{isEdit ? 'Edit Routine' : 'New Routine'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Routines repeat on a schedule you define</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit as never)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-4">

            {/* Title */}
            <div>
              <label className="form-label">Title *</label>
              <input {...register('title')} placeholder="e.g. Morning workout, Read 30 min"
                className={cn('form-input', errors.title && 'border-red-400')} />
              {errors.title && <p className="error-text"><AlertCircle className="h-3 w-3" />{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="form-label">Description</label>
              <textarea {...register('description')} rows={2} placeholder="Optional notes…"
                className="form-input resize-none" />
            </div>

            {/* Category + Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select {...register('category')} className="form-input bg-white appearance-none">
                  {[['WORK','💼 Work'],['PERSONAL','🏠 Personal'],['HEALTH','❤️ Health'],
                    ['EDUCATION','📚 Education'],['FINANCE','💰 Finance'],
                    ['SOCIAL','👥 Social'],['OTHER','📌 Other']
                  ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Frequency</label>
                <select {...register('frequency')} className="form-input bg-white appearance-none">
                  <option value="DAILY">Every day</option>
                  <option value="WEEKDAYS">Weekdays (Mon–Fri)</option>
                  <option value="WEEKENDS">Weekends (Sat–Sun)</option>
                  <option value="WEEKLY">Custom days</option>
                </select>
              </div>
            </div>

            {/* Target days (only for WEEKLY) */}
            {frequency === 'WEEKLY' && (
              <div>
                <label className="form-label">Run on these days</label>
                <Controller
                  name="targetDays"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2 flex-wrap">
                      {DAY_LABELS.map((day, i) => {
                        const selected = field.value.includes(i);
                        return (
                          <button key={day} type="button"
                            onClick={() => field.onChange(
                              selected ? field.value.filter((d: number) => d !== i) : [...field.value, i]
                            )}
                            className={cn(
                              'w-11 h-11 rounded-xl text-sm font-medium border transition-all',
                              selected ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            )}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.targetDays && <p className="error-text"><AlertCircle className="h-3 w-3" />Select at least one day</p>}
              </div>
            )}

            {/* Time range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start time</label>
                <input type="time" {...register('startTime')}
                  className={cn('form-input', errors.startTime && 'border-red-400')} />
                {errors.startTime && <p className="error-text"><AlertCircle className="h-3 w-3" />{errors.startTime.message}</p>}
              </div>
              <div>
                <label className="form-label">End time</label>
                <input type="time" {...register('endTime')}
                  className={cn('form-input', errors.endTime && 'border-red-400')} />
                {errors.endTime && <p className="error-text"><AlertCircle className="h-3 w-3" />{errors.endTime.message}</p>}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Active</p>
                <p className="text-xs text-slate-500">Show in daily check-in</p>
              </div>
              <Controller name="isActive" control={control} render={({ field }) => (
                <button type="button" onClick={() => field.onChange(!field.value)}
                  className={cn('w-11 h-6 rounded-full transition-colors', field.value ? 'bg-brand-600' : 'bg-slate-200')}>
                  <span className={cn('block w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5',
                    field.value ? 'translate-x-5' : 'translate-x-0')} />
                </button>
              )} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-100 shrink-0">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin" />{isEdit ? 'Saving…' : 'Creating…'}</>
                : isEdit ? 'Save changes' : 'Create routine'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
