
import { useState } from "react";
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
import { alumni, departments } from "@/data/mockData";
import { MapPin, Briefcase, MessageCircle, Filter, User, Building, GraduationCap, Star, Send } from "lucide-react";

const Mentorship = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [mentorshipRequest, setMentorshipRequest] = useState({
    subject: "",
    message: "",
    preferredTime: "",
    goals: ""
  });

  // Filter mentors who are available for mentorship
  const availableMentors = alumni.filter(person => person.isAvailableForMentorship);

  const filteredMentors = availableMentors.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = selectedDepartment === "all" || person.department === selectedDepartment;
    const matchesLocation = selectedLocation === "all" || person.location.includes(selectedLocation);
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const locations = [...new Set(alumni.map(a => a.location.split(', ')[1]))];

  const handleRequestMentorship = (mentor: any) => {
    setSelectedMentor(mentor);
  };

  const submitMentorshipRequest = () => {
    // In a real app, this would send the request to the backend
    console.log("Mentorship request submitted:", {
      mentor: selectedMentor,
      request: mentorshipRequest
    });
    
    // Reset form and close dialog
    setMentorshipRequest({
      subject: "",
      message: "",
      preferredTime: "",
      goals: ""
    });
    setSelectedMentor(null);
    
    // Show success message (you could use a toast here)
    alert("Mentorship request sent successfully! The mentor will review and respond to your request.");
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
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
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
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-muted-foreground">Support Available</div>
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
            <Card key={mentor.id} className="shadow-elegant hover:shadow-glow transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {mentor.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {mentor.department}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Class of {mentor.batchYear}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 text-primary" />
                    <span className="line-clamp-1">{mentor.profession}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{mentor.location}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mentor.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {mentor.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {mentor.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9 (23 reviews)</span>
                  <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-800">
                    Available
                  </Badge>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-hero hover:opacity-90 transition-opacity"
                      onClick={() => handleRequestMentorship(mentor)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Request Mentorship
                    </Button>
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
                      <Button onClick={submitMentorshipRequest} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Request
                      </Button>
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
