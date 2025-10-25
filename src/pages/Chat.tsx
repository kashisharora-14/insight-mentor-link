import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  mentorshipRequestId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface MessagesResponse {
  messages: ChatMessage[];
  status: string;
  chatClosedReason?: string | null;
  chatClosedAt?: string | null;
  participantRole?: 'student' | 'mentor';
}

interface Participant {
  id: string;
  name: string;
  profilePictureUrl?: string;
  department?: string;
  profession?: string;
  role: 'student' | 'alumni';
}

export default function Chat() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [chatClosedReason, setChatClosedReason] = useState<string | null>(null);
  const [chatClosedAt, setChatClosedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participantRole, setParticipantRole] = useState<'student' | 'mentor' | undefined>(undefined);
  const pollRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [participants, setParticipants] = useState<{ student?: Participant; mentor?: Participant }>({});

  const fetchParticipants = async () => {
    if (!requestId) return;
    try {
      const resp = await fetch(`/api/mentorship/${requestId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      
      // Fetch student profile
      if (data.studentId) {
        const studentResp = await fetch(`/api/student-profile/${data.studentId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (studentResp.ok) {
          const studentData = await studentResp.json();
          setParticipants(prev => ({
            ...prev,
            student: {
              id: data.studentId,
              name: studentData.profile?.name || 'Student',
              profilePictureUrl: studentData.profile?.profilePictureUrl,
              department: studentData.profile?.department,
              role: 'student'
            }
          }));
        }
      }

      // Fetch alumni profile
      if (data.mentorId) {
        const alumniResp = await fetch(`/api/alumni/${data.mentorId}/profile`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (alumniResp.ok) {
          const alumniData = await alumniResp.json();
          setParticipants(prev => ({
            ...prev,
            mentor: {
              id: data.mentorId,
              name: alumniData.name || 'Alumni',
              profilePictureUrl: alumniData.profileImage,
              profession: alumniData.profession,
              department: alumniData.department,
              role: 'alumni'
            }
          }));
        }
      }
    } catch (e) {
      console.error('Failed to fetch participants:', e);
    }
  };

  const fetchMessages = async () => {
    if (!requestId) return;
    try {
      const resp = await fetch(`/api/chat/${requestId}/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
      });
      if (!resp.ok) throw new Error('Failed to fetch messages');
      const data: MessagesResponse = await resp.json();
      setMessages(data.messages || []);
      setStatus(data.status);
      setChatClosedReason(data.chatClosedReason || null);
      setChatClosedAt(data.chatClosedAt || null);
      setParticipantRole(data.participantRole);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchParticipants();
    fetchMessages();
    // simple polling
    pollRef.current = window.setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // When chat closes or mentorship completes, prompt student for a review if not already submitted
  useEffect(() => {
    const maybePromptReview = async () => {
      if (!requestId) return;
      const isStudent = (user?.role || '').toLowerCase() === 'student';
      if (!isStudent) return;
      if (!(status === 'completed' || !!chatClosedAt)) return;
      try {
        const resp = await fetch(`/api/mentorship/${requestId}/reviews`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        const mine = (data.reviews || []).some((r: any) => r.reviewerId === user?.id);
        setAlreadyReviewed(mine);
        if (!mine) setReviewOpen(true);
      } catch {}
    };
    maybePromptReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, chatClosedAt, requestId, user?.id, user?.role]);

  const sendMessage = async () => {
    if (!requestId) return;
    if (!input.trim()) return;
    if (chatClosedAt) {
      toast.info('Chat is closed.');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ mentorshipRequestId: requestId, text: input.trim() }),
      });
      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to send');
      }
      setInput('');
      await fetchMessages();
    } catch (e: any) {
      toast.error(e.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getParticipantInfo = (senderId: string) => {
    if (senderId === participants.student?.id) return participants.student;
    if (senderId === participants.mentor?.id) return participants.mentor;
    return null;
  };

  const otherParticipant = participantRole === 'student' ? participants.mentor : participants.student;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">Back</Button>
        <Card>
          <CardHeader className="border-b">
            {/* Chat Header with Participant Info */}
            {otherParticipant && (
              <div className="flex items-center gap-3 mb-2">
                {otherParticipant.profilePictureUrl ? (
                  <img 
                    src={otherParticipant.profilePictureUrl} 
                    alt={otherParticipant.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/80 to-primary rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {otherParticipant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <CardTitle className="text-lg">{otherParticipant.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {otherParticipant.profession || otherParticipant.department}
                  </p>
                </div>
              </div>
            )}
            {!otherParticipant && <CardTitle>Mentorship Chat</CardTitle>}
            {status !== 'accepted' && !chatClosedAt && (
              <p className="text-sm text-muted-foreground">Chat opens after the mentorship request is accepted.</p>
            )}
            {chatClosedAt && (
              <div className="text-sm text-red-600">
                Chat closed{chatClosedReason ? `: ${chatClosedReason}` : ''} {chatClosedAt ? `on ${new Date(chatClosedAt).toLocaleString()}` : ''}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-2">
              {!chatClosedAt && participantRole === 'mentor' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!requestId) return;
                          const reason = window.prompt('Please provide a reason to close chat (required):');
                          if (!reason || !reason.trim()) {
                            toast.error('Reason is required');
                            return;
                          }
                          try {
                            const resp = await fetch(`/api/mentorship/${requestId}/close-chat`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                              },
                              body: JSON.stringify({ reason: reason.trim() }),
                            });
                            if (!resp.ok) {
                              const e = await resp.json().catch(() => ({}));
                              throw new Error(e.error || 'Failed to close chat');
                            }
                            toast.success('Chat closed');
                            fetchMessages();
                          } catch (e: any) {
                            toast.error(e.message || 'Failed to close chat');
                          }
                        }}
                      >
                        Close Chat
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Closing chat blocks further messages for this mentorship.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="h-[60vh] overflow-y-auto border rounded p-4 space-y-3 bg-muted/20">
              {messages.map((m) => {
                const isMine = m.senderId === (user?.id || '');
                const participant = getParticipantInfo(m.senderId);
                return (
                  <div key={m.id} className={`flex items-start gap-2 ${isMine ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                    {/* Profile Picture */}
                    {participant?.profilePictureUrl ? (
                      <img 
                        src={participant.profilePictureUrl} 
                        alt={participant.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-border"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-xs ${
                        isMine ? 'bg-primary' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {participant?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`${isMine ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm`}>
                      <div>{m.content}</div>
                      <div className={`text-[10px] opacity-70 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="chat-input" className="sr-only">Message</Label>
                <Input
                  id="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={chatClosedAt ? 'Chat closed' : status === 'accepted' ? 'Type a message...' : 'Waiting for acceptance...'}
                  disabled={status !== 'accepted' || !!chatClosedAt}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <Button onClick={sendMessage} disabled={status !== 'accepted' || loading || !!chatClosedAt}>Send</Button>
            </div>

            {/* Review Dialog for students */}
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Rate your mentorship</DialogTitle>
                  <DialogDescription>
                    Please leave a rating for your mentor (1–5) and an optional comment.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input id="rating" type="number" min={1} max={5} value={rating}
                      onChange={(e) => setRating(Math.max(1, Math.min(5, Number(e.target.value) || 1)))} />
                  </div>
                  <div>
                    <Label htmlFor="review-comment">Comment (optional)</Label>
                    <Textarea id="review-comment" rows={3} value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)} />
                  </div>
                  <Button
                    disabled={submittingReview}
                    onClick={async () => {
                      if (!requestId) return;
                      try {
                        setSubmittingReview(true);
                        const resp = await fetch(`/api/mentorship/${requestId}/review`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                          },
                          body: JSON.stringify({ rating, comment: reviewComment || undefined }),
                        });
                        if (!resp.ok) {
                          const e = await resp.json().catch(() => ({}));
                          throw new Error(e.error || 'Failed to submit review');
                        }
                        toast.success('Thanks for your review!');
                        setReviewOpen(false);
                        setAlreadyReviewed(true);
                      } catch (err: any) {
                        toast.error(err.message || 'Could not submit review');
                      } finally {
                        setSubmittingReview(false);
                      }
                    }}
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
