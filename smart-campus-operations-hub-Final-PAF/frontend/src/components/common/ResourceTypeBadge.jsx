import React from 'react';
import clsx from 'clsx';

const LABELS = {
  LECTURE_HALL: 'Lecture hall',
  LAB: 'Lab',
  MEETING_ROOM: 'Meeting room',
  EQUIPMENT: 'Equipment',
};

export function ResourceTypeBadge({ value }) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide';
  const color =
    value === 'EQUIPMENT'
      ? 'border-sky-200 bg-sky-50 text-sky-800 shadow-[0_1px_2px_rgba(14,165,233,0.1)]'
      : value === 'LAB'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 shadow-[0_1px_2px_rgba(16,185,129,0.1)]'
        : value === 'MEETING_ROOM'
          ? 'border-amber-200 bg-amber-50 text-amber-800 shadow-[0_1px_2px_rgba(245,158,11,0.1)]'
          : 'border-slate-200 bg-slate-50 text-slate-800 shadow-[0_1px_2px_rgba(100,116,139,0.1)]';

  const icon =
    value === 'EQUIPMENT'
      ? '🎛'
      : value === 'LAB'
        ? '🧪'
        : value === 'MEETING_ROOM'
          ? '💼'
          : '🏫';

  return (
    <span className={clsx(base, color)}>
      <span aria-hidden="true">{icon}</span>
      <span>{LABELS[value] || value}</span>
    </span>
  );
}

