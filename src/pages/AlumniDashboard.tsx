import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { mentorshipRequests, alumni } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
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
  Settings,
  Award,
  TrendingUp,
  Bell,
  UserPlus
} from "lucide-react";

const AlumniDashboard = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const [acceptingRequest, setAcceptingRequest] = useState<number | null>(null);
  const [decliningRequest, setDecliningRequest] = useState<number | null>(null);
  const [referringRequest, setReferringRequest] = useState<number | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [referralNote, setReferralNote] = useState("");
  const { toast } = useToast();
  
  // Mock current alumni
  const currentAlumni = alumni[0]; // Dr. Sarah Chen
  
  // Filter requests for current alumni
  const alumniRequests = mentorshipRequests.filter(req => req.alumniId === currentAlumni.id);

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

  const handleAcceptRequest = (requestId: number) => {
    if (!meetingLink.trim()) {
      toast({
        title: "Meeting Link Required",
        description: "Please provide a meeting link to schedule the session.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock function - would update request status in real implementation
    console.log("Accepting request:", requestId, "with meeting link:", meetingLink);
    toast({
      title: "Request Accepted",
      description: "Meeting scheduled successfully. Student will be notified.",
    });
    
    setAcceptingRequest(null);
    setMeetingLink("");
  };

  const handleDeclineRequest = (requestId: number) => {
    if (!declineReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for declining this request.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock function - would update request status in real implementation  
    console.log("Declining request:", requestId, "with reason:", declineReason);
    toast({
      title: "Request Declined",
      description: "Student has been notified with your feedback.",
    });
    
    setDecliningRequest(null);
    setDeclineReason("");
  };

  const handleReferralSubmit = (requestId: number) => {
    if (!referralEmail.trim() || !referralNote.trim()) {
      toast({
        title: "Complete Information Required",
        description: "Please provide both referral email and note.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock function - would send referral to another alumni
    console.log("Referring request:", requestId, "to:", referralEmail, "note:", referralNote);
    toast({
      title: "Referral Sent",
      description: "The request has been forwarded to another alumnus.",
    });
    
    setReferringRequest(null);
    setReferralEmail("");
    setReferralNote("");
  };

  const stats = [
    {
      title: "Pending Requests",
      value: alumniRequests.filter(r => r.status === "pending").length,
      icon: Clock,
      color: "text-warning"
    },
    {
      title: "Active Sessions",
      value: alumniRequests.filter(r => r.status === "accepted").length,
      icon: MessageCircle,
      color: "text-success"
    },
    {
      title: "Completed Sessions",
      value: alumniRequests.filter(r => r.status === "completed").length,
      icon: Award,
      color: "text-primary"
    },
    {
      title: "Mentoring Score",
      value: "4.9",
      icon: TrendingUp,
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
              Welcome, {currentAlumni.name}! 🎓
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentAlumni.profession} • {currentAlumni.department} '{currentAlumni.batchYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
              {currentAlumni.name.split(' ').map(n => n[0]).join('')}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Mentorship Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile & Availability</TabsTrigger>
            <TabsTrigger value="impact">Impact & Analytics</TabsTrigger>
          </TabsList>

          {/* Mentorship Requests Tab */}
          <TabsContent value="requests">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Incoming Mentorship Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alumniRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending requests at the moment.</p>
                    <p className="text-sm text-muted-foreground">
                      Students will be able to find and connect with you through the alumni directory.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alumniRequests.map((request) => (
                      <Card key={request.id} className="border border-border">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {request.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h3 className="font-semibold">{request.studentName}</h3>
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
                          </div>

                          {request.status === "pending" && (
                            <div className="space-y-3 mt-6">
                              <div className="grid grid-cols-2 gap-3">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button className="bg-success hover:bg-success/90">
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Accept
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Accept Mentorship Request</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="meeting-link">Meeting Link</Label>
                                        <Input
                                          id="meeting-link"
                                          placeholder="Enter Zoom/Meet/Teams link..."
                                          value={meetingLink}
                                          onChange={(e) => setMeetingLink(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => setMeetingLink("")}>
                                          Cancel
                                        </Button>
                                        <Button 
                                          className="bg-success hover:bg-success/90"
                                          onClick={() => handleAcceptRequest(request.id)}
                                        >
                                          Schedule Meeting
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Decline
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Decline Mentorship Request</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="decline-reason">Reason for declining</Label>
                                        <Textarea
                                          id="decline-reason"
                                          placeholder="Please provide a reason (will be shared with student)..."
                                          value={declineReason}
                                          onChange={(e) => setDeclineReason(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => setDeclineReason("")}>
                                          Cancel
                                        </Button>
                                        <Button 
                                          variant="destructive"
                                          onClick={() => handleDeclineRequest(request.id)}
                                        >
                                          Confirm Decline
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="secondary" className="w-full">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Refer to Another Alumni
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Refer to Another Alumni</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="referral-email">Alumni Email</Label>
                                      <Input
                                        id="referral-email"
                                        placeholder="colleague@alumni.edu"
                                        value={referralEmail}
                                        onChange={(e) => setReferralEmail(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="referral-note">Referral Note</Label>
                                      <Textarea
                                        id="referral-note"
                                        placeholder="Why would this person be a better fit for this request..."
                                        value={referralNote}
                                        onChange={(e) => setReferralNote(e.target.value)}
                                      />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <Button variant="outline" onClick={() => {
                                        setReferralEmail("");
                                        setReferralNote("");
                                      }}>
                                        Cancel
                                      </Button>
                                      <Button onClick={() => handleReferralSubmit(request.id)}>
                                        Send Referral
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}

                          {request.status === "accepted" && (
                            <div className="bg-success/10 p-3 rounded-lg mt-4">
                              <h4 className="font-medium text-sm mb-2 text-success">Session Scheduled!</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                Scheduled: {new Date(request.scheduledTime!).toLocaleString()}
                              </p>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-success hover:bg-success/90"
                                  onClick={() => window.open(request.meetingLink, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Join Meeting
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Reschedule
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea 
                      defaultValue={currentAlumni.bio}
                      placeholder="Tell students about your experience..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current Position</label>
                    <Input 
                      defaultValue={currentAlumni.profession}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input 
                      defaultValue={currentAlumni.location}
                      className="mt-1"
                    />
                  </div>
                  <Button className="w-full bg-gradient-hero hover:opacity-90">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Availability & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Available Hours per Week</label>
                    <Input 
                      type="number"
                      defaultValue="5"
                      className="mt-1"
                      placeholder="Hours per week"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preferred Meeting Duration</label>
                    <Input 
                      defaultValue="45 minutes"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Areas of Expertise</label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentAlumni.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Availability
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Mentoring Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">4.9/5.0</div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Students Mentored</span>
                        <span className="font-semibold">23</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Hours</span>
                        <span className="font-semibold">47 hours</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Stories</span>
                        <span className="font-semibold">18</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recent Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-card p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-warning">
                          {"★".repeat(5)}
                        </div>
                        <span className="text-sm text-muted-foreground">2 days ago</span>
                      </div>
                      <p className="text-sm">
                        "Incredibly helpful session! Dr. Chen provided great insights into ML career paths."
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">- Anonymous Student</p>
                    </div>
                    
                    <div className="bg-gradient-card p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-warning">
                          {"★".repeat(5)}
                        </div>
                        <span className="text-sm text-muted-foreground">1 week ago</span>
                      </div>
                      <p className="text-sm">
                        "Amazing mentor! Helped me land my first internship at a tech company."
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">- Anonymous Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AlumniDashboard;