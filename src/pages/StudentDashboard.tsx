import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mentorshipRequests, connections, students } from "@/data/mockData";
import { 
  User, 
  MessageCircle, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Users,
  TrendingUp,
  BookOpen,
  Target,
  Route
} from "lucide-react";
import CareerRoadmap from "@/components/CareerRoadmap";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  
  // Mock current student
  const currentStudent = students[0];
  
  // Filter requests for current student
  const studentRequests = mentorshipRequests.filter(req => req.studentId === currentStudent.id);
  const studentConnections = connections.filter(conn => conn.studentId === currentStudent.id);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <AlertCircle className="w-4 h-4 text-warning" />;
      case "accepted": return <CheckCircle className="w-4 h-4 text-success" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-primary" />;
      case "declined": return <XCircle className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "outline",
      accepted: "default", 
      completed: "secondary",
      declined: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const stats = [
    {
      title: "Active Requests",
      value: studentRequests.filter(r => r.status === "pending").length,
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Accepted Sessions",
      value: studentRequests.filter(r => r.status === "accepted").length,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Completed Sessions",
      value: studentRequests.filter(r => r.status === "completed").length,
      icon: Target,
      color: "text-primary"
    },
    {
      title: "Connected Alumni",
      value: studentConnections.length,
      icon: Users,
      color: "text-accent"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {currentStudent.name}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentStudent.department} • Batch {currentStudent.batchYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
              {currentStudent.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Mentorship Requests</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="roadmap" className="flex items-center gap-2">
              <Route className="w-4 h-4" />
              Career Roadmap
            </TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Mentorship Requests Tab */}
          <TabsContent value="requests">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Your Mentorship Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No mentorship requests yet.</p>
                    <Button className="mt-4 bg-gradient-hero hover:opacity-90">
                      Find Alumni Mentors
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentRequests.map((request) => (
                      <Card key={request.id} className="border border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {request.alumniName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h3 className="font-semibold">{request.alumniName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Requested on {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              {getStatusBadge(request.status)}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm mb-1">Purpose:</h4>
                              <p className="text-sm text-muted-foreground">{request.purpose}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm mb-1">Preferred Time:</h4>
                              <p className="text-sm text-muted-foreground">{request.preferredSlots}</p>
                            </div>

                            {request.question && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">Question:</h4>
                                <p className="text-sm text-muted-foreground">{request.question}</p>
                              </div>
                            )}

                            {request.status === "accepted" && request.meetingLink && (
                              <div className="bg-success/10 p-3 rounded-lg">
                                <h4 className="font-medium text-sm mb-2 text-success">Session Scheduled!</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  Scheduled: {new Date(request.scheduledTime!).toLocaleString()}
                                </p>
                                <Button 
                                  size="sm" 
                                  className="bg-success hover:bg-success/90"
                                  onClick={() => window.open(request.meetingLink, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Alumni Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentConnections.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No connections yet.</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start by sending mentorship requests to build your network.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {studentConnections.map((connection) => (
                      <Card key={connection.id} className="border border-border hover:shadow-glow transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
                              {connection.alumniName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <h3 className="font-semibold">{connection.alumniName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Connected since {new Date(connection.connectedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-4">
                            Last interaction: {new Date(connection.lastInteraction).toLocaleDateString()}
                          </div>

                          <Button variant="outline" size="sm" className="w-full">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recommended Alumni
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your department and interests, here are some alumni who might be great mentors:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                      <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white text-sm font-bold">
                        SC
                      </div>
                      <div>
                        <p className="font-medium text-sm">Dr. Sarah Chen</p>
                        <p className="text-xs text-muted-foreground">AI/ML Expert at Google</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                      <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white text-sm font-bold">
                        AK
                      </div>
                      <div>
                        <p className="font-medium text-sm">Arjun Kumar</p>
                        <p className="text-xs text-muted-foreground">Product Manager at Microsoft</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-gradient-hero hover:opacity-90" size="sm">
                    View All Recommendations
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Skill Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Skills trending in your field:
                  </p>
                  <div className="space-y-2">
                    <Badge variant="outline" className="mr-2">Machine Learning</Badge>
                    <Badge variant="outline" className="mr-2">Python</Badge>
                    <Badge variant="outline" className="mr-2">React</Badge>
                    <Badge variant="outline" className="mr-2">Cloud Computing</Badge>
                    <Badge variant="outline" className="mr-2">Data Analysis</Badge>
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Find Skill Workshops
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Career Roadmap Tab */}
          <TabsContent value="roadmap">
            <CareerRoadmap />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;