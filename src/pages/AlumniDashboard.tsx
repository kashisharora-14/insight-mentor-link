import { useState, useEffect } from 'react';
import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlumniProfileForm } from '@/components/alumni/AlumniProfileForm';
import {
  Users,
  MessageCircle,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  GraduationCap,
  Building,
  Mail,
  Star,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react';

// Assume apiClient is configured elsewhere, e.g., in a context or separate utility file
// import apiClient from '@/lib/apiClient'; 

// Mocking apiClient for demonstration purposes if it's not globally available
const apiClient = {
  get: async (url: string) => {
    // This is a placeholder. In a real app, this would make an actual API call.
    console.log(`Mock GET request to: ${url}`);
    if (url === '/api/alumni-profile/profile') {
      // Simulate a successful response for the alumni profile
      return Promise.resolve({
        profile: {
          name: "Punnet",
          currentPosition: "Software Engineer",
          currentCompany: "Tech Corp",
          city: "San Francisco",
          state: "CA",
          country: "USA",
          bio: "Passionate about building scalable solutions and mentoring.",
          technicalSkills: ["React", "Node.js", "TypeScript", "AWS"],
          expertiseAreas: ["Web Development", "Cloud Computing", "Mentorship"],
          isMentorAvailable: true,
          mentorshipAreas: ["Career Advice", "Technical Guidance"],
          linkedinUrl: "https://linkedin.com/in/punnet",
          githubUrl: "https://github.com/punnet",
          showContactInfo: true,
          email: "punnet@example.com",
          // Add other profile fields as needed
          timeline: [
            { title: "Software Engineer", company: "Tech Corp", duration: "2020 - Present" },
            { title: "Junior Developer", company: "Innovate Solutions", duration: "2018 - 2020" }
          ],
          profileImage: "https://via.placeholder.com/150/92c952"
        }
      });
    }
    // Simulate other API responses if necessary
    return Promise.resolve({});
  },
  // Add other methods like post, put, delete if needed
};


interface MentorshipRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: string;
  subject: string;
  goals: string;
  preferredTime: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
  studentProfile?: {
    bio?: string;
    skills?: string[];
  };
}

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [acceptingRequest, setAcceptingRequest] = useState<string | null>(null);
  const [decliningRequest, setDecliningRequest] = useState<string | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [alumniRequests, setAlumniRequests] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicProfile, setPublicProfile] = useState<any | null>(null);
  const [ratings, setRatings] = useState<Record<string, { average: number; count: number }>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Placeholder for fetchStats if it exists in the original context
  const fetchStats = () => {
    // This would typically fetch dashboard stats.
    // For this example, we'll assume it's handled elsewhere or not critical for the profile display.
  };

  // Fetch real mentorship requests from database
  useEffect(() => {
    const fetchMentorshipRequests = async () => {
      try {
        const response = await fetch('/api/mentorship/my-requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAlumniRequests(data);
        }
      } catch (error) {
        console.error('Error fetching mentorship requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorshipRequests();
  }, []);

  // Load public profile preview for the logged-in alumni
  useEffect(() => {
    const loadPublicProfile = async () => {
      try {
        if (!user?.id) return;
        const resp = await fetch(`/api/alumni-profile/profile/${user.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        setPublicProfile(data.profile || null);
      } catch (error) {
        console.error('Error loading public profile:', error);
        setPublicProfile(null); // Ensure profile is null if fetch fails
      }
    };
    if (user?.id) {
      loadPublicProfile();
    }
  }, [user?.id]);

  // After requests load, fetch ratings for each mentorship
  useEffect(() => {
    const loadRatings = async () => {
      try {
        const all = [...alumniRequests];
        const entries = await Promise.all(all.map(async (req) => {
          try {
            const resp = await fetch(`/api/mentorship/${req.id}/reviews`, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            });
            if (!resp.ok) return [req.id, { average: 0, count: 0 }] as const;
            const data = await resp.json();
            return [req.id, { average: Number(data.average || 0), count: Number(data.count || 0) }] as const;
          } catch {
            return [req.id, { average: 0, count: 0 }] as const;
          }
        }));
        setRatings(Object.fromEntries(entries));
      } catch (error) {
        console.error('Error loading ratings:', error);
      }
    };
    if (alumniRequests.length) loadRatings();
  }, [alumniRequests]);

  const overallRating = (() => {
    const vals = Object.values(ratings);
    if (!vals.length) return { avg: 0, count: 0 };
    const totalCount = vals.reduce((s, r) => s + r.count, 0);
    const weighted = vals.reduce((s, r) => s + r.average * r.count, 0);
    const avg = totalCount ? weighted / totalCount : 0;
    return { avg, count: totalCount };
  })();

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const resp = await fetch(`/api/mentorship/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to accept request');
      }
      setAlumniRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'accepted' as const }
            : req
        )
      );
      setAcceptingRequest(null);
      setMeetingLink("");
      toast({
        title: "Request Accepted",
        description: "Chat has been opened for this mentorship.",
      });
      navigate(`/chat/${requestId}`);
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not accept request', variant: 'destructive' });
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    setAlumniRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'declined' as const }
          : req
      )
    );
    setDecliningRequest(null);
    setDeclineReason("");
    toast({
      title: "Request Declined",
      description: "The mentorship request has been declined.",
    });
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const resp = await fetch(`/api/mentorship/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.JSONstringify({ status: 'completed' }),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to update status');
      }
      setAlumniRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? { ...req, status: 'completed' as const }
            : req
        )
      );
      toast({
        title: "Mentorship Completed",
        description: "The mentorship has been marked as completed.",
      });
    } catch (err: any) {
      toast({ title: 'Failed', description: err.message || 'Could not mark as completed', variant: 'destructive' });
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = alumniRequests.filter(req => req.status === 'pending');
  const acceptedRequests = alumniRequests.filter(req => req.status === 'accepted');
  const completedRequests = alumniRequests.filter(req => req.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Alumni Dashboard</h1>
            <Button
              onClick={() => navigate('/alumni-profile-edit')}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Edit Profile
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage your mentorship requests and help guide the next generation of professionals.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
                <div className="text-sm text-muted-foreground">Pending Requests</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{acceptedRequests.length}</div>
                <div className="text-sm text-muted-foreground">Active Mentees</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedRequests.length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallRating.count ? overallRating.avg.toFixed(1) : '—'}</div>
                <div className="text-sm text-muted-foreground">Avg Rating{overallRating.count ? ` (${overallRating.count})` : ''}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Status Card */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Account Verification Status
              {user?.isVerified && <Badge className="bg-green-600">Verified</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.isVerified ? (
              <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Account Verified ✓</h3>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    Your account has been verified. You can now access all mentorship features and appear in the alumni directory.
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Verification Method: {user?.verificationMethod === 'admin_manual' ? 'Manually approved by admin' :
                                         user?.verificationMethod === 'csv_upload' ? 'Verified via CSV upload' :
                                         'Verified'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Verification Pending</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Your account is awaiting admin approval. You'll receive an email notification once verified.
                  </p>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    While waiting, you can complete your profile. Full mentorship features will be available after verification.
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 border-b mb-6">
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-lg w-full sm:w-auto ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">Pending Requests</span>
            <span className="sm:hidden">Pending</span> ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-lg w-full sm:w-auto ${
              activeTab === "active"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">Active Mentorships</span>
            <span className="sm:hidden">Active</span> ({acceptedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-lg w-full sm:w-auto ${
              activeTab === "completed"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed ({completedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm rounded-t-lg w-full sm:w-auto ${
              activeTab === "profile"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-4 h-4 inline mr-1" />
            Public Profile (Preview)
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "requests" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pending Mentorship Requests</h2>
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">
                      You don't have any pending mentorship requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id} className="shadow-elegant">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {request.studentName}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {request.studentDepartment} • Class of {request.studentYear}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {request.studentEmail}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.status)}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Subject</Label>
                          <p className="text-sm text-muted-foreground">{request.subject}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Goals</Label>
                          <p className="text-sm text-muted-foreground">{request.goals}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Preferred Meeting Time</Label>
                        <p className="text-sm text-muted-foreground">{request.preferredTime}</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Message</Label>
                        <p className="text-sm text-muted-foreground">{request.message}</p>
                      </div>

                      {request.studentProfile && (
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Student Bio</Label>
                            <p className="text-sm text-muted-foreground">{request.studentProfile.bio}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Skills</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.studentProfile.skills?.map((skill, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="flex-1" onClick={() => setAcceptingRequest(request.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept Request
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Accept Mentorship Request</DialogTitle>
                              <DialogDescription>
                                You're about to accept {request.studentName}'s mentorship request.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                                <Input
                                  id="meetingLink"
                                  placeholder="https://meet.google.com/..."
                                  value={meetingLink}
                                  onChange={(e) => setMeetingLink(e.target.value)}
                                />
                              </div>
                              <Button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="w-full"
                              >
                                Accept & Start Mentorship
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setDecliningRequest(request.id)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Decline Mentorship Request</DialogTitle>
                              <DialogDescription>
                                Please provide a reason for declining (optional).
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for declining (optional)..."
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                              />
                              <Button
                                onClick={() => handleDeclineRequest(request.id)}
                                variant="destructive"
                                className="w-full"
                              >
                                Decline Request
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "active" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Mentorships</h2>
              {acceptedRequests.map((request) => (
                <Card key={request.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        {request.studentName}
                      </CardTitle>
                      <div className="text-right">
                        {getStatusBadge(request.status)}
                        <Button
                          size="sm"
                          onClick={() => handleCompleteRequest(request.id)}
                          className="mt-2"
                        >
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2"><strong>Focus:</strong> {request.subject}</p>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {ratings[request.id]?.count ? `${ratings[request.id].average.toFixed(1)} (${ratings[request.id].count})` : 'No ratings yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Started:</strong> {formatDate(request.createdAt)}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/chat/${request.id}`)}
                      >
                        Open Chat
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteRequest(request.id)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "completed" && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Completed Mentorships</h2>
              {completedRequests.map((request) => (
                <Card key={request.id} className="shadow-elegant">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      {request.studentName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2"><strong>Focus:</strong> {request.subject}</p>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {ratings[request.id]?.count ? `${ratings[request.id].average.toFixed(1)} (${ratings[request.id].count})` : 'No ratings yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Completed:</strong> {formatDate(request.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  How Students See Your Profile
                </h2>
                <Button onClick={() => navigate('/alumni-profile-edit')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Edit Profile
                </Button>
              </div>

              {publicProfile ? (
                <Card className="shadow-elegant border-2">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden">
                        {publicProfile.profileImage ? (
                          <img src={publicProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                            {(publicProfile.name || user?.name || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{publicProfile.name || user?.name || 'Your Name'}</CardTitle>
                        <CardDescription className="text-base mt-1">
                          {publicProfile.currentPosition || 'Position'} {publicProfile.currentCompany && `at ${publicProfile.currentCompany}`}
                        </CardDescription>
                        {(publicProfile.city || publicProfile.state || publicProfile.country) && (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {[publicProfile.city, publicProfile.state, publicProfile.country].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 mt-6">
                    {publicProfile.bio && (
                      <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-sm text-muted-foreground">{publicProfile.bio}</p>
                      </div>
                    )}

                    {publicProfile.previousCompanies && publicProfile.previousCompanies.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Building className="w-4 h-4 text-primary" />
                          Work Experience
                        </h3>
                        <div className="space-y-4">
                          {publicProfile.previousCompanies.map((exp: any, index: number) => (
                            <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Building className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{exp.position}</p>
                                <p className="text-sm text-muted-foreground">{exp.company}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                </p>
                                {exp.description && (
                                  <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {publicProfile.technicalSkills && publicProfile.technicalSkills.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {publicProfile.technicalSkills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {publicProfile.expertiseAreas && publicProfile.expertiseAreas.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {publicProfile.expertiseAreas.map((area: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {publicProfile.isMentorAvailable && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-green-900 dark:text-green-100">Available for Mentorship</h3>
                        </div>
                        {publicProfile.mentorshipAreas && publicProfile.mentorshipAreas.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {publicProfile.mentorshipAreas.map((area: string, idx: number) => (
                              <Badge key={idx} className="bg-green-600">{area}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(publicProfile.linkedinUrl || publicProfile.githubUrl || publicProfile.twitterUrl) && (
                      <div>
                        <h3 className="font-semibold mb-3">Connect</h3>
                        <div className="flex flex-col gap-3">
                          {publicProfile.linkedinUrl && (
                            <a 
                              href={publicProfile.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                            >
                              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                              </svg>
                              <div className="flex-1">
                                <p className="font-medium text-sm group-hover:text-blue-600">LinkedIn</p>
                                <p className="text-xs text-muted-foreground">Connect professionally</p>
                              </div>
                            </a>
                          )}
                          {publicProfile.githubUrl && (
                            <a 
                              href={publicProfile.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors group"
                            >
                              <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                              </svg>
                              <div className="flex-1">
                                <p className="font-medium text-sm group-hover:text-gray-800">GitHub</p>
                                <p className="text-xs text-muted-foreground">View code repositories</p>
                              </div>
                            </a>
                          )}
                          {publicProfile.twitterUrl && (
                            <a 
                              href={publicProfile.twitterUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                            >
                              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                              <div className="flex-1">
                                <p className="font-medium text-sm group-hover:text-blue-400">Twitter / X</p>
                                <p className="text-xs text-muted-foreground">Follow on social media</p>
                              </div>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {publicProfile.showContactInfo && publicProfile.email && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {publicProfile.email}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-elegant">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Profile Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your profile to show students how they'll see your information.
                    </p>
                    <Button onClick={() => navigate('/alumni-profile-edit')} className="bg-gradient-to-r from-purple-600 to-blue-600">
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;