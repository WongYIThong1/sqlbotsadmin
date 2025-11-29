import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: LucideIcon
}

export function StatsCard({ title, value, change, changeType = "neutral", icon: Icon }: StatsCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-card-foreground">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-xs",
                  changeType === "positive" && "text-emerald-500",
                  changeType === "negative" && "text-red-500",
                  changeType === "neutral" && "text-muted-foreground",
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <Icon size={24} className="text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
