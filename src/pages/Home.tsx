import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import confetti from "canvas-confetti";
import { 
  GraduationCap, 
  Users, 
  MessageCircle, 
  Calendar,
  Map,
  ArrowRight,
  CheckCircle,
  Target,
  Globe,
  Brain
} from "lucide-react";

const Home = () => {
  const triggerConfetti = () => {
    // Burst confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // Secondary burst with different colors
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
      title: "Alumni Directory",
      description: "Connect with 10,000+ alumni across all departments and industries worldwide."
    },
    {
      icon: MessageCircle,
      title: "AI Mentor Assistant",
      description: "Get instant career guidance and alumni recommendations from our AI chatbot."
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Advanced algorithm matches students with the most relevant mentors."
    },
    {
      icon: Calendar,
      title: "Events & Workshops",
      description: "Access exclusive events, webinars, and skill-building workshops."
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Interactive map showing alumni presence in 50+ countries worldwide."
    },
    {
      icon: Brain,
      title: "Career Insights",
      description: "AI-powered analytics providing personalized career trend analysis."
    }
  ];

  const stats = [
    { number: "50,000+", label: "Alumni Statewide" },
    { number: "25+", label: "Universities Connected" },
    { number: "100+", label: "Cities Covered" },
    { number: "98%", label: "Data Accuracy" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2086&q=80')`
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🎯 SIH 2025 Project
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Central Punjab Alumni
              <br />
              <span className="text-accent">Data Management System</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              SIH 2025 - Unified alumni database and mentorship platform for all Punjab universities, 
              connecting students with industry leaders across the state for career guidance and professional growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-orange-500 text-white hover:bg-orange-600 shadow-glow"
                  onClick={triggerConfetti}
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/alumni">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-white/10 backdrop-blur-sm"
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

      {/* Central System Overview Section */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Central Alumni Data Management - Punjab State
            </h2>
            <p className="text-xl text-muted-foreground">
              A unified platform connecting alumni across all Punjab universities and institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="relative overflow-hidden rounded-xl shadow-elegant group">
              <img 
                src="/attached_assets/image_1759155346714.png"
                alt="University Library Study Area"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-semibold">Academic Excellence</h3>
                <p className="text-white/80">Modern Study Spaces</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl shadow-elegant group">
              <img 
                src="/attached_assets/image_1759089891441.png"
                alt="Panjab University Campus"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-semibold">Panjab University</h3>
                <p className="text-white/80">Historic Campus</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-xl shadow-elegant group">
              <img 
                src="/attached_assets/image_1759155272244.png"
                alt="Alumni Success Stories"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-semibold">Alumni Success</h3>
                <p className="text-white/80">Global Leaders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
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

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Career Growth
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines AI technology with human connections to provide 
              comprehensive career development support.
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
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-8 h-8 text-primary" />
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

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to connect with mentors and grow your career
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Browse & Filter</h3>
              <p className="text-muted-foreground">
                Explore our alumni directory and filter by department, profession, or location to find the perfect mentor.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Send Request</h3>
              <p className="text-muted-foreground">
                Send a personalized mentorship request with your goals and preferred meeting times.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect & Learn</h3>
              <p className="text-muted-foreground">
                Once accepted, connect via video calls and build lasting professional relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Connect with Your Future?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of students and alumni who are already building meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/alumni">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
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
                className="border-white/30 text-white hover:bg-white/10"
                onClick={triggerConfetti}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Try AI Mentor
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-4 text-white/60">
            <CheckCircle className="w-5 h-5" />
            <span>Free to use</span>
            <CheckCircle className="w-5 h-5" />
            <span>Secure & Private</span>
            <CheckCircle className="w-5 h-5" />
            <span>24/7 AI Support</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;