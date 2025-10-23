import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Building, Calendar, MapPin, Linkedin, Star, Briefcase, GraduationCap, Phone } from 'lucide-react';

interface PublicProfile {
  user_id: string;
  name: string;
  email: string;
  program?: string;
  department?: string;
  graduation_year?: number;
  graduationYear?: number;
  current_job?: string;
  current_position?: string;
  currentPosition?: string;
  company?: string;
  currentCompany?: string;
  company_location?: string;
  companyLocation?: string;
  skills?: string[];
  technicalSkills?: string[] | string;
  expertiseAreas?: string[] | string;
  linkedin_profile?: string;
  linkedinUrl?: string;
  bio?: string;
  is_mentor_available?: boolean;
  isMentorAvailable?: boolean;
  phoneNumber?: string;
  city?: string;
  state?: string;
  country?: string;
  mentorshipAreas?: string[] | string;
}

type MyRequest = {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
};

const normalizeList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item : String(item)))
      .map(item => item.trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
};

export default function PublicAlumniProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [reviews, setReviews] = useState<Array<{ reviewId: string; rating: number; comment?: string; createdAt: string; studentName: string }>>([]);
  const [capacity, setCapacity] = useState<{ accepted: number; full: boolean } | null>(null);
  const [myRequest, setMyRequest] = useState<MyRequest | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const run = async () => {
      try {
        // Public profile
        const p = await fetch(`/api/alumni-profile/profile/${id}`, { headers });
        if (p.ok) {
          const j = await p.json();
          setProfile(j.profile || null);
        }
        // Ratings + latest reviews
        const r = await fetch(`/api/mentorship/mentor/${id}/reviews`, { headers });
        if (r.ok) {
          const j = await r.json();
          setAvg(Number(j.average || 0));
          setCount(Number(j.count || 0));
          setReviews(Array.isArray(j.reviews) ? j.reviews : []);
        }
        // Capacity
        const c = await fetch(`/api/mentorship/mentor/${id}/capacity`, { headers });
        if (c.ok) {
          const j = await c.json();
          setCapacity({ accepted: Number(j.accepted || 0), full: Boolean(j.full) });
        }
        const req = await fetch('/api/mentorship/my-requests-student', { headers });
        if (req.ok) {
          const items: Array<{ id: string; mentorId: string; status: MyRequest['status'] }> = await req.json();
          const match = items.find(r => r.mentorId === id);
          setMyRequest(match ? { id: match.id, status: match.status } : null);
        }
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const stars = useMemo(() => {
    const full = Math.round(avg || 0);
    return new Array(5).fill(0).map((_, i) => i < full);
  }, [avg]);

  const position = useMemo(() => {
    if (!profile) return '';
    return profile.current_job || profile.current_position || profile.currentPosition || '';
  }, [profile]);

  const company = useMemo(() => {
    if (!profile) return '';
    return profile.company || profile.currentCompany || '';
  }, [profile]);

  const location = useMemo(() => {
    if (!profile) return '';
    const pieces = [
      profile.company_location,
      profile.companyLocation,
      profile.city,
      profile.state,
      profile.country,
    ]
      .map(part => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean);
    const unique = Array.from(new Set(pieces));
    return unique.join(', ');
  }, [profile]);

  const programName = useMemo(() => {
    if (!profile) return '';
    return profile.program || profile.department || '';
  }, [profile]);

  const gradYear = useMemo(() => {
    if (!profile) return '';
    return String(profile.graduation_year || profile.graduationYear || '').trim();
  }, [profile]);

  const displayBio = useMemo(() => {
    if (!profile) return '';
    return profile.bio || '';
  }, [profile]);

  const skillsList = useMemo(() => {
    if (!profile) return [];
    const combined = normalizeList(profile.skills);
    if (combined.length > 0) return combined;
    const tech = normalizeList(profile.technicalSkills);
    if (tech.length > 0) return tech;
    return normalizeList(profile.expertiseAreas);
  }, [profile]);

  const mentorshipList = useMemo(() => {
    if (!profile) return [];
    return normalizeList(profile.mentorshipAreas);
  }, [profile]);

  const isMentorAvailable = useMemo(() => {
    if (!profile) return false;
    return Boolean(profile.is_mentor_available ?? profile.isMentorAvailable);
  }, [profile]);

  const linkedinUrl = useMemo(() => {
    if (!profile) return '';
    return profile.linkedin_profile || profile.linkedinUrl || '';
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-56 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-muted-foreground">Profile not found.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">{profile.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    {position && (
                      <span className="inline-flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {position}
                      </span>
                    )}
                    {company && (
                      <span className="inline-flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {company}
                      </span>
                    )}
                    {location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {capacity && (
                    <Badge variant={capacity.full ? 'destructive' : 'secondary'}>
                      {capacity.full ? 'Full (5/5)' : `Capacity ${capacity.accepted}/5`}
                    </Badge>
                  )}
                  {programName && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {programName}
                    </Badge>
                  )}
                  {gradYear && (
                    <Badge variant="outline">Class of {gradYear}</Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.email && (
                  <span className="inline-flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium text-foreground/80">{profile.email}</span>
                  </span>
                )}
                {profile.phoneNumber && (
                  <span className="inline-flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phoneNumber}</span>
                  </span>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {stars.map((on, i) => (
                  <Star key={i} className={`w-4 h-4 ${on ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                ))}
                <span className="font-medium text-foreground">{avg.toFixed(1)}</span>
                <span className="text-muted-foreground">({count} reviews)</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {displayBio && (
              <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{displayBio}</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mentorship Focus</h3>
                  {mentorshipList.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mentorshipList.map((area, idx) => (
                        <Badge key={idx} variant="outline" className="bg-background/50">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Mentorship areas not specified.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills & Expertise</h3>
                  {skillsList.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skillsList.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-primary/10 text-primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No skills listed.</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next Steps</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Connect with {profile.name.split(' ')[0] || 'this mentor'} to discuss goals, share resources, and collaborate on your mentorship journey.
                  </p>
                  <div className="mt-4">
                    {(() => {
                      if (myRequest?.status === 'accepted') {
                        return (
                          <Button className="w-full" onClick={() => navigate(`/chat/${myRequest.id}`)}>
                            Open Chat
                          </Button>
                        );
                      }
                      if (myRequest?.status === 'pending') {
                        return (
                          <Button className="w-full" variant="outline" disabled>
                            Request Pending
                          </Button>
                        );
                      }
                      return (
                        <Button className="w-full" onClick={() => navigate('/mentorship')} disabled={capacity?.full}>
                          Request Mentorship
                        </Button>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Available as mentor: {isMentorAvailable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reviews yet.</div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.reviewId} className="rounded border border-border/50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">{r.studentName}</div>
                      <div className="flex items-center gap-1">
                        {new Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <div className="mt-1 text-sm text-foreground/90">{r.comment}</div>}
                    <div className="mt-1 text-[11px] text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
