interface StatsBarProps {
  stats: {
    total: number
    vacant: number
    occupied: number
  }
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <StatCard label="总计" value={stats.total} variant="neutral" />
      <StatCard label="空置" value={stats.vacant} variant="warning" />
      <StatCard label="已租" value={stats.occupied} variant="success" />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  variant: "neutral" | "warning" | "success"
}

function StatCard({ label, value, variant }: StatCardProps) {
  const colors = {
    neutral: "text-primary",
    warning: "text-warning",
    success: "text-success",
  }

  return (
    <div className="glass-card glass-shimmer rounded-2xl px-6 py-4 flex-shrink-0 min-w-[110px]">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colors[variant]}`}>{value}</p>
    </div>
  )
}
