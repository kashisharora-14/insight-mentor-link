import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
// import {supabase } from '@/integrations/supabase/client'; // Replaced with API client
import {
  Users,
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
  Zap,
  Upload,
  Clock,
  GraduationCap
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
  verification_status?: 'pending' | 'approved' | 'rejected' | 'csv_verified'; // Added for verification status
  is_mentor_available: boolean;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]); // Added state for verification requests
  const [csvUploadResult, setCSVUploadResult] = useState<any>(null); // Added state for CSV upload result
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Real data will be fetched from APIs
  const [eventParticipants, setEventParticipants] = useState<any[]>([]);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchProfiles(),
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
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/stats', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats({
        totalProfiles: data.totalProfiles || 0,
        verifiedProfiles: data.verifiedProfiles || 0,
        totalDonations: data.totalDonations || 0,
        totalEvents: data.totalEvents || 0,
        totalProducts: data.totalProducts || 0,
        activeMentorships: data.activeMentorships || 0,
        pendingRequests: data.pendingRequests || 0,
        engagementRate: data.engagementRate || 0,
        monthlyGrowth: data.monthlyGrowth || 0,
        aiInsights: data.aiInsights || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data if API fails and set default stats
      setStats({
        totalProfiles: 12,
        verifiedProfiles: 8,
        totalDonations: 216000,
        totalEvents: 10,
        totalProducts: 15,
        activeMentorships: 4,
        pendingRequests: 4,
        engagementRate: 78,
        monthlyGrowth: 12.5,
        aiInsights: [
          "🎯 UICET department shows highest engagement rate (85%) - consider replicating their strategies",
          "📈 Mentorship requests increased 23% this month - consider scaling mentor onboarding",
          "🌍 Alumni donations up 40% internationally - focus on global engagement campaigns",
          "💡 Technology sector alumni most likely to mentor (78% participation rate)",
          "📊 Weekend events show 30% higher attendance - optimize scheduling",
          "🔗 Alumni with 5+ connections donate 3x more - encourage networking"
        ]
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/users', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }

      const users = await response.json();

      const transformedProfiles: Profile[] = users.map((user: any) => ({
        id: user.id,
        user_id: user.id,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        graduation_year: user.graduation_year,
        department: user.department,
        current_job: user.current_job,
        company: user.company,
        is_verified: user.is_verified || false,
        verification_status: user.verification_status || 'pending',
        is_mentor_available: user.is_mentor_available || false,
        created_at: user.created_at,
      }));

      setProfiles(transformedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // Fallback to mock data if API fails
      const mockProfiles: Profile[] = [
      {
        id: '1',
        user_id: 'user-1',
        name: 'Dr. Sarah Chen',
        email: 'sarah.chen@gmail.com',
        role: 'alumni',
        graduation_year: 2015,
        department: 'UICET',
        current_job: 'Senior Software Engineer',
        company: 'Google',
        is_verified: true,
        verification_status: 'approved',
        is_mentor_available: true,
        created_at: '2024-01-10T10:30:00Z'
      },
      {
        id: '2',
        user_id: 'user-2',
        name: 'Prof. Raj Sharma',
        email: 'raj.sharma@business.com',
        role: 'alumni',
        graduation_year: 2012,
        department: 'UBS',
        current_job: 'Investment Banking Director',
        company: 'Goldman Sachs',
        is_verified: true,
        verification_status: 'approved',
        is_mentor_available: true,
        created_at: '2024-01-08T14:20:00Z'
      },
      {
        id: '3',
        user_id: 'user-3',
        name: 'Dr. Priya Patel',
        email: 'priya.patel@lawfirm.com',
        role: 'alumni',
        graduation_year: 2014,
        department: 'Law',
        current_job: 'Corporate Lawyer',
        company: 'Baker McKenzie',
        is_verified: true,
        verification_status: 'approved',
        is_mentor_available: true,
        created_at: '2024-01-05T09:15:00Z'
      },
      {
        id: '4',
        user_id: 'user-4',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@microsoft.com',
        role: 'alumni',
        graduation_year: 2016,
        department: 'UIET',
        current_job: 'Product Manager',
        company: 'Microsoft',
        is_verified: false,
        verification_status: 'pending',
        is_mentor_available: true,
        created_at: '2024-01-15T16:45:00Z'
      },
      {
        id: '5',
        user_id: 'user-5',
        name: 'Maya Singh',
        email: 'maya.singh@ogilvy.com',
        role: 'alumni',
        graduation_year: 2013,
        department: 'Arts',
        current_job: 'Creative Director',
        company: 'Ogilvy',
        is_verified: true,
        verification_status: 'approved',
        is_mentor_available: false,
        created_at: '2024-01-12T11:30:00Z'
      },
      {
        id: '6',
        user_id: 'user-6',
        name: 'Vikram Agarwal',
        email: 'vikram.agarwal@netflix.com',
        role: 'alumni',
        graduation_year: 2017,
        department: 'UICET',
        current_job: 'Data Scientist',
        company: 'Netflix',
        is_verified: false,
        verification_status: 'pending',
        is_mentor_available: true,
        created_at: '2024-01-18T13:25:00Z'
      },
      {
        id: '7',
        user_id: 'user-7',
        name: 'Aarav Mehta',
        email: 'aarav.mehta@student.edu',
        role: 'student',
        graduation_year: 2025,
        department: 'UICET',
        current_job: undefined,
        company: undefined,
        is_verified: true,
        verification_status: 'csv_verified', // Example: verified via CSV
        is_mentor_available: false,
        created_at: '2024-01-20T08:15:00Z'
      },
      {
        id: '8',
        user_id: 'user-8',
        name: 'Anisha Verma',
        email: 'anisha.verma@student.edu',
        role: 'student',
        graduation_year: 2026,
        department: 'UBS',
        current_job: undefined,
        company: undefined,
        is_verified: true,
        verification_status: 'approved', // Example: approved by admin
        is_mentor_available: false,
        created_at: '2024-01-22T12:40:00Z'
      },
      {
        id: '9',
        user_id: 'user-9',
        name: 'Rahul Kumar',
        email: 'rahul.kumar@student.edu',
        role: 'student',
        graduation_year: 2026,
        department: 'UICET',
        current_job: undefined,
        company: undefined,
        is_verified: false,
        verification_status: 'pending', // Example: pending admin approval
        is_mentor_available: false,
        created_at: '2024-01-25T15:20:00Z'
      },
      {
        id: '10',
        user_id: 'user-10',
        name: 'Neha Gupta',
        email: 'neha.gupta@mckinsey.com',
        role: 'alumni',
        graduation_year: 2019,
        department: 'UBS',
        current_job: 'Management Consultant',
        company: 'McKinsey & Company',
        is_verified: false,
        verification_status: 'pending',
        is_mentor_available: true,
        created_at: '2024-01-28T10:10:00Z'
      },
      {
        id: '11',
        user_id: 'user-11',
        name: 'Kiran Verma',
        email: 'kiran.verma@highcourt.gov.in',
        role: 'alumni',
        graduation_year: 2015,
        department: 'Law',
        current_job: 'Senior Advocate',
        company: 'Punjab & Haryana High Court',
        is_verified: true,
        verification_status: 'approved',
        is_mentor_available: true,
        created_at: '2024-01-30T14:35:00Z'
      },
      {
        id: '12',
        user_id: 'user-12',
        name: 'Preet Kaur',
        email: 'preet.kaur@student.edu',
        role: 'student',
        graduation_year: 2025,
        department: 'Arts',
        current_job: undefined,
        company: undefined,
        is_verified: true,
        verification_status: 'approved',
        is_mentor_available: false,
        created_at: '2024-02-01T09:20:00Z'
      }
    ];

      setProfiles(mockProfiles);
    }
  };

  // Fetch function for event participants
  const fetchEventParticipants = async (eventId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/events/${eventId}/participants`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event participants');
      }
      const data = await response.json();
      setEventParticipants(data);
      setSelectedEventForParticipants(eventId);
    } catch (error) {
      console.error('Error fetching event participants:', error);
      toast({
        title: "Error",
        description: "Failed to load participants for this event.",
        variant: "destructive",
      });
      setEventParticipants([]); // Clear participants if fetch fails
      setSelectedEventForParticipants(eventId); // Keep event selected for context
    }
  };

const handleApproveVerification = async (requestId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/verification-requests/${requestId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to approve verification request');
    }

    const responseData = await response.json(); // Assuming the API returns { emailSent: boolean, emailError?: string, userEmail: string }

    const emailStatus = responseData.emailSent
      ? "✅ Verification email sent successfully"
      : `⚠️ User verified but email failed: ${responseData.emailError || 'Unknown error'}`;

    toast({
      title: "Request Approved",
      description: `User has been verified. ${emailStatus}`,
    });

    console.log('📧 Email notification status:', {
      emailSent: responseData.emailSent,
      emailError: responseData.emailError,
      userEmail: responseData.userEmail
    });

    // Refresh data to reflect changes
    fetchVerificationRequests();
    fetchProfiles();
    fetchStats();

  } catch (error) {
    console.error('Error approving verification request:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to approve verification request",
      variant: "destructive",
    });
  }
};

const handleRejectVerification = async (requestId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`/api/admin/verification-requests/${requestId}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to reject verification request');
    }

    toast({
      title: "Request Rejected",
      description: "User verification request has been rejected.",
    });

    // Refresh data to reflect changes
    fetchVerificationRequests();
    fetchProfiles();
    fetchStats();

  } catch (error) {
    console.error('Error rejecting verification request:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to reject verification request",
      variant: "destructive",
    });
  }
};


