import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, AlertTriangle, XCircle } from "lucide-react"

const securityLogs = [
  {
    id: 1,
    timestamp: "2024-11-29 14:32:15",
    event: "Failed login attempt",
    ip: "192.168.1.100",
    user: "unknown@example.com",
    severity: "high",
  },
  {
    id: 2,
    timestamp: "2024-11-29 14:30:45",
    event: "Password changed",
    ip: "10.0.0.50",
    user: "john@example.com",
    severity: "low",
  },
  {
    id: 3,
    timestamp: "2024-11-29 14:28:22",
    event: "Suspicious activity detected",
    ip: "203.0.113.45",
    user: "admin@example.com",
    severity: "critical",
  },
  {
    id: 4,
    timestamp: "2024-11-29 14:25:10",
    event: "2FA enabled",
    ip: "10.0.0.25",
    user: "sarah@example.com",
    severity: "info",
  },
  {
    id: 5,
    timestamp: "2024-11-29 14:22:33",
    event: "Multiple failed login attempts",
    ip: "198.51.100.77",
    user: "unknown",
    severity: "high",
  },
]

const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return { color: "bg-red-500/20 text-red-500", icon: XCircle }
    case "high":
      return { color: "bg-amber-500/20 text-amber-500", icon: AlertTriangle }
    case "low":
      return { color: "bg-emerald-500/20 text-emerald-500", icon: ShieldCheck }
    case "info":
      return { color: "bg-blue-500/20 text-blue-500", icon: ShieldAlert }
    default:
      return { color: "bg-gray-500/20 text-gray-500", icon: ShieldAlert }
  }
}

export default function SecurityLogsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="Security Logs" description="Monitor security events and threats" />
        <div className="p-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Event</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP Address</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map((log) => {
                      const config = getSeverityConfig(log.severity)
                      const Icon = config.icon
                      return (
                        <tr key={log.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.timestamp}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Icon size={16} className={config.color.split(" ")[1]} />
                              <span className="text-sm text-card-foreground">{log.event}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{log.user}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.ip}</td>
                          <td className="py-3 px-4">
                            <Badge className={config.color}>{log.severity}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
