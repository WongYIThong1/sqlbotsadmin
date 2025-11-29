import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy } from "lucide-react"

const licenses = [
  { id: 1, key: "LIC-2024-XXXX-A1B2", plan: "Enterprise", users: 100, expires: "2025-12-31", status: "Active" },
  { id: 2, key: "LIC-2024-XXXX-C3D4", plan: "Professional", users: 25, expires: "2025-06-15", status: "Active" },
  { id: 3, key: "LIC-2023-XXXX-E5F6", plan: "Starter", users: 5, expires: "2024-01-01", status: "Expired" },
  { id: 4, key: "LIC-2024-XXXX-G7H8", plan: "Enterprise", users: 200, expires: "2026-03-01", status: "Active" },
]

export default function LicensePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="License Management" description="Manage software licenses and subscriptions" />
        <div className="p-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">All Licenses</CardTitle>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={16} className="mr-2" /> Generate License
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">License Key</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Users</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Expires</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((license) => (
                      <tr key={license.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4">
                          <code className="text-sm text-card-foreground font-mono bg-secondary px-2 py-1 rounded">
                            {license.key}
                          </code>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{license.plan}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{license.users}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{license.expires}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              license.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                                : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            }
                          >
                            {license.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Copy size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
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
