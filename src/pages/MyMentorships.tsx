import { useEffect, useState } from 'react';
import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MentorItem {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
}

interface StudentRequestItem {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  subject: string;
  message: string;
  goals: string;
  preferredTime: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: string;
}

export default function MyMentorships() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [requests, setRequests] = useState<StudentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeader = { Authorization: `Bearer ${localStorage.getItem('authToken')}` };

  const load = async () => {
    setLoading(true);
    try {
      const [mRes, rRes] = await Promise.all([
        fetch('/api/mentorship/my-mentors', { headers: authHeader }),
        fetch('/api/mentorship/my-requests-student', { headers: authHeader }),
      ]);
      const m = await mRes.json().catch(() => []);
      const r = await rRes.json().catch(() => []);
      setMentors(Array.isArray(m) ? m : []);
      setRequests(Array.isArray(r) ? r : []);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load mentorships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Deduplication: pick one request per mentorId (prefer accepted, then pending, then most recent)
  const requestsUniqueByMentor = (() => {
    const priority: Record<StudentRequestItem['status'], number> = {
      accepted: 3,
      pending: 2,
      completed: 1,
      declined: 0,
    };
    const best = new Map<string, StudentRequestItem>();
    for (const r of requests) {
      const key = r.mentorId || '';
      const prev = best.get(key);
      if (!prev) { best.set(key, r); continue; }
      const pPrev = priority[prev.status];
      const pCur = priority[r.status];
      if (pCur > pPrev) { best.set(key, r); continue; }
      if (pCur === pPrev) {
        const tPrev = new Date(prev.createdAt).getTime();
        const tCur = new Date(r.createdAt).getTime();
        if (tCur > tPrev) best.set(key, r);
      }
    }
    return Array.from(best.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  })();

  const requestsSorted = [...requests]
    .filter(r => r.status !== 'declined')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Mentorships</h1>
          <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            {mentors.length === 0 && <div className="text-sm text-muted-foreground">No accepted mentors yet.</div>}
            <div className="grid gap-3">
              {mentors.map(m => (
                <div key={m.id} className="flex items-center justify-between border rounded p-3 bg-muted/20">
                  <div>
                    <div className="font-medium">{m.mentorName || 'Mentor'}</div>
                    <div className="text-xs text-muted-foreground">{m.mentorEmail}</div>
                  </div>
                  <Button onClick={() => navigate(`/chat/${m.id}`)}>Open Chat</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requestsSorted.length === 0 && <div className="text-sm text-muted-foreground">You haven't sent any requests yet.</div>}
            <div className="grid gap-3">
              {requestsSorted.map(r => (
                <div key={r.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium">{r.mentorName || 'Mentor'}</div>
                    <div className="text-xs text-muted-foreground">{r.mentorEmail}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Status: {r.status} • {new Date(r.createdAt).toLocaleString()}</div>
                    <div className="text-xs mt-1"><span className="text-muted-foreground">Subject:</span> {r.subject}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => navigate(`/alumni/${r.mentorId}`)}>
                      View Profile
                    </Button>
                    {r.status === 'accepted' && (
                      <Button onClick={() => navigate(`/chat/${r.id}`)}>Open Chat</Button>
                    )}
                    {r.status === 'pending' && (
                      <Button disabled>Waiting...</Button>
                    )}
                    {r.status !== 'accepted' && r.status !== 'pending' && (
                      <Button variant="outline" disabled>{r.status}</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