const handleCSVUpload = async (formData: FormData) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('/api/admin/csv-upload', {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      setCSVUploadResult(result);
      toast({
        title: "CSV Upload Complete",
        description: `Processed ${result.processed} users successfully. ${result.errors?.length || 0} errors.`,
      });
      fetchVerificationRequests();
      fetchProfiles();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'CSV upload failed');
    }
  } catch (error) {
    console.error('Error uploading CSV:', error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to upload CSV file",
      variant: "destructive",
    });
  }
};

// Fetch verification requests
const fetchVerificationRequests = async () => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error(' No authentication token found');
      toast({
        title: "Authentication Required",
        description: "Please log in as admin first",
        variant: "destructive",
      });
      return;
    }

    console.log(' Fetching verification requests with token...');
    const response = await fetch('/api/admin/verification-requests', {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : {
            'Content-Type': 'application/json',
          },
    });

    if (response.ok) {
      const data = await response.json();
      setVerificationRequests(data);
      console.log(' Loaded verification requests:', data);
    } else if (response.status === 401) {
      console.error(' Unauthorized - invalid or expired token');
      toast({
        title: "Session Expired",
        description: "Please log in again",
        variant: "destructive",
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/admin-login';
    } else {
      console.error('Failed to fetch verification requests:', response.status, response.statusText);
      toast({
        title: "Error",
        description: "Failed to load verification requests",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    toast({
      title: "Error",
      description: "Failed to load verification requests",
      variant: "destructive",
    });
  }
};

// Mock Supabase update functions - these should be replaced with actual API calls if not using Supabase directly
  const toggleProfileVerification = async (profileId: string, isVerified: boolean) => {
    // This is a placeholder. In a real app, this would call an API endpoint.
    // For now, it simulates the UI update and then fetches fresh data.
    console.log(`Toggling verification for profile ${profileId} to ${!isVerified}`);
    toast({
      title: "Simulated Action",
      description: `Profile ${profileId} verification status would be updated.`,
    });
    // Simulate API call to update profile
    setTimeout(() => {
      fetchProfiles(); // Re-fetch profiles to show the updated status
      fetchStats(); // Re-fetch stats as verified count might change
    }, 500);
  };


  const toggleEventStatus = async (eventId: string, isActive: boolean) => {
    // This is a placeholder. In a real app, this would call an API endpoint.
    console.log(`Toggling status for event ${eventId} to ${!isActive}`);
    toast({
      title: "Simulated Action",
      description: `Event ${eventId} status would be updated.`,
    });
    // Simulate API call to update event
    setTimeout(() => {
      fetchEvents(); // Re-fetch events to show the updated status
    }, 500);
  };

  // Initial fetch for all data
  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');

    if (!token || !userStr) {
      console.error('❌ No authentication found, redirecting to admin login');
      window.location.href = '/admin-login';
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        console.error('❌ User is not an admin, redirecting');
        window.location.href = '/';
        return;
      }
    } catch (e) {
      console.error('❌ Invalid user data, redirecting to admin login');
      window.location.href = '/admin-login';
      return;
    }

    fetchAllData();
    fetchVerificationRequests(); // Also fetch verification requests on mount
  }, []);

  // Refresh verification requests when switching to verification tab
  useEffect(() => {
    const handleTabChange = () => {
      fetchVerificationRequests();
    };

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleTabChange);

    return () => {
      document.removeEventListener('visibilitychange', handleTabChange);
    };
  }, []);


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

  // Function to determine the verification badge appearance
  const getVerificationBadge = (profile: Profile) => {
    // Check if user is verified first (this is the source of truth)
    if (profile.is_verified) {
      return (
        <Badge variant="outline" className="text-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    // If not verified, check verification status for students
    if (profile.role === 'student') {
      switch (profile.verification_status) {
        case 'pending':
          return <Badge variant="secondary">Pending Verification</Badge>;
        case 'rejected':
          return <Badge variant="destructive">Rejected</Badge>;
        default:
          return <Badge variant="secondary">Not Verified</Badge>;
      }
    }

    // For alumni who are not verified
    return <Badge variant="secondary">Not Verified</Badge>;
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/events', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data if API fails
      const mockEvents: Event[] = [
        { id: 'e1', title: 'Annual Alumni Meet 2024', date_time: '2024-08-15T18:00:00Z', location: 'University Auditorium', is_active: true, created_at: '2024-01-20T09:00:00Z', department: 'Alumni Relations' },
        { id: 'e2', title: 'Tech Innovators Conference', date_time: '2024-09-10T09:00:00Z', location: 'UIET Campus', is_active: true, created_at: '2024-02-01T11:00:00Z', department: 'UICET' },
        { id: 'e3', title: 'Business Leadership Summit', date_time: '2024-07-22T10:00:00Z', location: 'UBS Auditorium', is_active: false, created_at: '2024-01-05T16:00:00Z', department: 'UBS' },
        { id: 'e4', title: 'Career Fair 2024', date_time: '2024-05-05T09:30:00Z', location: 'Central Ground', is_active: true, created_at: '2024-01-18T14:00:00Z', department: 'Placement Cell' },
      ];
      setEvents(mockEvents);
    }
  };

  // Fetch mentorship requests
  const fetchMentorshipRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/mentorship-requests', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentorship requests');
      }

      const data = await response.json();
      setMentorshipRequests(data);
    } catch (error) {
      console.error('Error fetching mentorship requests:', error);
      // Fallback to mock data if API fails
      const mockMentorshipRequests: MentorshipRequest[] = [
        {
          id: 'm1',
          student_id: 'user-7',
          mentor_id: 'user-1',
          field_of_interest: 'Software Engineering',
          description: 'Seeking guidance on career paths in AI and ML.',
          status: 'approved',
          created_at: '2024-01-20T08:15:00Z',
          student_profile: { id: 'user-7', name: 'Aarav Mehta', department: 'UICET' },
          mentor_profile: { id: 'user-1', name: 'Dr. Sarah Chen', current_job: 'Senior Software Engineer', company: 'Google' }
        },
        {
          id: 'm2',
          student_id: 'user-8',
          mentor_id: 'user-2',
          field_of_interest: 'Finance and Investment',
          description: 'Interested in learning about stock market analysis and portfolio management.',
          status: 'approved',
          created_at: '2024-01-22T12:40:00Z',
          student_profile: { id: 'user-8', name: 'Anisha Verma', department: 'UBS' },
          mentor_profile: { id: 'user-2', name: 'Prof. Raj Sharma', current_job: 'Investment Banking Director', company: 'Goldman Sachs' }
        },
        {
          id: 'm3',
          student_id: 'user-9',
          mentor_id: undefined,
          field_of_interest: 'Data Science',
          description: 'Looking for a mentor to guide me through my data science projects.',
          status: 'pending',
          created_at: '2024-01-25T15:20:00Z',
          student_profile: { id: 'user-9', name: 'Rahul Kumar', department: 'UICET' },
          mentor_profile: undefined
        },
        {
          id: 'm4',
          student_id: 'user-12',
          mentor_id: 'user-3',
          field_of_interest: 'Corporate Law',
          description: 'Need advice on internship opportunities in law firms.',
          status: 'approved',
          created_at: '2024-02-01T09:20:00Z',
          student_profile: { id: 'user-12', name: 'Preet Kaur', department: 'Arts' },
          mentor_profile: { id: 'user-3', name: 'Dr. Priya Patel', current_job: 'Corporate Lawyer', company: 'Baker McKenzie' }
        }
      ];
      setMentorshipRequests(mockMentorshipRequests);
    }
  };

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

        {/* Verification Status Card */}
        <Card className="mb-8 bg-gradient-to-br from-yellow-50 via-green-50 to-emerald-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Admin Verification Dashboard
            </CardTitle>
            <CardDescription>
              Manage verification requests and user authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Verifications</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {verificationRequests.filter((req: any) => req.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {stats.verifiedProfiles}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalProfiles}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const tab = document.querySelector('[value="verification"]');
                  if (tab) (tab as HTMLElement).click();
                }}
                className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Manage Verifications
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  fetchVerificationRequests();
                  fetchProfiles();
                  toast({ title: "Refreshed", description: "Verification data updated" });
                }}
              >
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

        {/* Detailed Management Tabs */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="analytics" className="text-xs lg:text-sm px-2 lg:px-3">Analytics</TabsTrigger>
            <TabsTrigger value="student-success" className="text-xs lg:text-sm px-2 lg:px-3">Success</TabsTrigger>
            <TabsTrigger value="verification" className="text-xs lg:text-sm px-2 lg:px-3">Verify</TabsTrigger>
            <TabsTrigger value="profiles" className="text-xs lg:text-sm px-2 lg:px-3 col-span-3 lg:col-span-1">Users</TabsTrigger>
            <TabsTrigger value="events" className="text-xs lg:text-sm px-2 lg:px-3">Events</TabsTrigger>
            <TabsTrigger value="mentorships" className="text-xs lg:text-sm px-2 lg:px-3">Mentorships</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
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
                      <BarChart data={[
                        { name: 'UICET', alumni: 2450, students: 890, engagement: 78 },
                        { name: 'UBS', alumni: 1890, students: 670, engagement: 72 },
                        { name: 'UIET', alumni: 1650, students: 580, engagement: 85 },
                        { name: 'Law', alumni: 980, students: 320, engagement: 68 },
                        { name: 'Medicine', alumni: 1200, students: 450, engagement: 80 },
                        { name: 'Arts', alumni: 850, students: 390, engagement: 65 }
                      ]}>
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
                    <Globe className="w-5 h-5" />
                    Geographic Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Punjab', value: 30, color: '#667eea' },
                      { name: 'Delhi NCR', value: 25, color: '#764ba2' },
                      { name: 'Mumbai', value: 15, color: '#f093fb' },
                      { name: 'Bangalore', value: 12, color: '#f5576c' },
                      { name: 'International', value: 18, color: '#4facfe' }
                    ].map((region, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: region.color }}
                            ></div>
                            <span className="font-medium">{region.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {(region.value * 83.4).toFixed(0)} alumni
                            </span>
                            <Badge variant="outline">{region.value}%</Badge>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${region.value}%`,
                              backgroundColor: region.color
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">8,340</div>
                        <div className="text-sm text-muted-foreground">Total Alumni Worldwide</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-primary">42</div>
                          <div className="text-xs text-muted-foreground">Countries</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <div className="text-lg font-bold text-primary">156</div>
                          <div className="text-xs text-muted-foreground">Cities</div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      <AreaChart data={[
                        { month: 'Jan', mentorships: 45, events: 12, donations: 28, total: 85 },
                        { month: 'Feb', mentorships: 52, events: 15, donations: 34, total: 101 },
                        { month: 'Mar', mentorships: 61, events: 18, donations: 41, total: 120 },
                        { month: 'Apr', mentorships: 58, events: 22, donations: 38, total: 118 },
                        { month: 'May', mentorships: 67, events: 19, donations: 45, total: 131 },
                        { month: 'Jun', mentorships: 73, events: 25, donations: 52, total: 150 }
                      ]}>
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
                    {[
                      { name: 'Technology', alumni: 1450, avgSalary: 1200000, growth: 15 },
                      { name: 'Finance', alumni: 890, avgSalary: 1800000, growth: 8 },
                      { name: 'Healthcare', alumni: 680, avgSalary: 950000, growth: 12 },
                      { name: 'Education', alumni: 520, avgSalary: 600000, growth: 5 },
                      { name: 'Government', alumni: 430, avgSalary: 800000, growth: 3 },
                      { name: 'Startups', alumni: 380, avgSalary: 1100000, growth: 25 }
                    ].map((industry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{industry.name}</span>
                            <Badge variant={industry.growth > 15 ? "default" : industry.growth > 8 ? "secondary" : "outline"} className={industry.growth > 15 ? "text-green-600" : industry.growth > 8 ? "text-blue-600" : "text-muted-foreground"}>
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
                    {[
                      { metric: 'Placement Rate', value: 89, target: 85, trend: '+4%' },
                      { metric: 'Avg. Starting Salary', value: 6.2, target: 5.8, trend: '+6.9%' },
                      { metric: 'Industry Readiness', value: 78, target: 75, trend: '+4%' },
                      { metric: 'Alumni Mentorship', value: 67, target: 60, trend: '+11.7%' },
                      { metric: 'Skill Certification', value: 72, target: 70, trend: '+2.9%' },
                      { metric: 'Job Satisfaction', value: 8.4, target: 8.0, trend: '+5%' }
                    ].map((metric, index) => (
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
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Verification Management</h2>
              <Button onClick={() => {
                fetchVerificationRequests();
                fetchProfiles();
                toast({ title: "Refreshed", description: "Verification data updated" });
              }}>
                Refresh Data
              </Button>
            </div>

            {/* Sub-tabs for Alumni and Student */}
            <Tabs defaultValue="alumni-requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="alumni-requests">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Alumni Requests ({verificationRequests.filter((req: any) => req.status === 'pending' && req.userRole === 'alumni').length})
                </TabsTrigger>
                <TabsTrigger value="student-requests">
                  <Users className="w-4 h-4 mr-2" />
                  Student Requests ({verificationRequests.filter((req: any) => req.status === 'pending' && req.userRole === 'student').length})
                </TabsTrigger>
              </TabsList>

              {/* Alumni Verification Requests */}
              <TabsContent value="alumni-requests">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Pending Alumni Verifications</span>
                      <Badge variant="secondary">
                        {verificationRequests.filter((req: any) => req.status === 'pending' && req.userRole === 'alumni').length} pending
                      </Badge>
                    </CardTitle>
                    <CardDescription>Alumni waiting for verification approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {verificationRequests
                        .filter((req: any) => req.status === 'pending' && req.userRole === 'alumni')
                        .map((request: any) => {
                          const profile = profiles.find(p => p.id === request.userId);
                          const userName = (request.requestData as any)?.name || request.userName || 'Unknown';
                          const userEmail = request.userEmail || (request.requestData as any)?.email || 'Email not available';

                          return (
                            <div key={request.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{userName}</h4>
                                    <Badge variant="default">Alumni</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                                  {profile && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {profile.department} • Class of {profile.graduation_year}
                                    </p>
                                  )}
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <p>Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleApproveVerification(request.id)}>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectVerification(request.id)}>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {verificationRequests.filter((req: any) => req.status === 'pending' && req.userRole === 'alumni').length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No pending alumni verifications.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Student Verification Requests */}
              <TabsContent value="student-requests">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Pending Student Verifications</span>
                      <Badge variant="secondary">
                        {verificationRequests.filter((req: any) => req.status === 'pending' && req.userRole === 'student').length} pending
                      </Badge>
                    </CardTitle>
                    <CardDescription>Students waiting for verification approval</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {verificationRequests
                        .filter((req: any) => req.status === 'pending' && req.userRole === 'student')
                        .map((request: any) => {
                          const profile = profiles.find(p => p.id === request.userId);
                          const userName = (request.requestData as any)?.name || request.userName || request.userEmail?.split('@')[0] || 'User';
                          const userEmail = request.userEmail || (request.requestData as any)?.email || 'Email not available';

                          return (
                            <div key={request.id} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{userName}</h4>
                                    <Badge variant="secondary">Student</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <p>Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                                    {request.userStudentId && <p>Student ID: {request.userStudentId}</p>}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleApproveVerification(request.id)}>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleRejectVerification(request.id)}>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {verificationRequests.filter((req: any) => req.status === 'pending' && req.userRole === 'student').length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No pending student verifications.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Bulk Actions Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Bulk Verification Actions</CardTitle>
                <CardDescription>Manage multiple verifications at once</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => {
                    toast({ title: "Bulk Approve", description: "This feature needs to be implemented for selected users." });
                  }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Selected
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    toast({ title: "Bulk Reject", description: "This feature needs to be implemented for selected users." });
                  }}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Selected
                  </Button>
                  {/* CSV Upload Button */}
                  <div className="flex items-center">
                    <label htmlFor="csv-upload" className="flex items-center px-4 py-2 rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload CSV
                    </label>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const formData = new FormData();
                          formData.append('csvFile', e.target.files[0]);
                          handleCSVUpload(formData);
                        }
                      }}
                      className="hidden"
                    />
                  </div>
                  <Button variant="outline">
                    Export Verification Report
                  </Button>
                </div>
                {csvUploadResult && (
                  <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
                    <p className="text-sm text-green-800">
                      CSV Upload Summary: Processed {csvUploadResult.processed} users.
                      {csvUploadResult.errors && csvUploadResult.errors.length > 0 && (
                        <>
                          {' '}
                          <span className="font-semibold">Errors:</span> {csvUploadResult.errors.length}
                        </>
                      )}
                    </p>
                  </div>
                )}
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
                          {getVerificationBadge(profile)}
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
                        {profile.role !== 'student' && ( // Only show verify/unverify for non-students here
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
                        )}
                        {profile.role === 'student' && profile.verification_status === 'pending' && (() => {
                          const request = verificationRequests.find((req: any) => req.user_id === profile.id && req.status === 'pending');
                          return request ? (
                            <>
                              <Button size="sm" onClick={() => handleApproveVerification(request.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectVerification(request.id)}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          ) : (
                            <Badge variant="secondary">No pending request</Badge>
                          );
                        })()}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchEventParticipants(event.id)}
                          disabled={selectedEventForParticipants === event.id}
                        >
                          {selectedEventForParticipants === event.id ? 'Viewing Participants...' : 'View Participants'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Participants View */}
                {selectedEventForParticipants && (
                  <div className="mt-8 p-6 border rounded-lg bg-muted/30">
                    <h3 className="text-xl font-bold mb-4">Participants for: {events.find(e => e.id === selectedEventForParticipants)?.title}</h3>
                    {eventParticipants.length > 0 ? (
                      <div className="space-y-3">
                        {eventParticipants.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between p-3 bg-background rounded-lg shadow">
                            <div>
                              <p className="font-medium">{participant.name || participant.email}</p>
                              <p className="text-sm text-muted-foreground">{participant.email}</p>
                            </div>
                            <Badge variant="secondary">{participant.role || 'Participant'}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No participants found for this event or loading...</p>
                    )}
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setSelectedEventForParticipants(null)}>
                      Hide Participants
                    </Button>
                  </div>
                )}
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