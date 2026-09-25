import { clsx } from 'clsx';

export default function KpiCard({ icon: Icon, label, value, sub, variant = 'neutral' }) {
  const variantStyles = {
    neutral: { border: 'border-slate-200 dark:border-[#1a3a6b]', icon: 'text-slate-500 dark:text-[#8892a4]', val: 'text-slate-900 dark:text-white' },
    accent:  { border: 'border-cyan-300 dark:border-[#00d4ff]/40 shadow-cyan-500/10', icon: 'text-cyan-600 dark:text-[#00d4ff]', val: 'text-cyan-700 dark:text-[#00d4ff]' },
    danger:  { border: 'border-red-300 dark:border-[#ff3b3b]/40 shadow-red-500/10',  icon: 'text-red-500 dark:text-[#ff3b3b]', val: 'text-red-600 dark:text-[#ff3b3b]' },
    warning: { border: 'border-amber-300 dark:border-[#ff9500]/40 shadow-amber-500/10', icon: 'text-amber-500 dark:text-[#ff9500]', val: 'text-amber-600 dark:text-[#ff9500]' },
    calm:    { border: 'border-emerald-300 dark:border-[#00c851]/40 shadow-green-500/10', icon: 'text-emerald-500 dark:text-[#00c851]', val: 'text-emerald-600 dark:text-[#00c851]' },
  }[variant] || { border: 'border-slate-200 dark:border-[#1a3a6b]', icon: 'text-slate-500 dark:text-[#8892a4]', val: 'text-slate-900 dark:text-white' };

  return (
    <div
      className={clsx(
        'rounded-xl px-3.5 py-2.5 flex flex-col gap-1 border bg-white dark:bg-[#0d1f3c] transition-all duration-300 shadow-sm hover:border-cyan-500/60',
        variantStyles.border
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 dark:text-[#8892a4]">
          {label}
        </span>
        {Icon && <Icon size={15} className={variantStyles.icon} />}
      </div>
      <div className={clsx('text-lg sm:text-xl font-black font-mono tracking-tight leading-tight', variantStyles.val)}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-500 dark:text-[#8892a4]/80 font-medium truncate mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}
