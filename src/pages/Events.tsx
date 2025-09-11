import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { events, departments } from "@/data/mockData";
import { Calendar, MapPin, Clock, ExternalLink, Filter } from "lucide-react";

const Events = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

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
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                  onClick={() => window.open(event.registrationLink, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Register Now
                </Button>
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