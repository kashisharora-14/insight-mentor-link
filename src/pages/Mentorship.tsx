import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageCircle, Calendar, Plus, Search, User, Building, GraduationCap } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  user_id: string;
  name: string;
  role: string;
  graduation_year?: number;
  department?: string;
  current_job?: string;
  company?: string;
  skills?: string[];
  bio?: string;
  is_mentor_available: boolean;
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

interface Message {
  id: string;
  mentorship_request_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: any;
}

const Mentorship = () => {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [myRequests, setMyRequests] = useState<MentorshipRequest[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [activeTab, setActiveTab] = useState<'find-mentors' | 'my-requests' | 'my-mentorships' | 'incoming-requests'>('find-mentors');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Profile | null>(null);
  const [newMessage, setNewMessage] = useState<{ [key: string]: string }>({});
  const [requestForm, setRequestForm] = useState({
    field_of_interest: '',
    description: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMentors();
      fetchMyRequests();
      // Set default tab based on user role
      if (user.role === 'alumni') {
        setActiveTab('incoming-requests');
      } else {
        setActiveTab('find-mentors');
      }
    }
  }, [user]);

  const fetchMentors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'alumni')
      .eq('is_mentor_available', true)
      .eq('is_verified', true);

    if (error) {
      console.error('Error fetching mentors:', error);
    } else {
      setMentors(data || []);
    }
  };

  const fetchMyRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mentorship_requests')
      .select('*')
      .or(`student_id.eq.${user.id},mentor_id.eq.${user.id}`);

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      // Fetch profile details separately
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const [mentorRes, studentRes] = await Promise.all([
            request.mentor_id ? supabase.from('profiles').select('name, current_job, company, skills').eq('user_id', request.mentor_id).single() : Promise.resolve({ data: null }),
            supabase.from('profiles').select('name, department, graduation_year').eq('user_id', request.student_id).single()
          ]);
          
          return {
            ...request,
            mentor_profile: mentorRes.data,
            student_profile: studentRes.data
          };
        })
      );
      
      setMyRequests(requestsWithProfiles);
      // Fetch messages for approved requests
      requestsWithProfiles.forEach(request => {
        if (request.status === 'approved') {
          fetchMessages(request.id);
        }
      });
    }
  };

  const fetchMessages = async (requestId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('mentorship_request_id', requestId)
      .order('created_at');

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      // Fetch sender profiles separately
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const { data: senderData } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('user_id', message.sender_id)
            .single();
          
          return {
            ...message,
            sender_profile: senderData
          };
        })
      );
      
      setMessages(prev => ({ ...prev, [requestId]: messagesWithProfiles }));
    }
  };

  const handleRequestMentorship = async () => {
    if (!user || !selectedMentor) return;

    const { error } = await supabase
      .from('mentorship_requests')
      .insert({
        student_id: user.id,
        mentor_id: selectedMentor.user_id,
        field_of_interest: requestForm.field_of_interest,
        description: requestForm.description,
        status: 'pending'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send mentorship request.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Mentorship request sent successfully!",
      });
      setShowRequestForm(false);
      setSelectedMentor(null);
      setRequestForm({ field_of_interest: '', description: '' });
      fetchMyRequests();
    }
  };

  const handleStatusUpdate = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('mentorship_requests')
      .update({ status })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Request ${status} successfully!`,
      });
      fetchMyRequests();
    }
  };

  const sendMessage = async (requestId: string) => {
    if (!user || !newMessage[requestId]?.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        mentorship_request_id: requestId,
        sender_id: user.id,
        content: newMessage[requestId]
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } else {
      setNewMessage(prev => ({ ...prev, [requestId]: '' }));
      fetchMessages(requestId);
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.current_job?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Mentorship Program</h1>
          <p className="text-xl text-muted-foreground">
            Connect with experienced alumni for guidance and career development
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b">
          {user?.role === 'student' && (
            <Button
              variant={activeTab === 'find-mentors' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('find-mentors')}
              className="mb-2"
            >
              <Search className="w-4 h-4 mr-2" />
              Find Mentors
            </Button>
          )}
          {user?.role === 'alumni' && (
            <Button
              variant={activeTab === 'incoming-requests' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('incoming-requests')}
              className="mb-2"
            >
              <Users className="w-4 h-4 mr-2" />
              Incoming Requests
            </Button>
          )}
          <Button
            variant={activeTab === 'my-requests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('my-requests')}
            className="mb-2"
          >
            <Users className="w-4 h-4 mr-2" />
            {user?.role === 'alumni' ? 'My Accepted Students' : 'My Requests'}
          </Button>
          <Button
            variant={activeTab === 'my-mentorships' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('my-mentorships')}
            className="mb-2"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Active Mentorships
          </Button>
        </div>

        {/* Incoming Requests Tab (Alumni only) */}
        {activeTab === 'incoming-requests' && user?.role === 'alumni' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Mentorship Requests</h2>
            {myRequests.filter(r => r.mentor_id === user?.id && r.status === 'pending').map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.field_of_interest}</CardTitle>
                      <CardDescription>
                        Request from: {request.student_profile?.name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.description}</p>
                  <div className="text-sm text-muted-foreground mb-4">
                    Student: {request.student_profile?.name} • {request.student_profile?.department} • Class of {request.student_profile?.graduation_year}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleStatusUpdate(request.id, 'approved')}>
                      Accept Request
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusUpdate(request.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {myRequests.filter(r => r.mentor_id === user?.id && r.status === 'pending').length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending mentorship requests.</p>
              </div>
            )}
          </div>
        )}

        {/* Find Mentors Tab (Students only) */}
        {activeTab === 'find-mentors' && user?.role === 'student' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search mentors by name, job, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Mentors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.user_id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building className="w-3 h-3" />
                          {mentor.current_job} at {mentor.company}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="w-3 h-3" />
                        {mentor.department} • Class of {mentor.graduation_year}
                      </div>
                      
                      {mentor.skills && mentor.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {mentor.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {mentor.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {mentor.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {mentor.bio}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      className="w-full mt-4"
                      onClick={() => {
                        setSelectedMentor(mentor);
                        setShowRequestForm(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Request Mentorship
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No mentors found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-4">
            {myRequests.filter(r => r.student_id === user?.id).map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.field_of_interest}</CardTitle>
                      <CardDescription>
                        {request.mentor_profile ? 
                          `Mentor: ${request.mentor_profile.name}` : 
                          'Waiting for mentor assignment'
                        }
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested on {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Mentorships Tab */}
        {activeTab === 'my-mentorships' && (
          <div className="space-y-6">
            {myRequests.filter(r => r.status === 'approved').map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {request.field_of_interest}
                  </CardTitle>
                  <CardDescription>
                    {request.student_id === user?.id ? 
                      `Mentor: ${request.mentor_profile?.name}` :
                      `Student: ${request.student_profile?.name}`
                    }
                  </CardDescription>
                  {request.mentor_id === user?.id && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleStatusUpdate(request.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {/* Messages */}
                  <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                    {messages[request.id]?.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-xs p-3 rounded-lg ${
                            message.sender_id === user?.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage[request.id] || ''}
                      onChange={(e) => setNewMessage(prev => ({ 
                        ...prev, 
                        [request.id]: e.target.value 
                      }))}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(request.id)}
                    />
                    <Button onClick={() => sendMessage(request.id)}>Send</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {myRequests.filter(r => r.status === 'approved').length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active mentorships yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Request Form Modal */}
        {showRequestForm && selectedMentor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Request Mentorship</CardTitle>
                <CardDescription>
                  Send a mentorship request to {selectedMentor.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="field_of_interest">Field of Interest</Label>
                  <Input
                    id="field_of_interest"
                    value={requestForm.field_of_interest}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      field_of_interest: e.target.value
                    })}
                    placeholder="e.g., Machine Learning, Product Management"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({
                      ...requestForm,
                      description: e.target.value
                    })}
                    placeholder="Describe your goals and what you hope to learn..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRequestMentorship} className="flex-1">
                    Send Request
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRequestForm(false);
                      setSelectedMentor(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentorship;