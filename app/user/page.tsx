import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal } from "lucide-react"

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active", initials: "JD" },
  { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "Editor", status: "Active", initials: "SS" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Viewer", status: "Inactive", initials: "MJ" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", role: "Editor", status: "Active", initials: "EB" },
  { id: 5, name: "Alex Wilson", email: "alex@example.com", role: "Viewer", status: "Active", initials: "AW" },
]

export default function UserPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="User Management" description="Manage user accounts and permissions" />
        <div className="p-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-card-foreground">All Users</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="Search users..." className="pl-9 w-64 bg-secondary border-border" />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus size={16} className="mr-2" /> Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 bg-secondary">
                              <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                                {user.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{user.role}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.status === "Active" ? "default" : "secondary"}
                            className={
                              user.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                                : ""
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <MoreHorizontal size={16} />
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
