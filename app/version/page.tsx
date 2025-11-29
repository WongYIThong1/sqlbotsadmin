import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitBranch, GitCommit, Clock } from "lucide-react"

const versions = [
  { id: 1, version: "v2.4.1", branch: "main", commit: "a1b2c3d", date: "2024-11-28", status: "Current" },
  { id: 2, version: "v2.4.0", branch: "main", commit: "e4f5g6h", date: "2024-11-20", status: "Previous" },
  { id: 3, version: "v2.3.5", branch: "main", commit: "i7j8k9l", date: "2024-11-15", status: "Previous" },
  { id: 4, version: "v2.3.4", branch: "main", commit: "m0n1o2p", date: "2024-11-10", status: "Previous" },
  { id: 5, version: "v2.3.3", branch: "main", commit: "q3r4s5t", date: "2024-11-05", status: "Previous" },
]

export default function VersionPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="Version History" description="Track deployments and version releases" />
        <div className="p-6 space-y-4">
          {versions.map((version) => (
            <Card key={version.id} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-card-foreground">{version.version}</h3>
                        {version.status === "Current" && (
                          <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30">Current</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GitBranch size={14} /> {version.branch}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitCommit size={14} /> {version.commit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} /> {version.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
