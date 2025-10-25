import { useState, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Route,
  Brain,
  BarChart3,
  Award,
  Zap,
  Shield, // Import Shield icon
  Info, // Import Info icon
  ShieldCheck, // Import ShieldCheck icon
  ShieldAlert // Import ShieldAlert icon
} from "lucide-react";
import CareerRoadmap from "@/components/CareerRoadmap";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import VerifiedBadge from '@/components/VerifiedBadge'; // Assuming VerifiedBadge component exists
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [apiStudentRequests, setApiStudentRequests] = useState<any[]>([]);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock current student and user context (replace with actual auth context)
  const currentStudent = students[0];
  // Mock user object to simulate auth context for verification status and method
  const authUser = { // Renamed to avoid conflict with fetched user
    id: currentStudent.id,
    name: currentStudent.name,
    isVerified: currentStudent.verification_status === 'verified', // Derive from student data
    verificationMethod: currentStudent.verification_status === 'verified' 
      ? (currentStudent.verification_source === 'csv_upload' ? 'csv_upload' : 'admin_approval') 
      : null, // Or 'pending' if not verified
    department: currentStudent.department,
    batchYear: currentStudent.batchYear,
    student_id: currentStudent.studentId, // Added student_id for consistency
    email: currentStudent.email, // Added email for consistency
  };

  // Load live mentorship requests for current student
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        const r = await fetch('/api/mentorship/my-requests-student', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) return;
        const j = await r.json();
        if (Array.isArray(j)) setApiStudentRequests(j);
      } catch {}
    };
    load();
  }, []);

  // Load success stories
  useEffect(() => {
    const loadSuccessStories = async () => {
      try {
        const response = await fetch('/api/success-stories');
        if (response.ok) {
          const data = await response.json();
          setSuccessStories(data);
        }
      } catch {}
    };
    loadSuccessStories();
  }, []);

  const displayedStudentRequests = useMemo(() => {
    if (!Array.isArray(apiStudentRequests) || apiStudentRequests.length === 0) {
      return [] as any[];
    }

    const priority: Record<string, number> = {
      accepted: 3,
      pending: 2,
      completed: 1,
      declined: 0,
    };

    const bestByMentor = new Map<string, any>();

    for (const request of apiStudentRequests) {
      const key = String(request?.mentorId ?? request?.mentor_id ?? "");
      const currentPriority = priority[String(request?.status)] ?? -1;
      if (!bestByMentor.has(key)) {
        bestByMentor.set(key, request);
        continue;
      }

      const existing = bestByMentor.get(key);
      const existingPriority = priority[String(existing?.status)] ?? -1;

      if (currentPriority > existingPriority) {
        bestByMentor.set(key, request);
      } else if (currentPriority === existingPriority) {
        const existingTime = new Date(existing?.createdAt ?? existing?.created_at ?? 0).getTime();
        const currentTime = new Date(request?.createdAt ?? request?.created_at ?? 0).getTime();
        if (currentTime > existingTime) {
          bestByMentor.set(key, request);
        }
      }
    }

    return Array.from(bestByMentor.values()).sort((a, b) => {
      const timeA = new Date(a?.createdAt ?? a?.created_at ?? 0).getTime();
      const timeB = new Date(b?.createdAt ?? b?.created_at ?? 0).getTime();
      return timeB - timeA;
    });
  }, [apiStudentRequests]);

  const studentConnections = connections.filter(conn => conn.studentId === currentStudent.id);

  // AI-powered analytics data
  const skillProgressData = [
    { skill: 'Technical Skills', current: 75, target: 85, industry: 80 },
    { skill: 'Communication', current: 68, target: 80, industry: 75 },
    { skill: 'Leadership', current: 60, target: 75, industry: 70 },
    { skill: 'Problem Solving', current: 82, target: 90, industry: 85 },
    { skill: 'Teamwork', current: 78, target: 85, industry: 82 }
  ];

  const careerReadinessData = [
    { month: 'Jan', score: 65, industry: 70 },
    { month: 'Feb', score: 68, industry: 72 },
    { month: 'Mar', score: 72, industry: 74 },
    { month: 'Apr', score: 75, industry: 76 },
    { month: 'May', score: 79, industry: 78 },
    { month: 'Jun', score: 82, industry: 80 }
  ];

  const aiInsights = [
    "🎯 Your technical skills are 5% above industry average - keep it up!",
    "📈 Communication skills improved 15% this month through mentorship",
    "💡 Alumni in your field recommend focusing on cloud computing skills",
    "🤝 Students with 3+ mentor connections get 40% better placements",
    "📊 Your profile completion is 87% - add project showcases to improve visibility"
  ];

  const personalizedRecommendations = [
    {
      type: "Skill Development",
      title: "Advanced React & Node.js",
      description: "Based on your CS background and current trends",
      priority: "High",
      timeline: "2-3 months"
    },
    {
      type: "Networking",
      title: "Connect with Google Alumni",
      description: "3 UICET alumni working at Google match your interests",
      priority: "Medium",
      timeline: "This week"
    },
    {
      type: "Project",
      title: "Open Source Contribution",
      description: "GitHub activity increases hiring chances by 60%",
      priority: "High",
      timeline: "Ongoing"
    },
    {
      type: "Certification",
      title: "AWS Cloud Practitioner",
      description: "High demand skill in your target companies",
      priority: "Medium",
      timeline: "1 month"
    }
  ];

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
      value: apiStudentRequests.filter((r: any) => r.status === 'pending').length,
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Career Score",
      value: "82/100",
      icon: Target,
      color: "text-success",
      trend: "+7 this month"
    },
    {
      title: "Completed Sessions",
      value: apiStudentRequests.filter((r: any) => r.status === 'completed').length,
      icon: CheckCircle,
      color: "text-primary"
    },
    {
      title: "Network Score",
      value: `${studentConnections.length}/10`,
      icon: Users,
      color: "text-accent",
      trend: "Industry target: 8+"
    }
  ];

  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.error('❌ No valid auth token found');
          setProfileLoading(false);
          return;
        }

        // Validate token format (JWT should have 3 parts)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('❌ Malformed token detected, clearing auth');
          localStorage.clear();
          setProfileLoading(false);
          navigate('/login');
          return;
        }

        const response = await fetch('/api/student-profile/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Profile API Response:', data);
          if (data.profile) {
            setStudentProfile({
              name: user?.name || 'Student',
              studentId: data.profile.roll_number || data.profile.rollNumber || user?.student_id || 'N/A',
              email: user?.email || 'N/A',
              department: data.profile.department || 'Not set',
              batchYear: data.profile.batchYear || data.profile.batch_year || new Date().getFullYear(),
              semester: data.profile.currentSemester || data.profile.current_semester || 1,
              cgpa: data.profile.cgpa || 'N/A',
              hasProfile: true,
            });
          } else {
            // No profile yet - set basic info from user
            setStudentProfile({
              name: user?.name || 'Student',
              studentId: user?.student_id || 'N/A',
              email: user?.email || 'N/A',
              department: 'Not set',
              batchYear: new Date().getFullYear(),
              semester: 1,
              cgpa: 'N/A',
              hasProfile: false,
            });
          }
        } else {
          // Profile endpoint error - use basic user info
          console.log('⚠️ Profile API error, using user data');
          setStudentProfile({
            name: user?.name || 'Student',
            studentId: user?.student_id || 'N/A',
            email: user?.email || 'N/A',
            department: 'Not set',
            batchYear: new Date().getFullYear(),
            semester: 1,
            cgpa: 'N/A',
            hasProfile: false,
          });
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
        // Fallback to basic user info
        setStudentProfile({
          name: user?.name || 'Student',
          studentId: user?.student_id || 'Please complete your profile',
          email: user?.email || 'N/A',
          department: 'Not set',
          batchYear: new Date().getFullYear(),
          semester: 1,
          cgpa: 'N/A',
          hasProfile: false,
        });
      } finally {
        setProfileLoading(false);
      }
    };

    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'student') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-muted-foreground">
            {!user ? 'Please log in to view your dashboard.' : 'Loading your profile...'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {studentProfile?.name || 'Student'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {studentProfile?.department || 'Not set'} • Batch {studentProfile?.batchYear || new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
              {currentStudent.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Account Verification Status
              {user?.isVerified && <VerifiedBadge isVerified={true} verificationMethod={user.verificationMethod} />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.isVerified ? (
              <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">Account Verified ✓</h3>
                  <p className="text-sm text-green-700 mb-3">
                    Your account has been verified by the administration. You now have full access to all features.
                  </p>
                  <div className="text-xs text-green-600">
                    Verification Method: {user?.verificationMethod === 'admin_manual' ? 'Manually approved by admin' : 
                                         user?.verificationMethod === 'csv_upload' ? 'Verified via CSV upload' : 
                                         'Verified'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">Verification Pending</h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    <ShieldAlert className="w-4 h-4 inline mr-1" />
                    Your account is awaiting admin approval. You'll receive an email notification once verified.
                  </p>
                  <div className="text-xs text-yellow-600">
                    <ShieldCheck className="w-4 h-4 inline mr-1" />
                    While waiting, you can explore limited features. Full access will be granted after verification.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    {stat.trend && (
                      <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    )}
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights Section */}
        <Card className="mb-8 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI-Powered Career Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={isMobile 
            ? "flex w-full overflow-x-auto overflow-y-hidden p-1 gap-1 scrollbar-hide" 
            : "grid w-full grid-cols-5"
          }>
            <TabsTrigger value="requests" className={isMobile 
              ? "flex-shrink-0 flex flex-col items-center gap-1 p-2 text-xs" 
              : "flex items-center gap-2"
            }>
              <MessageCircle className="w-4 h-4" />
              {isMobile ? "Help" : "Mentorship"}
            </TabsTrigger>
            <TabsTrigger value="connections" className={isMobile 
              ? "flex-shrink-0 flex flex-col items-center gap-1 p-2 text-xs" 
              : "flex items-center gap-2"
            }>
              <Users className="w-4 h-4" />
              {isMobile ? "Net" : "Connections"}
            </TabsTrigger>
            <TabsTrigger value="success-stories" className={isMobile 
              ? "flex-shrink-0 flex flex-col items-center gap-1 p-2 text-xs" 
              : "flex items-center gap-2"
            }>
              <Award className="w-4 h-4" />
              {isMobile ? "Stories" : "Success Stories"}
            </TabsTrigger>
            <TabsTrigger value="roadmap" className={isMobile 
              ? "flex-shrink-0 flex flex-col items-center gap-1 p-2 text-xs" 
              : "flex items-center gap-2"
            }>
              <Route className="w-4 h-4" />
              {isMobile ? "Path" : "Roadmap"}
            </TabsTrigger>
            <TabsTrigger value="profile" className={isMobile 
              ? "flex-shrink-0 flex flex-col items-center gap-1 p-2 text-xs" 
              : "flex items-center gap-2"
            }>
              <User className="w-4 h-4" />
              {isMobile ? "Profile" : "Profile"}
            </TabsTrigger>
          </TabsList>

          {/* Mentorship Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Available Mentors Section */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Available Mentors
                  </CardTitle>
                  <CardDescription>
                    Connect with verified alumni who are available for mentorship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Button 
                      onClick={() => window.location.href = '/mentorship'}
                      className="bg-gradient-hero hover:opacity-90"
                    >
                      Browse All Mentors
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Your Requests Section */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    Your Mentorship Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {displayedStudentRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No mentorship requests yet.</p>
                      <Button 
                        className="mt-4 bg-gradient-hero hover:opacity-90"
                        onClick={() => window.location.href = '/mentorship'}
                      >
                        Find Alumni Mentors
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {displayedStudentRequests.map((request: any) => (
                        <Card key={request.id} className="border border-border">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4">
                                {request.mentorProfilePicture ? (
                                  <img 
                                    src={request.mentorProfilePicture} 
                                    alt={request.mentorName || 'Mentor'}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {request.mentorName?.charAt(0) || 'M'}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="font-semibold">{request.mentorName || 'Mentor'}</h3>
                                  <p className="text-sm text-muted-foreground">Requested on {new Date(request.createdAt).toLocaleDateString()}</p>
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
                                <p className="text-sm text-muted-foreground">{request.subject}</p>
                              </div>

                              <div>
                                <h4 className="font-medium text-sm mb-1">Preferred Time:</h4>
                                <p className="text-sm text-muted-foreground">{request.preferredTime || 'Flexible'}</p>
                              </div>

                              {request.message && (
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Question:</h4>
                                  <p className="text-sm text-muted-foreground">{request.message}</p>
                                </div>
                              )}
                              {request.status === 'accepted' && (
                                <div className="flex justify-end">
                                  <Button size="sm" onClick={() => (window.location.href = `/chat/${request.id}`)}>
                                    Open Chat
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
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Connections
                </CardTitle>
                <CardDescription>
                  All your professional connections including mentors, alumni, and peers
                </CardDescription>
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

          {/* Success Stories Tab */}
          <TabsContent value="success-stories">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Alumni Success Stories
                </CardTitle>
                <CardDescription>
                  Inspiring achievements from our Punjab University Computer Science alumni
                </CardDescription>
              </CardHeader>
              <CardContent>
                {successStories.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No success stories available yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {successStories.map((story: any) => (
                      <Card key={story.id} className="border border-border hover:shadow-glow transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center text-center mb-4">
                            {story.imageUrl ? (
                              <img 
                                src={story.imageUrl} 
                                alt={story.name}
                                className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-primary/20"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-2xl mb-3">
                                {story.name?.charAt(0) || 'A'}
                              </div>
                            )}
                            <h3 className="font-semibold text-lg">{story.name}</h3>
                            <p className="text-sm text-primary font-medium">{story.currentPosition}</p>
                            <p className="text-sm text-muted-foreground">{story.company}</p>
                            <Badge variant="secondary" className="mt-2">
                              {story.program} - Batch {story.batch}
                            </Badge>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm mb-1">Achievement:</h4>
                              <p className="text-sm text-primary font-medium">{story.achievement}</p>
                            </div>
                            
                            <div>
                              <p className="text-sm text-muted-foreground line-clamp-4">
                                {story.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Roadmap Tab */}
          <TabsContent value="roadmap">
            <CareerRoadmap />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your profile details and login credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Login Credentials Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Login Credentials</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Student ID:</span>
                      <span className="font-medium">{user?.studentId || studentProfile?.studentId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registered Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-muted-foreground">
                        💡 You can login using either your <strong>Student ID</strong> ({user?.studentId || studentProfile?.studentId || 'N/A'}) or <strong>Email</strong> ({user.email})
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Full Name</span>
                        <span className="font-semibold">{studentProfile?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Department</span>
                        <span className="font-semibold">{studentProfile?.department}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Batch Year</span>
                        <span className="font-semibold">{studentProfile?.batchYear}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3">Academic Performance</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Current Semester</span>
                        <span className="font-semibold">{studentProfile?.semester}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">CGPA</span>
                        <span className="font-semibold">{studentProfile?.cgpa}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => navigate('/complete-profile')} className="bg-gradient-hero hover:opacity-90">
                    {studentProfile?.hasProfile ? 'Edit Profile' : 'Complete Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;