'use client';

import { PROJECT } from '@/lib/projectInfo';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
      <div>
        <h1 className="text-white font-semibold text-sm">{title}</h1>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{PROJECT.floorArea}</span>
        <span className="text-slate-700">|</span>
        <span>{PROJECT.floors}</span>
        <span className="text-slate-700">|</span>
        <span>{PROJECT.budget}</span>
      </div>
    </header>
  );
}
