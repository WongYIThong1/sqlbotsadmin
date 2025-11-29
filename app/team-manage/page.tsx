import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, MoreHorizontal, Mail } from "lucide-react"

const teams = [
  {
    id: 1,
    name: "Engineering",
    members: [
      { name: "John Doe", role: "Lead", initials: "JD" },
      { name: "Sarah Smith", role: "Developer", initials: "SS" },
      { name: "Mike Johnson", role: "Developer", initials: "MJ" },
    ],
  },
  {
    id: 2,
    name: "Design",
    members: [
      { name: "Emily Brown", role: "Lead", initials: "EB" },
      { name: "Alex Wilson", role: "Designer", initials: "AW" },
    ],
  },
  {
    id: 3,
    name: "Operations",
    members: [
      { name: "Chris Lee", role: "Lead", initials: "CL" },
      { name: "Dana Miller", role: "Analyst", initials: "DM" },
      { name: "Pat Taylor", role: "Analyst", initials: "PT" },
      { name: "Jordan White", role: "Coordinator", initials: "JW" },
    ],
  },
]

export default function TeamManagePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="Team Management" description="Organize and manage your teams" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">All Teams</h2>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={16} className="mr-2" /> Create Team
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-card-foreground">{team.name}</CardTitle>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal size={16} />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {team.members.slice(0, 4).map((member, index) => (
                      <Avatar key={index} className="h-8 w-8 border-2 border-card bg-secondary">
                        <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {team.members.length > 4 && (
                      <div className="h-8 w-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{team.members.length} members</p>
                  <div className="space-y-2">
                    {team.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 bg-secondary">
                            <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                              {member.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-card-foreground">{member.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 border-border text-muted-foreground bg-transparent">
                    <Mail size={14} className="mr-2" /> Invite Member
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
