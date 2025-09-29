import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  UserCheck,
  MessageSquare,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  Brain,
  Target,
  Globe,
  Zap
} from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line, Area, AreaChart } from 'recharts';

interface Stats {
  totalProfiles: number;
  verifiedProfiles: number;
  totalDonations: number;
  totalEvents: number;
  totalProducts: number;
  activeMentorships: number;
  pendingRequests: number;
  engagementRate: number;
  monthlyGrowth: number;
  aiInsights: string[];
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  graduation_year?: number;
  department?: string;
  current_job?: string;
  company?: string;
  is_verified: boolean;
  is_mentor_available: boolean;
  created_at: string;
}

interface Donation {
  id: string;
  donor_name: string;
  donor_email: string;
  amount: number;
  message?: string;
  is_anonymous: boolean;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  date_time: string;
  location?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
}

interface MentorshipRequest {
  id: string;
  student_id: string;
  mentor_id?: string;
  field_of_interest: string;
  description: string;
  status: string;
  created_at: string;
  mentor_profile?: any;
  student_profile?: any;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProfiles: 0,
    verifiedProfiles: 0,
    totalDonations: 0,
    totalEvents: 0,
    totalProducts: 0,
    activeMentorships: 0,
    pendingRequests: 0,
    engagementRate: 0,
    monthlyGrowth: 0,
    aiInsights: []
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for charts
  const departmentData = [
    { name: 'UICET', alumni: 2450, students: 890, engagement: 78 },
    { name: 'UBS', alumni: 1890, students: 670, engagement: 72 },
    { name: 'UIET', alumni: 1650, students: 580, engagement: 85 },
    { name: 'Law', alumni: 980, students: 320, engagement: 68 },
    { name: 'Medicine', alumni: 1200, students: 450, engagement: 80 },
    { name: 'Arts', alumni: 850, students: 390, engagement: 65 }
  ];

  const geographicData = [
    { name: 'Punjab', value: 30, color: '#667eea' },
    { name: 'Delhi NCR', value: 25, color: '#764ba2' },
    { name: 'Mumbai', value: 15, color: '#f093fb' },
    { name: 'Bangalore', value: 12, color: '#f5576c' },
    { name: 'International', value: 18, color: '#4facfe' }
  ];

  const engagementTrends = [
    { month: 'Jan', mentorships: 45, events: 12, donations: 28, total: 85 },
    { month: 'Feb', mentorships: 52, events: 15, donations: 34, total: 101 },
    { month: 'Mar', mentorships: 61, events: 18, donations: 41, total: 120 },
    { month: 'Apr', mentorships: 58, events: 22, donations: 38, total: 118 },
    { month: 'May', mentorships: 67, events: 19, donations: 45, total: 131 },
    { month: 'Jun', mentorships: 73, events: 25, donations: 52, total: 150 }
  ];

  const industryData = [
    { name: 'Technology', alumni: 1450, avgSalary: 1200000, growth: 15 },
    { name: 'Finance', alumni: 890, avgSalary: 1800000, growth: 8 },
    { name: 'Healthcare', alumni: 680, avgSalary: 950000, growth: 12 },
    { name: 'Education', alumni: 520, avgSalary: 600000, growth: 5 },
    { name: 'Government', alumni: 430, avgSalary: 800000, growth: 3 },
    { name: 'Startups', alumni: 380, avgSalary: 1100000, growth: 25 }
  ];

  const aiInsights = [
    "🎯 UIET department shows highest engagement rate (85%) - consider replicating their strategies",
    "📈 Mentorship requests increased 23% this month - consider scaling mentor onboarding",
    "🌍 International alumni donations up 40% - focus on global engagement campaigns", 
    "💡 Technology sector alumni most likely to mentor (78% participation rate)",
    "📊 Weekend events show 30% higher attendance - optimize scheduling",
    "🔗 Alumni with 5+ connections donate 3x more - encourage networking"
  ];

