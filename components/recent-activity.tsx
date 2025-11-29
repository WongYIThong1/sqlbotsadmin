import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: "John Doe",
    action: "Created new license",
    time: "2 minutes ago",
    initials: "JD",
  },
  {
    id: 2,
    user: "Sarah Smith",
    action: "Updated user permissions",
    time: "15 minutes ago",
    initials: "SS",
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Deployed version 2.4.1",
    time: "1 hour ago",
    initials: "MJ",
  },
  {
    id: 4,
    user: "Emily Brown",
    action: "Added team member",
    time: "3 hours ago",
    initials: "EB",
  },
  {
    id: 5,
    user: "Admin",
    action: "Security alert resolved",
    time: "5 hours ago",
    initials: "AD",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-9 w-9 bg-secondary">
                <AvatarFallback className="bg-secondary text-muted-foreground text-xs">
                  {activity.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{activity.user}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
