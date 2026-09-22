import { clsx } from 'clsx';

export default function KpiCard({ icon: Icon, label, value, sub, variant = 'neutral' }) {
  const variantStyles = {
    neutral: { border: 'border-[#1a3a6b]', icon: 'text-[#8892a4]', val: 'text-white' },
    accent:  { border: 'border-[#00d4ff]/40 shadow-cyan-500/10', icon: 'text-[#00d4ff]', val: 'text-[#00d4ff]' },
    danger:  { border: 'border-[#ff3b3b]/40 shadow-red-500/10',  icon: 'text-[#ff3b3b]', val: 'text-[#ff3b3b]' },
    warning: { border: 'border-[#ff9500]/40 shadow-amber-500/10', icon: 'text-[#ff9500]', val: 'text-[#ff9500]' },
    calm:    { border: 'border-[#00c851]/40 shadow-green-500/10', icon: 'text-[#00c851]', val: 'text-[#00c851]' },
  }[variant] || { border: 'border-[#1a3a6b]', icon: 'text-[#8892a4]', val: 'text-white' };

  return (
    <div
      className={clsx(
        'rounded-xl px-3.5 py-2.5 flex flex-col gap-1 border bg-[#0d1f3c] transition-all duration-300 shadow-md hover:border-[#00d4ff]/60',
        variantStyles.border
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider uppercase text-[#8892a4]">
          {label}
        </span>
        {Icon && <Icon size={15} className={variantStyles.icon} />}
      </div>
      <div className={clsx('text-lg sm:text-xl font-black font-mono tracking-tight leading-tight', variantStyles.val)}>
        {value}
      </div>
      {sub && (
        <div className="text-[10px] text-[#8892a4]/80 font-medium truncate mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}
