import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Briefcase, MessageCircle, Filter, GraduationCap, Heart, Award, Users, Building, Sparkles } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { toast } from "sonner";

interface AlumniProfile {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  program: string;
  batchType: string;
  graduationYear: number;
  currentPosition: string;
  currentCompany: string;
  companyLocation: string;
  industry: string;
  workType: string;
  yearsOfExperience: number;
  technicalSkills: string[];
  expertiseAreas: string[];
  isMentorAvailable: boolean;
  mentorshipAreas: string[];
  availableForJobReferrals: boolean;
  availableForGuestLectures: boolean;
  availableForNetworking: boolean;
  bio: string;
  careerJourney: string;
  adviceForStudents: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  profilePictureUrl: string;
  isVerified: boolean;
}

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
  if (upper.includes("MSC")) return "MSCIT";
  if (upper.includes("MCA")) return "MCA";
  return text;
};

const transformAlumniProfile = (raw: any): AlumniProfile => {
  const program = normalizeProgram(raw.program ?? raw.batchType ?? raw.department);
  const technicalSkills = normalizeList(raw.technicalSkills ?? raw.skills);
  const expertiseAreas = normalizeList(raw.expertiseAreas ?? raw.mentorshipAreas);
  const mentorshipAreas = normalizeList(raw.mentorshipAreas);

  return {
    id: String(raw.id ?? raw.profile?.id ?? raw.userId ?? ""),
    userId: String(raw.userId ?? raw.id ?? raw.profile?.userId ?? ""),
    name: raw.name ?? raw.user?.name ?? "Alumni",
    email: raw.email ?? null,
    phoneNumber: raw.phoneNumber ?? null,
    program,
    batchType: raw.batchType ?? "",
    graduationYear: Number(raw.graduationYear ?? raw.graduation_year ?? 0) || 0,
    currentPosition: raw.currentPosition ?? raw.current_position ?? "",
    currentCompany: raw.currentCompany ?? raw.current_company ?? "",
    companyLocation: raw.companyLocation ?? raw.company_location ?? "",
    industry: raw.industry ?? "",
    workType: raw.workType ?? "",
    yearsOfExperience: Number(raw.yearsOfExperience ?? 0) || 0,
    technicalSkills,
    expertiseAreas,
    isMentorAvailable: normalizeBoolean(raw.isMentorAvailable ?? raw.is_mentor_available),
    mentorshipAreas,
    availableForJobReferrals: normalizeBoolean(raw.availableForJobReferrals),
    availableForGuestLectures: normalizeBoolean(raw.availableForGuestLectures),
    availableForNetworking: normalizeBoolean(raw.availableForNetworking),
    bio: raw.bio ?? "",
    careerJourney: raw.careerJourney ?? "",
    adviceForStudents: raw.adviceForStudents ?? "",
    linkedinUrl: raw.linkedinUrl ?? raw.linkedin_profile ?? "",
    githubUrl: raw.githubUrl ?? "",
    portfolioUrl: raw.portfolioUrl ?? "",
    profilePictureUrl: raw.profilePictureUrl ?? "",
    isVerified: normalizeBoolean(raw.isVerified ?? raw.user?.isVerified),
  };
};

const AlumniDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [mentorshipOnly, setMentorshipOnly] = useState(false);
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<Array<{ id: string; mentorId: string; status: string }>>([]);

  useEffect(() => {
    fetchAlumni();
    fetchMyRequests();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await fetch('/api/alumni-profile/directory');
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data.alumni) ? data.alumni.map(transformAlumniProfile) : [];
        setAlumni(list);
      } else {
        toast.error("Failed to load alumni directory");
      }
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error("Failed to load alumni directory");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      const response = await fetch('/api/mentorship/my-requests-student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('My mentorship requests:', data);
        setMyRequests(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch requests:', response.status);
      }
    } catch (error) {
      console.error('Error fetching mentorship requests:', error);
    }
  };

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = 
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.technicalSkills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      person.expertiseAreas?.some(area => area.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesProgram = selectedProgram === "all" || person.program === selectedProgram;
    const matchesIndustry = selectedIndustry === "all" || person.industry === selectedIndustry;
    const matchesYear = selectedYear === "all" || person.graduationYear?.toString() === selectedYear;
    const matchesMentorship = !mentorshipOnly || person.isMentorAvailable;
    
    return matchesSearch && matchesProgram && matchesIndustry && matchesYear && matchesMentorship;
  });

  const industries = [...new Set(alumni.map(a => a.industry).filter(Boolean))];
  const graduationYears = [...new Set(alumni.map(a => a.graduationYear).filter(Boolean))].sort((a, b) => b - a);
  const programs = Array.from(new Set(alumni.map(a => a.program).filter(Boolean))).sort();
  const programOptions = programs.length ? programs : ["MCA", "MSCIT"];

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-lg text-muted-foreground">Loading alumni directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Alumni Directory
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with our global network of {alumni.length}+ verified alumni from Punjab University CS Department.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Filter Alumni</h3>
            </div>
            <div className="grid md:grid-cols-5 gap-4">
              <Input
                placeholder="Search by name, company, skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2"
              />
              <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  <SelectItem value="MCA">MCA</SelectItem>
                  <SelectItem value="MSCIT">MSCIT</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Graduation Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {graduationYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button
                variant={mentorshipOnly ? "default" : "outline"}
                onClick={() => setMentorshipOnly(!mentorshipOnly)}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                {mentorshipOnly ? "Showing: Mentors Only" : "Show: All Alumni"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Showing {filteredAlumni.length} of {alumni.length} verified alumni
          </p>
          {mentorshipOnly && (
            <Badge variant="secondary" className="gap-1">
              <Heart className="w-3 h-3" />
              {filteredAlumni.length} Mentors Available
            </Badge>
          )}
        </div>

        {/* Alumni Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <Card key={person.id} className="shadow-elegant hover:shadow-glow transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    {person.profilePictureUrl ? (
                      <img 
                        src={person.profilePictureUrl} 
                        alt={person.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(person.name)}
                      </div>
                    )}
                    {person.isVerified && (
                      <div className="absolute -bottom-1 -right-1">
                        <VerifiedBadge size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {person.name}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {person.program} • {person.graduationYear}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span className="font-semibold">{person.currentPosition}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span>{person.currentCompany}</span>
                  </div>
                  {person.companyLocation && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                      <span>{person.companyLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <GraduationCap className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    <span>{person.yearsOfExperience} years experience</span>
                  </div>
                </div>

                {person.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {person.bio}
                  </p>
                )}

                {/* Expertise Areas */}
                {person.expertiseAreas && person.expertiseAreas.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Expertise:</p>
                    <div className="flex flex-wrap gap-1">
                      {person.expertiseAreas.slice(0, 3).map((area, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {person.expertiseAreas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{person.expertiseAreas.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {person.isMentorAvailable && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
                      <Users className="w-3 h-3" />
                      Mentor
                    </Badge>
                  )}
                  {person.availableForJobReferrals && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-1">
                      <Briefcase className="w-3 h-3" />
                      Referrals
                    </Badge>
                  )}
                  {person.availableForGuestLectures && (
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white gap-1">
                      <Award className="w-3 h-3" />
                      Lectures
                    </Badge>
                  )}
                  {person.availableForNetworking && (
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
                      <Sparkles className="w-3 h-3" />
                      Networking
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-1/2"
                    onClick={() => window.location.assign(`/alumni/${person.userId}`)}
                  >
                    View Full Profile
                  </Button>
                  {(() => {
                    const existingRequest = myRequests.find(r => r.mentorId === person.userId);
                    const status = existingRequest?.status;
                    
                    console.log('Checking alumni:', person.name, 'userId:', person.userId, 'existingRequest:', existingRequest);

                    if (status === 'accepted') {
                      return (
                        <Button
                          className="w-1/2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          onClick={() => window.location.assign(`/chat/${existingRequest.id}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                      );
                    }

                    if (status === 'pending') {
                      return (
                        <Button
                          className="w-1/2"
                          disabled
                        >
                          Request Pending
                        </Button>
                      );
                    }

                    if (status === 'completed') {
                      return (
                        <Button
                          className="w-1/2"
                          disabled
                          variant="secondary"
                        >
                          Completed
                        </Button>
                      );
                    }

                    return (
                      <Button
                        className="w-1/2 bg-gradient-hero hover:opacity-90 transition-opacity"
                        onClick={() => window.location.assign('/mentorship')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Request Mentorship
                      </Button>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlumni.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}

        {alumni.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">
              No verified alumni profiles yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Alumni will appear here once their profiles are verified by admins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;

