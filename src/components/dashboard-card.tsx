import { LucideIcon } from "lucide-react"


interface DashboardCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description?: string
  valuePrefix?: string
  iconColor?: string
  iconBgColor?: string
}

export default function DashboardCard({
  title,
  value,
  icon: Icon,
  description,
  valuePrefix = "",
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
}: DashboardCardProps) {
  return (
    <div className="rounded-lg border border-border p-6 bg-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-foreground">
            {valuePrefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
