import { createFileRoute } from "@tanstack/react-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/shadcn-card"
import { Button } from "@/components/ui/shadcn-button"
import { BarChart2, Search, TrendingUp, Users } from "lucide-react"

import useAuth from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/dashboard")({
  component: Dashboard,
})

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Hi, {currentUser?.full_name || currentUser?.email} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, nice to see you again!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Scans
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start your first scan
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Create your first project
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              SEO Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No data yet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Keywords Tracked
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Add keywords to track
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your SEO optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start">
              <Search className="mr-2 h-4 w-4" />
              New Website Scan
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart2 className="mr-2 h-4 w-4" />
              Keyword Research
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest SEO activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No recent activity yet. Start by scanning your first website!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}