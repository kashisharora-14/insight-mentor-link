import { useState, useEffect } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, MapPin, Clock, ExternalLink, Filter, Users, CheckCircle } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location?: string;
  department?: string;
  image_url?: string;
  registration_link?: string;
  is_active: boolean;
  max_attendees?: number;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
}

const Events = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date_time');

    if (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive",
      });
    } else {
      setEvents(data || []);
      // Extract unique departments
      const uniqueDepts = [...new Set(data?.map(e => e.department).filter(Boolean))] as string[];
      setDepartments(uniqueDepts);
    }
    setLoading(false);
  };

  const fetchRegistrations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching registrations:', error);
    } else {
      setRegistrations(data || []);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to register for events.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Already Registered",
          description: "You are already registered for this event.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register for the event. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event!",
      });
      fetchRegistrations();
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unregister from the event.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Unregistered",
        description: "You have been unregistered from the event.",
      });
      fetchRegistrations();
    }
  };

  const isRegistered = (eventId: string) => {
    return registrations.some(reg => reg.event_id === eventId);
  };

  const filteredEvents = events.filter(event => 
    selectedDepartment === "all" || event.department === selectedDepartment
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            University Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover upcoming events, workshops, and networking opportunities across all departments.
          </p>
        </div>

        {/* Filter */}
        <Card className="mb-8 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Filter Events</h3>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredEvents.length} upcoming events
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="shadow-elegant hover:shadow-glow transition-all duration-300 group overflow-hidden">
              <div className="aspect-video bg-gradient-card relative">
                <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <Badge className="absolute top-4 left-4 bg-white/20 text-white border-white/30">
                  {event.department}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{formatDate(event.date_time)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{formatTime(event.date_time)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.max_attendees && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span>Max {event.max_attendees} attendees</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {isRegistered(event.id) ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Registered
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleUnregister(event.id)}
                      >
                        Unregister
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                      onClick={() => handleRegister(event.id)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Register Now
                    </Button>
                  )}
                  
                  {event.registration_link && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(event.registration_link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      External Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No events found for the selected department.
            </p>
          </div>
        )}

        {/* Upcoming Events Banner */}
        <Card className="mt-12 bg-gradient-card border-0 shadow-elegant">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Don't Miss Out!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Stay updated with the latest events and opportunities. Join our mailing list to receive notifications about upcoming workshops, seminars, and networking events.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              Subscribe to Updates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Events;