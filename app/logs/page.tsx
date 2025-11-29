import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

const logs = [
  { id: 1, timestamp: "2024-11-29 14:32:15", level: "INFO", message: "User login successful", source: "auth-service" },
  {
    id: 2,
    timestamp: "2024-11-29 14:30:45",
    level: "WARN",
    message: "Rate limit approaching threshold",
    source: "api-gateway",
  },
  {
    id: 3,
    timestamp: "2024-11-29 14:28:22",
    level: "ERROR",
    message: "Database connection timeout",
    source: "db-service",
  },
  {
    id: 4,
    timestamp: "2024-11-29 14:25:10",
    level: "INFO",
    message: "Scheduled job completed",
    source: "cron-service",
  },
  {
    id: 5,
    timestamp: "2024-11-29 14:22:33",
    level: "DEBUG",
    message: "Cache invalidation triggered",
    source: "cache-service",
  },
  { id: 6, timestamp: "2024-11-29 14:20:01", level: "INFO", message: "New user registration", source: "auth-service" },
]

const getLevelColor = (level: string) => {
  switch (level) {
    case "INFO":
      return "bg-blue-500/20 text-blue-500"
    case "WARN":
      return "bg-amber-500/20 text-amber-500"
    case "ERROR":
      return "bg-red-500/20 text-red-500"
    case "DEBUG":
      return "bg-gray-500/20 text-gray-500"
    default:
      return "bg-gray-500/20 text-gray-500"
  }
}

export default function LogsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="System Logs" description="View application logs and events" />
        <div className="p-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">Log Entries</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="Search logs..." className="pl-9 w-64 bg-secondary border-border" />
                </div>
                <Button variant="outline" className="border-border text-muted-foreground bg-transparent">
                  <Filter size={16} className="mr-2" /> Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-muted-foreground whitespace-nowrap">{log.timestamp}</span>
                    <Badge className={getLevelColor(log.level)}>{log.level}</Badge>
                    <span className="text-blue-400 whitespace-nowrap">[{log.source}]</span>
                    <span className="text-card-foreground flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
