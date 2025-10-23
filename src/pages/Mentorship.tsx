import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MapPin, Briefcase, MessageCircle, Filter, User, Building, GraduationCap, Star, Send, CheckCircle } from "lucide-react";

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === "string" ? item : String(item)))
      .map(item => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,;\n]/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return value.trim().toLowerCase() === "true" || value.trim() === "1";
  return false;
};

const normalizeProgram = (value: unknown): string => {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  const upper = text.toUpperCase();
  if (upper.includes("MSC")) return "MSc IT";
  if (upper.includes("MCA")) return "MCA";
  return text;
};

const transformMentor = (raw: any) => {
  return {
    ...raw,
    userId: String(raw.userId ?? raw.id ?? ""),
    program: normalizeProgram(raw.program ?? raw.batchType ?? raw.department),
    currentPosition: raw.currentPosition ?? raw.current_position ?? "",
    currentCompany: raw.currentCompany ?? raw.current_company ?? "",
    companyLocation: raw.companyLocation ?? raw.company_location ?? "",
    expertiseAreas: normalizeList(raw.expertiseAreas ?? raw.mentorshipAreas ?? raw.technicalSkills),
    mentorshipAreas: normalizeList(raw.mentorshipAreas),
    bio: raw.bio ?? "",
    isMentorAvailable: normalizeBoolean(raw.isMentorAvailable ?? raw.is_mentor_available),
    graduationYear: Number(raw.graduationYear ?? raw.graduation_year ?? 0) || 0,
    profilePictureUrl: raw.profilePictureUrl ?? "",
  };
};