  const studentSuccessMetrics = [
    { metric: 'Placement Rate', value: 89, target: 85, trend: '+4%' },
    { metric: 'Avg. Starting Salary', value: 6.2, target: 5.8, trend: '+6.9%' },
    { metric: 'Industry Readiness', value: 78, target: 75, trend: '+4%' },
    { metric: 'Alumni Mentorship', value: 67, target: 60, trend: '+11.7%' },
    { metric: 'Skill Certification', value: 72, target: 70, trend: '+2.9%' },
    { metric: 'Job Satisfaction', value: 8.4, target: 8.0, trend: '+5%' }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchProfiles(),
        fetchDonations(),
        fetchEvents(),
        fetchMentorshipRequests()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Fetch all stats in parallel
    const [profilesRes, donationsRes, eventsRes, productsRes, mentorshipsRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }),
      supabase.from('donations').select('amount', { count: 'exact' }),
      supabase.from('events').select('*', { count: 'exact' }),
      supabase.from('products').select('*', { count: 'exact' }),
      supabase.from('mentorship_requests').select('*', { count: 'exact' })
    ]);

    const verifiedCount = profilesRes.data?.filter(p => p.is_verified).length || 0;
    const totalDonationAmount = donationsRes.data?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const activeMentorships = mentorshipsRes.data?.filter(m => m.status === 'approved').length || 0;
    const pendingRequests = mentorshipsRes.data?.filter(m => m.status === 'pending').length || 0;

    // Calculate AI-driven metrics
    const totalUsers = profilesRes.count || 0;
    const engagementRate = totalUsers > 0 ? Math.round(((activeMentorships + (eventsRes.count || 0)) / totalUsers) * 100) : 0;
    const monthlyGrowth = 12.5; // Mock calculation - in real app, compare with previous month

    setStats({
      totalProfiles: profilesRes.count || 0,
      verifiedProfiles: verifiedCount,
      totalDonations: totalDonationAmount,
      totalEvents: eventsRes.count || 0,
      totalProducts: productsRes.count || 0,
      activeMentorships,
      pendingRequests,
      engagementRate,
      monthlyGrowth,
      aiInsights
    });
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching profiles:', error);
    } else {
      setProfiles(data || []);
    }
  };

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching donations:', error);
    } else {
      setDonations(data || []);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date_time', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  };

  const fetchMentorshipRequests = async () => {
    const { data, error } = await supabase
      .from('mentorship_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching mentorship requests:', error);
    } else {
      // Fetch profile details separately to avoid complex joins
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const [studentRes, mentorRes] = await Promise.all([
            supabase.from('profiles').select('name, email, department').eq('user_id', request.student_id).single(),
            request.mentor_id ? supabase.from('profiles').select('name, email, current_job, company').eq('user_id', request.mentor_id).single() : Promise.resolve({ data: null })
          ]);

          return {
            ...request,
            student_profile: studentRes.data,
            mentor_profile: mentorRes.data
          };
        })
      );
      setMentorshipRequests(requestsWithProfiles);
    }
  };

  const toggleProfileVerification = async (profileId: string, isVerified: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !isVerified })
      .eq('id', profileId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile verification.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Profile ${!isVerified ? 'verified' : 'unverified'} successfully.`,
      });
      fetchProfiles();
      fetchStats();
    }
  };

  const toggleEventStatus = async (eventId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ is_active: !isActive })
      .eq('id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update event status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Event ${!isActive ? 'activated' : 'deactivated'} successfully.`,
      });
      fetchEvents();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Central Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Punjab Alumni Data Management System - SIH 2025 | AI-Powered Analytics & Centralized Engagement Platform
          </p>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Network</p>
                  <p className="text-3xl font-bold">{stats.totalProfiles.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{stats.monthlyGrowth}% this month
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                  <p className="text-3xl font-bold">{stats.engagementRate}%</p>
                  <p className="text-sm text-muted-foreground">Platform activity</p>
                </div>
                <Zap className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Donations</p>
                  <p className="text-3xl font-bold">${stats.totalDonations.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Growing
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Events</p>
                  <p className="text-3xl font-bold">{stats.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">This year</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mentorships</p>
                  <p className="text-3xl font-bold">{stats.activeMentorships}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.pendingRequests} pending
                  </p>
                </div>
                <Award className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <Card className="mb-8 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI-Powered Insights & Recommendations
            </CardTitle>
            <CardDescription>
              Machine learning analysis of platform engagement and growth patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.aiInsights.map((insight, index) => (
                <div key={index} className="p-4 bg-background rounded-lg border border-border">
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Management */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="analytics">Analytics Hub</TabsTrigger>
            <TabsTrigger value="student-success">Student Success</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="profiles">User Management</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="mentorships">Mentorships</TabsTrigger>
          </TabsList>

          {/* Enhanced Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Department-wise Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      alumni: { label: "Alumni", color: "#667eea" },
                      students: { label: "Students", color: "#764ba2" },
                      engagement: { label: "Engagement %", color: "#f093fb" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="alumni" fill="#667eea" />
                        <Bar dataKey="students" fill="#764ba2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      punjab: { label: "Punjab", color: "#667eea" },
                      delhi: { label: "Delhi NCR", color: "#764ba2" },
                      mumbai: { label: "Mumbai", color: "#f093fb" },
                      bangalore: { label: "Bangalore", color: "#f5576c" },
                      international: { label: "International", color: "#4facfe" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <RechartsPieChart data={geographicData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                          {geographicData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Engagement Trends (6 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      mentorships: { label: "Mentorships", color: "#667eea" },
                      events: { label: "Events", color: "#764ba2" },
                      donations: { label: "Donations", color: "#f093fb" },
                      total: { label: "Total Engagement", color: "#4facfe" }
                    }}
                  >
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={engagementTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="total" stroke="#4facfe" fill="#4facfe" fillOpacity={0.3} />
                        <Line type="monotone" dataKey="mentorships" stroke="#667eea" strokeWidth={2} />
                        <Line type="monotone" dataKey="events" stroke="#764ba2" strokeWidth={2} />
                        <Line type="monotone" dataKey="donations" stroke="#f093fb" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Industry-wise Alumni Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {industryData.map((industry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{industry.name}</span>
                            <Badge variant="outline" className={industry.growth > 15 ? "text-green-600" : industry.growth > 8 ? "text-blue-600" : "text-muted-foreground"}>
                              +{industry.growth}%
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {industry.alumni} alumni • Avg: ₹{(industry.avgSalary/100000).toFixed(1)}L
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Student Success Analytics Tab */}
          <TabsContent value="student-success">
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Student Success Metrics
                  </CardTitle>
                  <CardDescription>
                    Key performance indicators for student outcomes and platform impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentSuccessMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{metric.metric}</span>
                            <Badge variant={metric.value >= metric.target ? "default" : "secondary"}>
                              {metric.trend}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-2xl font-bold text-primary">
                              {metric.metric.includes('Salary') ? `₹${metric.value}L` : 
                               metric.metric.includes('Satisfaction') ? metric.value : `${metric.value}%`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Target: {metric.metric.includes('Salary') ? `₹${metric.target}L` : 
                                      metric.metric.includes('Satisfaction') ? metric.target : `${metric.target}%`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Platform Impact Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-card rounded-lg">
                        <div className="text-2xl font-bold text-primary">8,340</div>
                        <div className="text-sm text-muted-foreground">Total Alumni Registered</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-card rounded-lg">
                        <div className="text-2xl font-bold text-warning">2,890</div>
                        <div className="text-sm text-muted-foreground">Active Students</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Alumni Verification Rate</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width: '87%'}}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Mentorship Match Success</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{width: '94%'}}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Event Participation Rate</span>
                        <span className="text-sm font-medium">76%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{width: '76%'}}></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Quick Analytics Summary</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>• 67% of students find mentors within 2 weeks</p>
                        <p>• Alumni response rate: 89% within 48 hours</p>
                        <p>• Platform satisfaction score: 4.6/5.0</p>
                        <p>• Monthly active users: 12,450 (+15%)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                  <CardDescription>Alumni profiles requiring verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profiles.filter(p => !p.is_verified && p.role === 'alumni').slice(0, 5).map((profile) => (
                      <div key={profile.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{profile.name}</h4>
                          <p className="text-sm text-muted-foreground">{profile.current_job} at {profile.company}</p>
                          <p className="text-xs text-muted-foreground">{profile.department} • Class of {profile.graduation_year}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => toggleProfileVerification(profile.id, profile.is_verified)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Verification</CardTitle>
                  <CardDescription>Review submitted documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Degree Certificate</h4>
                          <p className="text-sm text-muted-foreground">Submitted by John Doe</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Employment Letter</h4>
                          <p className="text-sm text-muted-foreground">Submitted by Jane Smith</p>
                        </div>
                        <Badge variant="default">Approved</Badge>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">ID Verification</h4>
                          <p className="text-sm text-muted-foreground">Submitted by Mike Johnson</p>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Verification Actions</CardTitle>
                <CardDescription>Manage multiple verifications at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button variant="destructive">
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Selected
                  </Button>
                  <Button variant="outline">
                    Export Verification Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <Card>
              <CardHeader>
                <CardTitle>Alumni & Student Profiles</CardTitle>
                <CardDescription>Manage profile verifications and user data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium">{profile.name}</h3>
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          </div>
                          <Badge variant={profile.role === 'alumni' ? 'default' : 'secondary'}>
                            {profile.role}
                          </Badge>
                          {profile.is_verified && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {profile.current_job && profile.company && (
                            <span>{profile.current_job} at {profile.company}</span>
                          )}
                          {profile.department && profile.graduation_year && (
                            <span className="ml-4">
                              {profile.department} • Class of {profile.graduation_year}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={profile.is_verified ? "destructive" : "default"}
                          onClick={() => toggleProfileVerification(profile.id, profile.is_verified)}
                        >
                          {profile.is_verified ? (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Track and manage donation contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">
                            {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                          </h3>
                          <Badge variant="secondary">
                            ${donation.amount.toLocaleString()}
                          </Badge>
                        </div>
                        {donation.message && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            "{donation.message}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(donation.created_at).toLocaleDateString()} • {donation.donor_email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Events Management</CardTitle>
                <CardDescription>Manage university events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{event.title}</h3>
                          <Badge variant={event.is_active ? 'default' : 'secondary'}>
                            {event.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {event.department && (
                            <Badge variant="outline">{event.department}</Badge>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <span>{new Date(event.date_time).toLocaleDateString()}</span>
                          {event.location && <span className="ml-4">{event.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={event.is_active ? "destructive" : "default"}
                          onClick={() => toggleEventStatus(event.id, event.is_active)}
                        >
                          {event.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentorships Tab */}
          <TabsContent value="mentorships">
            <Card>
              <CardHeader>
                <CardTitle>Mentorship Requests</CardTitle>
                <CardDescription>Monitor mentorship program activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentorshipRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{request.field_of_interest}</h3>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p><strong>Student:</strong> {request.student_profile?.name}</p>
                          <p><strong>Department:</strong> {request.student_profile?.department}</p>
                        </div>
                        {request.mentor_profile && (
                          <div>
                            <p><strong>Mentor:</strong> {request.mentor_profile.name}</p>
                            <p><strong>Position:</strong> {request.mentor_profile.current_job} at {request.mentor_profile.company}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;