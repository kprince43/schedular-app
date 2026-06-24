'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Schedule, ScheduleFormValues } from '@/types';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title too long'),
  description: z.string().max(500, 'Max 500 characters').optional(),
  category:  z.enum(['WORK','PERSONAL','HEALTH','EDUCATION','FINANCE','SOCIAL','OTHER']),
  priority:  z.enum(['LOW','MEDIUM','HIGH','URGENT']),
  status:    z.enum(['PENDING','IN_PROGRESS','COMPLETED','CANCELLED']),
  startTime: z.string().min(1, 'Start time is required'),
  endTime:   z.string().min(1, 'End time is required'),
}).refine((d) => new Date(d.endTime) > new Date(d.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type FormValues = z.infer<typeof schema>;

interface ScheduleFormModalProps {
  isOpen:      boolean;
  schedule?:   Schedule | null;
  onClose:     () => void;
  onSubmit:    (data: ScheduleFormValues) => Promise<void>;
  isSubmitting:boolean;
}

// Convert a JS date to datetime-local value string
const toDatetimeLocal = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const defaultStart = () => {
  const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1);
  return toDatetimeLocal(d.toISOString());
};
const defaultEnd = () => {
  const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 2);
  return toDatetimeLocal(d.toISOString());
};

export default function ScheduleFormModal({
  isOpen, schedule, onClose, onSubmit, isSubmitting,
}: ScheduleFormModalProps) {
  const isEdit = !!schedule;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', description: '',
      category: 'WORK', priority: 'MEDIUM', status: 'PENDING',
      startTime: defaultStart(), endTime: defaultEnd(),
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (schedule) {
      reset({
        title:       schedule.title,
        description: schedule.description ?? '',
        category:    schedule.category,
        priority:    schedule.priority,
        status:      schedule.status,
        startTime:   toDatetimeLocal(schedule.startTime),
        endTime:     toDatetimeLocal(schedule.endTime),
      });
    } else {
      reset({
        title: '', description: '',
        category: 'WORK', priority: 'MEDIUM', status: 'PENDING',
        startTime: defaultStart(), endTime: defaultEnd(),
      });
    }
  }, [isOpen, schedule, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmit({
      ...values,
      startTime: new Date(values.startTime).toISOString(),
      endTime:   new Date(values.endTime).toISOString(),
    });
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="error-text"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  );

  const selectClass = (hasError?: boolean) =>
    cn('form-input bg-white appearance-none cursor-pointer', hasError && 'border-red-400 focus:border-red-400');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">
              {isEdit ? 'Edit Schedule' : 'New Schedule'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update the schedule details below' : 'Fill in the details to create a schedule'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto p-6 space-y-4">

            <Field label="Title *" error={errors.title?.message}>
              <input
                {...register('title')}
                placeholder="e.g. Team standup, Doctor appointment"
                className={cn('form-input', errors.title && 'border-red-400')}
              />
            </Field>

            <Field label="Description" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Optional details or notes…"
                className={cn('form-input resize-none', errors.description && 'border-red-400')}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" error={errors.category?.message}>
                <select {...register('category')} className={selectClass(!!errors.category)}>
                  {[['WORK','💼 Work'],['PERSONAL','🏠 Personal'],['HEALTH','❤️ Health'],
                    ['EDUCATION','📚 Education'],['FINANCE','💰 Finance'],
                    ['SOCIAL','👥 Social'],['OTHER','📌 Other']
                  ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </Field>

              <Field label="Priority" error={errors.priority?.message}>
                <select {...register('priority')} className={selectClass(!!errors.priority)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </Field>
            </div>

            <Field label="Status" error={errors.status?.message}>
              <select {...register('status')} className={selectClass(!!errors.status)}>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Time *" error={errors.startTime?.message}>
                <input
                  type="datetime-local"
                  {...register('startTime')}
                  className={cn('form-input', errors.startTime && 'border-red-400')}
                />
              </Field>

              <Field label="End Time *" error={errors.endTime?.message}>
                <input
                  type="datetime-local"
                  {...register('endTime')}
                  className={cn('form-input', errors.endTime && 'border-red-400')}
                />
              </Field>
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
                : isEdit ? 'Save changes' : 'Create schedule'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
