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
  Award
} from 'lucide-react';

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
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch real mentorship requests from database
  useEffect(() => {
    const fetchMentorshipRequests = async () => {
      try {
        const response = await fetch('/api/mentorship/my-requests', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAlumniRequests(data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching mentorship requests:', error);
      }

      // No fallback to mock data - show empty state if no data
      setLoading(false);
    };

    fetchMentorshipRequests();
  }, []);

  const handleAcceptRequest = (requestId: string) => {
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
      description: "The mentorship request has been accepted successfully!",
    });
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

  const handleCompleteRequest = (requestId: string) => {
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
                <div className="text-2xl font-bold">{alumniRequests.length}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Status Card */}
        <Card className="mb-8 border-l-4" style={{
          borderLeftColor: user?.isVerified ? '#10b981' : '#f59e0b'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user?.isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-orange-500" />
              )}
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user?.isVerified ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <p className="text-green-800 font-semibold">✓ Verified Account</p>
                <p className="text-green-700 text-sm mt-1">Your profile is verified and visible to students.</p>
              </div>
            ) : (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="text-orange-800 font-semibold">⏳ Verification Pending</p>
                <p className="text-orange-700 text-sm mt-1">Please wait for an admin to verify your account. You'll receive an email once approved.</p>
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
            My Profile
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
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Focus:</strong> {request.subject}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Started:</strong> {formatDate(request.createdAt)}
                    </p>
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
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Focus:</strong> {request.subject}
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
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Alumni Profile
                  </CardTitle>
                  <CardDescription>
                    Complete your profile to be visible in the Alumni Directory and available for mentorship
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlumniProfileForm onSuccess={() => {
                    toast({
                      title: "Success!",
                      description: "Your profile has been saved. It will be visible in the Alumni Directory once verified.",
                    });
                  }} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;