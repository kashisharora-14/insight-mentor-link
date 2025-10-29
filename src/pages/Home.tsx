
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";
import { 
  GraduationCap, 
  Users, 
  MessageCircle, 
  Calendar,
  Briefcase,
  ArrowRight,
  CheckCircle,
  Target,
  Globe,
  Brain,
  MapPin,
  Clock
} from "lucide-react";

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      const [eventsData, jobsData] = await Promise.all([
        apiClient.get<any[]>('/dcsa/events?status=approved'),
        apiClient.get<any[]>('/jobs')
      ]);
      
      // Get 3 upcoming events
      const upcomingEvents = (eventsData || [])
        .filter(event => event.start_date && new Date(event.start_date) > new Date())
        .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
        .slice(0, 3);
      
      // Get 3 recent jobs
      const recentJobs = (jobsData || [])
        .filter(job => job.status === 'approved')
        .slice(0, 3);
      
      setFeaturedEvents(upcomingEvents);
      setFeaturedJobs(recentJobs);
    } catch (error) {
      console.error('Error loading featured content:', error);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#2563eb', '#f59e0b', '#10b981']
      });
    }, 250);
  };

  const features = [
    {
      icon: Users,
      title: "Alumni Network",
      description: "Connect with DCSA alumni working in top tech companies worldwide."
    },
    {
      icon: MessageCircle,
      title: "AI Mentor Assistant",
      description: "Get instant career guidance from our AI-powered mentorship chatbot."
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Advanced algorithm matches students with the most relevant mentors."
    },
    {
      icon: Calendar,
      title: "Department Events",
      description: "Access exclusive workshops, seminars, and technical events."
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Explore career opportunities posted by alumni and industry partners."
    },
    {
      icon: Brain,
      title: "Career Insights",
      description: "AI-powered analytics providing personalized career guidance."
    }
  ];

  const stats = [
    { number: "500+", label: "DCSA Alumni" },
    { number: "50+", label: "Industry Partners" },
    { number: "20+", label: "Active Mentors" },
    { number: "100%", label: "Student Success" }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with DCSA Branding */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-amber-900 to-red-950">
        <div className="absolute inset-0 bg-[url('/attached_assets/image_1759089891441.png')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* DCSA Logo */}
            <div className="mb-8 flex justify-center">
              <img 
                src="/api/placeholder/200/200" 
                alt="DCSA Logo" 
                className="w-40 h-40 object-contain"
                style={{ 
                  content: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="95" fill="%23f8fafc" stroke="%23334155" stroke-width="2"/><text x="100" y="110" font-family="Arial" font-size="48" font-weight="bold" text-anchor="middle" fill="%23334155">DCSA</text></svg>')` 
                }}
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Department of Computer Science
              <br />
              <span className="text-amber-400">& Applications</span>
            </h1>
            <p className="text-xl text-white/90 mb-3 font-semibold">
              Panjab University, Chandigarh
            </p>
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              Alumni Connect Portal
            </Badge>
            <p className="text-lg text-white/80 mb-8 max-w-3xl mx-auto">
              Bridging the gap between current students and successful alumni. 
              Get mentorship, explore career opportunities, and join our thriving community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-red-900 text-white hover:bg-red-800 shadow-glow"
                  onClick={triggerConfetti}
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/alumni-directory">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-slate-900"
                  onClick={triggerConfetti}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Explore Alumni
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-muted-foreground">
              Join workshops, seminars, and networking events
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event) => (
                <Card key={event.id} className="shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <Badge className="mb-3">{event.event_type || 'Event'}</Badge>
                    <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(event.start_date)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(event.start_date)}
                      </div>
                      {event.venue && (
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.venue}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events at the moment</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link to="/events">
              <Button variant="outline" size="lg">
                View All Events
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Career Opportunities
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore jobs posted by our alumni network
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <Card key={job.id} className="shadow-elegant hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    {job.companyLogo && (
                      <img 
                        src={job.companyLogo} 
                        alt={job.company}
                        className="w-12 h-12 object-contain mb-4"
                      />
                    )}
                    <Badge className="mb-3">{job.jobType || 'Full-time'}</Badge>
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <p className="text-lg font-medium text-muted-foreground mb-3">
                      {job.company}
                    </p>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    {job.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No job openings available at the moment</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link to="/jobs">
              <Button variant="outline" size="lg">
                View All Jobs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to connect, learn, and grow your career
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-gradient-card border-0 shadow-elegant hover:shadow-glow transition-all duration-300 group cursor-pointer"
                onClick={triggerConfetti}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-900/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-red-900" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-900 to-amber-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join the DCSA Alumni Network
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Connect with fellow graduates, find mentors, and accelerate your career growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/alumni-directory">
              <Button 
                size="lg" 
                className="bg-white text-red-900 hover:bg-amber-50"
                onClick={triggerConfetti}
              >
                <Users className="w-5 h-5 mr-2" />
                Explore Alumni
              </Button>
            </Link>
            <Link to="/ai-chat">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={triggerConfetti}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Try AI Mentor
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4 text-white/80">
            <CheckCircle className="w-5 h-5" />
            <span>Free to use</span>
            <CheckCircle className="w-5 h-5" />
            <span>Secure & Private</span>
            <CheckCircle className="w-5 h-5" />
            <span>24/7 Support</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
