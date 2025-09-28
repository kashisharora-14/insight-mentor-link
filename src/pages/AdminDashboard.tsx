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
  Award
} from 'lucide-react';
import Navigation from '@/components/ui/navigation';

interface Stats {
  totalProfiles: number;
  verifiedProfiles: number;
  totalDonations: number;
  totalEvents: number;
  totalProducts: number;
  activeMentorships: number;
  pendingRequests: number;
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
    pendingRequests: 0
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

    setStats({
      totalProfiles: profilesRes.count || 0,
      verifiedProfiles: verifiedCount,
      totalDonations: totalDonationAmount,
      totalEvents: eventsRes.count || 0,
      totalProducts: productsRes.count || 0,
      activeMentorships,
      pendingRequests
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
            Punjab Alumni Data Management System - SIH 2025 | Manage statewide alumni network, verification processes, and analytics
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Profiles</p>
                  <p className="text-3xl font-bold">{stats.totalProfiles}</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.verifiedProfiles} verified
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
                  <p className="text-sm font-medium text-muted-foreground">Total Donations</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Events</p>
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

        {/* Detailed Management */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="mentorships">Mentorships</TabsTrigger>
          </TabsList>

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

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>University Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Panjab University</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Punjabi University</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Guru Nanak Dev University</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Others</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Chandigarh</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ludhiana</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Amritsar</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">International</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Industry Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Technology</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Finance</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Healthcare</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Others</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Registration Trends</CardTitle>
                  <CardDescription>New alumni registrations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    📊 Chart would be rendered here with actual data
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Engagement</CardTitle>
                  <CardDescription>User activity and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Daily Active Users</span>
                      <span className="font-medium">2,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Active Users</span>
                      <span className="font-medium">12,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profile Completion Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mentorship Success Rate</span>
                      <span className="font-medium">85%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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