const Mentorship = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [usageActive, setUsageActive] = useState<number>(0);
  const [capacityByMentor, setCapacityByMentor] = useState<Record<string, { accepted: number; full: boolean }>>({});
  const [mentorshipRequest, setMentorshipRequest] = useState({
    subject: "",
    message: "",
    preferredTime: "",
    goals: ""
  });

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const r = await fetch('/api/mentorship/my-requests-student', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json().catch(() => []);
      const arr = Array.isArray(j) ? j : [];
      setMyRequests(arr);
      // compute student usage locally: pending + accepted
      const active = arr.filter((r: any) => r.status === 'pending' || r.status === 'accepted').length;
      setUsageActive(active);
    } catch {}
  };

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const resp = await fetch('/api/alumni-profile/directory');
        if (!resp.ok) throw new Error('Failed to load directory');
        const data = await resp.json();
        setMentors(Array.isArray(data.alumni) ? data.alumni : []);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load mentors');
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
    // also load my existing requests to show state per mentor
    fetchMyRequests();
  }, []);

  // Preload mentor capacities when mentors change (best-effort)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const loadCaps = async () => {
      const entries: [string, { accepted: number; full: boolean }][] = [];
      for (const m of mentors) {
        const mid = m.userId || m.id;
        if (!mid || capacityByMentor[mid]) continue;
        try {
          const r = await fetch(`/api/mentorship/mentor/${mid}/capacity`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
          if (!r.ok) continue;
          const d = await r.json();
          entries.push([mid, { accepted: Number(d.accepted || 0), full: Boolean(d.full) }]);
        } catch {}
      }
      if (entries.length) setCapacityByMentor(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    };
    if (mentors.length) loadCaps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentors.length]);

  const availableMentors = mentors.filter(person => person.isMentorAvailable);

  const filteredMentors = availableMentors.filter(person => {
    const matchesSearch = (person.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.currentPosition || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.expertiseAreas || []).some((skill: string) => (skill || "").toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === "all" || person.program === selectedDepartment;
    const matchesLocation = selectedLocation === "all" || (person.companyLocation || '').toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const departments = [...new Set(mentors.map((a: any) => a.program).filter(Boolean))];
  const locations = [...new Set(mentors.map((a: any) => a.companyLocation).filter(Boolean))];

  const handleRequestMentorship = (mentor: any) => {
    setSelectedMentor(mentor);
    setDialogOpen(true);
  };

  const submitMentorshipRequest = async () => {
    try {
      if (!selectedMentor) return;
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please log in to send a request');
        return;
      }
      // Validate required fields
      if (!mentorshipRequest.subject.trim() || !mentorshipRequest.goals.trim() || !mentorshipRequest.preferredTime.trim() || !mentorshipRequest.message.trim()) {
        toast.error('Please fill Subject, Goals, Preferred Time, and Message');
        return;
      }
      setSubmitting(true);
      const mentorId = selectedMentor.userId || selectedMentor.id;
      if (!mentorId) {
        toast.error('Unable to determine mentor ID. Please try again.');
        setSubmitting(false);
        return;
      }
      const resp = await fetch('/api/mentorship/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentorId,
          fieldOfInterest: mentorshipRequest.subject || 'General Mentorship',
          description: mentorshipRequest.message || null,
          goals: mentorshipRequest.goals || null,
          preferredTime: mentorshipRequest.preferredTime || null,
        }),
      });
      if (!resp.ok) {
        let message = 'Failed to send request';
        try {
          const data = await resp.json();
          const parts = [data.error, data.detail, data.constraint, data.code, data.table]
            .filter(Boolean)
            .join(' | ');
          if (parts) message = parts;
        } catch {
          const txt = await resp.text().catch(() => '');
          if (txt) message = txt;
        }
        throw new Error(message);
      }
      toast.success('Mentorship request sent!');
      setMentorshipRequest({ subject: "", message: "", preferredTime: "", goals: "" });
      setSelectedMentor(null);
      setDialogOpen(false);
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 1500);
      // refresh my requests so the button changes to Pending/Open Chat
      await fetchMyRequests();
    } catch (e: any) {
      toast.error(e.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Find Your Mentor
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with experienced alumni who are ready to guide you in your career journey. 
            Get personalized advice, industry insights, and professional networking opportunities.
          </p>
          <div className="mt-4">
            <Button onClick={() => window.location.assign('/my-mentorships')}>
              View My Mentorships & Chat
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Requests used: <span className="font-medium">{usageActive}</span>/5
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{availableMentors.length}</div>
              <div className="text-muted-foreground">Available Mentors</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{departments.length}</div>
              <div className="text-muted-foreground">Departments</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">{locations.length}</div>
              <div className="text-muted-foreground">Global Locations</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Find the Perfect Mentor</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name, profession, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2"
              />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredMentors.length} of {availableMentors.length} available mentors
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="shadow-elegant hover:shadow-glow transition-all duration-300 group border border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  {mentor.profilePictureUrl ? (
                    <img src={mentor.profilePictureUrl} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {String(mentor.name || '?').split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {mentor.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {mentor.program}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Class of {mentor.graduationYear}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 text-primary" />
                    <span className="line-clamp-1">{mentor.currentPosition}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{mentor.companyLocation}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mentor.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {(mentor.expertiseAreas || []).slice(0, 3).map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {(mentor.expertiseAreas || []).length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(mentor.expertiseAreas || []).length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {(() => {
                    const mid = mentor.userId || mentor.id;
                    const cap = capacityByMentor[mid];
                    if (cap) {
                      return (
                        <Badge variant={cap.full ? 'destructive' : 'secondary'} className={`text-xs ${cap.full ? '' : 'bg-green-100 text-green-800'}`}>
                          {cap.full ? 'Full (5/5)' : `Capacity ${cap.accepted}/5`}
                        </Badge>
                      );
                    }
                    return (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {mentor.isMentorAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    );
                  })()}
                </div>

                <div className="h-px bg-border/70 my-1" />

                {(() => {
                  const mentorId = mentor.userId || mentor.id;
                  const existing = myRequests.find(r => (r.mentorId === mentorId) || (r.mentorId === mentor.userId) || (r.mentorId === mentor.id));
                  const state = existing?.status as undefined | 'pending' | 'accepted' | 'declined' | 'completed';
                  const viewProfile = () => window.location.assign(`/alumni/${mentorId}`);
                  if (state === 'accepted') {
                    return (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="w-1/2" onClick={viewProfile}>View Profile</Button>
                        <Button className="w-1/2" variant="secondary" onClick={() => window.location.assign(`/chat/${existing.id}`)}>Open Chat</Button>
                      </div>
                    );
                  }
                  if (state === 'pending') {
                    return (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="w-1/2" onClick={viewProfile}>View Profile</Button>
                        <Button className="w-1/2" disabled>Request Sent (Pending)</Button>
                      </div>
                    );
                  }
                  const cap = capacityByMentor[mentorId];
                  const isFull = cap?.full === true;
                  return (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="w-1/2" onClick={viewProfile}>View Profile</Button>
                      <Button 
                        className="w-1/2 bg-gradient-hero hover:opacity-90 transition-opacity"
                        onClick={() => handleRequestMentorship(mentor)}
                        disabled={isFull}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isFull ? 'Mentor Full' : 'Request Mentorship'}
                      </Button>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Request Mentorship</DialogTitle>
                      <DialogDescription>
                        Send a mentorship request to {mentor.name}. Be specific about your goals and what you hope to achieve.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Career guidance in Machine Learning"
                          value={mentorshipRequest.subject}
                          onChange={(e) => setMentorshipRequest({...mentorshipRequest, subject: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="goals">Your Goals</Label>
                        <Input
                          id="goals"
                          placeholder="e.g., Transition to Product Management"
                          value={mentorshipRequest.goals}
                          onChange={(e) => setMentorshipRequest({...mentorshipRequest, goals: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferredTime">Preferred Meeting Time</Label>
                        <Input
                          id="preferredTime"
                          placeholder="e.g., Weekends, 10 AM - 12 PM"
                          value={mentorshipRequest.preferredTime}
                          onChange={(e) => setMentorshipRequest({...mentorshipRequest, preferredTime: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Introduce yourself and explain why you'd like this person as your mentor..."
                          value={mentorshipRequest.message}
                          onChange={(e) => setMentorshipRequest({...mentorshipRequest, message: e.target.value})}
                          rows={4}
                        />
                      </div>
                      <Button onClick={submitMentorshipRequest} disabled={submitting} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        {submitting ? 'Sending...' : 'Send Request'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                  );
                })()}

                {/* Success Confirmation Dialog */}
                <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                  <DialogContent className="max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-green-100 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <DialogTitle className="mb-1">Request Sent</DialogTitle>
                        <DialogDescription>
                          Your mentorship request has been sent successfully.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              No mentors found matching your criteria.
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms to find more mentors.
            </p>
          </div>
        )}

        {/* How It Works Section */}
        <Card className="bg-gradient-card border-0 shadow-elegant">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">How Mentorship Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4 mx-auto">
                  1
                </div>
                <h3 className="font-semibold mb-2">Find Your Mentor</h3>
                <p className="text-sm text-muted-foreground">
                  Browse through our network of experienced alumni and find someone who matches your career goals.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4 mx-auto">
                  2
                </div>
                <h3 className="font-semibold mb-2">Send Request</h3>
                <p className="text-sm text-muted-foreground">
                  Send a personalized mentorship request explaining your goals and what you hope to learn.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-4 mx-auto">
                  3
                </div>
                <h3 className="font-semibold mb-2">Start Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Once accepted, schedule regular sessions and start your journey toward achieving your career goals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mentorship;
