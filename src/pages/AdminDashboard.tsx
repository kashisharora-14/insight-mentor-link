import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/ui/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  GraduationCap,
  Calendar,
  MessageSquare,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  Building
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Users",
      value: "12,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Alumni",
      value: "8,234",
      change: "+8%", 
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      title: "Current Students",
      value: "4,613",
      change: "+15%",
      icon: GraduationCap,
      color: "text-purple-600"
    },
    {
      title: "Monthly Connections",
      value: "1,456",
      change: "+23%",
      icon: MessageSquare,
      color: "text-orange-600"
    }
  ];

  const recentActivity = [
    {
      user: "Alex Johnson",
      action: "Connected with Sarah Chen",
      department: "UICET",
      time: "2 hours ago",
      status: "success"
    },
    {
      user: "Emma Davis",
      action: "Registered as Alumni", 
      department: "UBS",
      time: "4 hours ago",
      status: "info"
    },
    {
      user: "Michael Brown",
      action: "Event Registration - Tech Talk",
      department: "UIET",
      time: "6 hours ago", 
      status: "warning"
    },
    {
      user: "Lisa Wang",
      action: "Profile Updated",
      department: "Law",
      time: "8 hours ago",
      status: "info"
    }
  ];

  const departments = [
    { name: "UICET", students: 1250, alumni: 2100, connections: 456 },
    { name: "UIET", students: 980, alumni: 1800, connections: 321 },
    { name: "UBS", students: 750, alumni: 1500, connections: 289 },
    { name: "Law", students: 450, alumni: 900, connections: 178 },
    { name: "Arts", students: 380, alumni: 750, connections: 145 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}. Manage your platform overview and analytics.
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Shield className="w-4 h-4 mr-1" />
              Administrator
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                      {stat.change} from last month
                    </Badge>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Department Overview */}
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Department Overview
              </CardTitle>
              <CardDescription>
                Student and alumni distribution across departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <h4 className="font-medium">{dept.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {dept.students} students • {dept.alumni} alumni
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{dept.connections}</p>
                      <p className="text-xs text-muted-foreground">connections</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gradient-card border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest platform activities and user interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.department}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-gradient-card border-0 shadow-elegant">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Events</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Settings className="w-6 h-6" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;