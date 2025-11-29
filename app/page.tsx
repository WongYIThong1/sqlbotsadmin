import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsCard } from "@/components/stats-card"
import { ActivityChart } from "@/components/activity-chart"
import { RecentActivity } from "@/components/recent-activity"
import { Users, KeyRound, ShieldCheck, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <DashboardHeader title="Dashboard" description="Overview of your admin panel" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Users"
              value="12,489"
              change="+12% from last month"
              changeType="positive"
              icon={Users}
            />
            <StatsCard
              title="Active Licenses"
              value="3,847"
              change="+5% from last month"
              changeType="positive"
              icon={KeyRound}
            />
            <StatsCard
              title="Security Events"
              value="24"
              change="-8% from last month"
              changeType="positive"
              icon={ShieldCheck}
            />
            <StatsCard
              title="Active Sessions"
              value="1,293"
              change="+2% from last hour"
              changeType="neutral"
              icon={Activity}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ActivityChart />
            </div>
            <div>
              <RecentActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
