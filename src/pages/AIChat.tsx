import { useState, useEffect } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { chatMessages as initialMessages, alumni } from "@/data/mockData";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Users, 
  Briefcase,
  TrendingUp,
  Calendar,
  GraduationCap,
  Shield
} from "lucide-react";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with personalized greeting
  useEffect(() => {
    if (user) {
      const personalizedGreeting: Message = {
        id: 1,
        type: "bot",
        content: getPersonalizedGreeting(),
        timestamp: new Date().toISOString(),
        suggestions: getPersonalizedSuggestions()
      };
      setMessages([personalizedGreeting]);
    } else {
      setMessages(initialMessages as Message[]);
    }
  }, [user]);

  const getPersonalizedGreeting = () => {
    if (!user) return "Hello! I'm your AI Mentor Assistant. How can I help you today?";

    const roleName = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    switch (user.role) {
      case 'student':
        return `Hello ${user.name}! 👋 Welcome to your AI Mentor Assistant!

As a ${user.department} student (Class of ${user.batchYear}), I'm here to help you:

🎯 **Connect with Alumni** in your field and interests
📚 **Get Career Guidance** tailored to ${user.department} opportunities  
🌟 **Develop Skills** that industry professionals recommend
📅 **Find Events** relevant to your department and career goals
💡 **Prepare for Interviews** and build your professional profile

What would you like to explore today?`;

      case 'alumni':
        return `Welcome back, ${user.name}! 👋 

As a ${user.department} alumnus (${user.batchYear}) working in ${user.profession}, I can help you:

🤝 **Manage Mentorship** - Review incoming requests and connection opportunities
📈 **Share Insights** about industry trends in ${user.profession}
🎓 **Give Back** to current students in ${user.department}
🌐 **Expand Network** with fellow alumni and professionals
📊 **Track Impact** of your mentoring activities

How can I assist you today?`;

      default:
        return `Hello ${user.name}! How can I assist you today?`;
    }
    }
  };

  const getPersonalizedSuggestions = () => {
    if (!user) return ["Tell me about AlumniConnect", "How does this work?"];

    switch (user.role) {
      case 'student':
        return [
          `Find ${user.department} alumni mentors`,
          "What skills are in demand?",
          "Help me write a mentorship request",
          "Show me upcoming events"
        ];
      case 'alumni':
        return [
          "How to be an effective mentor?",
          `${user.profession} industry trends`,
          "Manage my mentorship requests",
          "Connect with fellow alumni"
        ];
      default:
        return ["How can you help me?"];
    }
  };

  const getQuickActions = () => {
    const baseActions = {
      student: [
        {
          icon: Users,
          title: "Find Alumni",
          description: `Connect with ${user?.department} alumni`,
          prompt: `I'm a ${user?.department} student looking for alumni mentors in my field. Can you help me find relevant connections?`
        },
        {
          icon: Briefcase,
          title: "Career Advice",
          description: "Get personalized guidance",
          prompt: `As a ${user?.department} student graduating in ${user?.batchYear}, what career paths should I consider?`
        },
        {
          icon: TrendingUp,
          title: "Skill Development",
          description: "What skills to focus on",
          prompt: `What technical and soft skills should I develop as a ${user?.department} student?`
        },
        {
          icon: Calendar,
          title: "Events for Me",
          description: "Department-specific events",
          prompt: `Show me upcoming events relevant to ${user?.department} students.`
        }
      ],
      alumni: [
        {
          icon: Users,
          title: "Mentorship Guide",
          description: "How to mentor effectively",
          prompt: `As a ${user?.profession} professional, how can I provide valuable mentorship to students?`
        },
        {
          icon: TrendingUp,
          title: "Industry Insights",
          description: "Share your expertise",
          prompt: `What are the current trends and opportunities in ${user?.profession}?`
        },
        {
          icon: GraduationCap,
          title: "Student Requests",
          description: "Review mentorship requests",
          prompt: "Show me tips for reviewing and responding to student mentorship requests."
        },
        {
          icon: Calendar,
          title: "Alumni Events",
          description: "Network and give back",
          prompt: "What alumni networking events and giving-back opportunities are available?"
        }
      ],
      admin: [
        {
          icon: Users,
          title: "User Analytics",
          description: "Platform engagement metrics",
          prompt: "Show me current user engagement statistics and platform analytics."
        },
        {
          icon: Calendar,
          title: "Event Management",
          description: "Organize university events",
          prompt: "Help me plan and coordinate an upcoming university event."
        },
        {
          icon: Shield,
          title: "Platform Health",
          description: "System status & security",
          prompt: "Give me an overview of platform health, security status, and any issues."
        },
        {
          icon: TrendingUp,
          title: "Growth Strategy",
          description: "Platform improvement tips",
          prompt: "What recommendations do you have for improving platform engagement and growth?"
        }
      ]
    };

    return user ? baseActions[user.role] || baseActions.student : baseActions.student;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: "user",
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate personalized AI response
    setTimeout(() => {
      let botResponse = "";
      let suggestions: string[] = [];

      const userRole = user?.role || 'student';
      const userDept = user?.department || 'UICET';
      const userName = user?.name || 'there';

      if (content.toLowerCase().includes("alumni") || content.toLowerCase().includes("mentor")) {
        if (userRole === 'student') {
          const relevantAlumni = alumni
            .filter(person => person.department === userDept || person.profession.toLowerCase().includes(content.toLowerCase().split(' ')[0]))
            .slice(0, 3);
          
          botResponse = `Perfect! I found ${relevantAlumni.length} ${userDept} alumni who could be excellent mentors for you, ${userName}:

${relevantAlumni.map((person, index) => 
  `${index + 1}. 🎓 **${person.name}** - ${person.profession}
     📍 ${person.location} | ${person.department} '${person.batchYear}
     💼 ${person.skills.slice(0, 3).join(', ')}
     💡 "${person.bio.substring(0, 120)}..."`
).join('\n\n')}

As a ${userDept} student, you'd especially benefit from connecting with alumni who share your academic background!`;
          
          suggestions = [
            "Draft mentorship request message",
            `Find more ${userDept} alumni`,
            "What to ask in first meeting?",
            "Tips for effective mentorship"
          ];
        } else if (userRole === 'alumni') {
          botResponse = `Great question! As an experienced ${user?.profession}, here are ways to provide valuable mentorship:

🎯 **Best Practices for ${user?.profession} Mentoring:**
• Share real industry challenges and solutions
• Provide portfolio/resume feedback
• Offer networking opportunities
• Guide on skill prioritization for current market

🤝 **Effective Mentoring Approach:**
• Set clear expectations and boundaries
• Schedule regular check-ins (monthly/bi-weekly)
• Focus on actionable advice, not just motivation
• Connect them with your professional network

Would you like help crafting responses to current mentorship requests?`;
          
          suggestions = [
            "Review pending requests",
            "Mentorship best practices",
            "Industry-specific guidance tips",
            "How to give constructive feedback"
          ];
        }
      } else if (content.toLowerCase().includes("career") || content.toLowerCase().includes("skills")) {
        if (userRole === 'student') {
          botResponse = `Excellent question, ${userName}! For ${userDept} students, here's what's trending in 2024:

🚀 **High-Demand Skills for ${userDept}:**
${userDept === 'UICET' ? 
  `• Full-stack development (React, Node.js, Python)
   • AI/ML (TensorFlow, PyTorch)
   • Cloud computing (AWS, Docker, Kubernetes)
   • Cybersecurity fundamentals` :
  userDept === 'UBS' ?
  `• Data analytics and business intelligence
   • Digital marketing and SEO
   • Financial modeling and analysis
   • Project management (Agile, Scrum)` :
  `• Industry-specific technical skills
   • Data analysis and research methods
   • Communication and presentation
   • Critical thinking and problem-solving`
}

💰 **Salary Insights:** Entry-level positions in your field typically start at ₹4-8 LPA, with rapid growth potential.

Our ${userDept} alumni report these skills led to the fastest career growth!`;
          
          suggestions = [
            `Connect with ${userDept} professionals`,
            "Create learning roadmap",
            "Portfolio building guide",
            "Interview preparation tips"
          ];
        } else if (userRole === 'alumni') {
          botResponse = `As a ${user?.profession} professional, you're in a perfect position to guide students! Current industry insights:

📈 **Emerging Trends in ${user?.profession}:**
• Increased demand for AI-enhanced workflows
• Remote collaboration tools mastery
• Sustainability and ESG considerations
• Cross-functional skill combinations

🎓 **What Students Should Focus On:**
• Practical project experience over theoretical knowledge
• Building a strong GitHub/portfolio presence
• Networking and personal branding
• Continuous learning mindset

Your experience in ${user?.profession} is exactly what current students need to hear about!`;
          
          suggestions = [
            "Share industry story",
            "Review student portfolios",
            "Discuss market trends",
            "Career transition advice"
          ];
        } else if (userRole === 'admin') {
          botResponse = `Platform Career Insights Dashboard:

📊 **Current Trends Across Departments:**
• UICET: 85% placement rate, avg ₹6.2 LPA
• UBS: 78% placement rate, avg ₹5.8 LPA  
• UIET: 82% placement rate, avg ₹6.5 LPA

🎯 **Most Requested Skills by Students:**
1. Programming & Development (40%)
2. Data Analysis (25%)
3. Communication Skills (20%)
4. Industry Knowledge (15%)

💡 **Recommendations:** Focus events on high-demand skills, increase alumni engagement in growing sectors.`;
          
          suggestions = [
            "Detailed analytics",
            "Event planning ideas",
            "Alumni engagement strategies",
            "Student success metrics"
          ];
        }
      } else if (content.toLowerCase().includes("events")) {
        botResponse = `Here are personalized event recommendations for ${userRole}s:

📅 **Upcoming Events for You:**
${userRole === 'student' ? 
  `• ${userDept} Career Fair - March 15th
   • Tech Skills Workshop - March 20th  
   • Alumni Networking Night - March 25th
   • Interview Prep Session - April 2nd` :
  userRole === 'alumni' ?
  `• Alumni Mentoring Workshop - March 18th
   • Industry Leaders Panel - March 22nd
   • Career Guidance Training - April 5th
   • Networking Mixer - April 10th` :
  `• University Management Summit - March 20th
   • Student Success Conference - April 1st
   • Platform Analytics Workshop - April 8th
   • Alumni Engagement Strategy - April 15th`
}

🔥 **Highly Recommended:** Events with your department focus and career-relevant content.`;
        
        suggestions = userRole === 'student' ? [
          "Register for career fair",
          "Skills workshop details", 
          "Networking event prep",
          "What to bring to events"
        ] : userRole === 'alumni' ? [
          "Mentoring workshop signup",
          "Industry panel participation",
          "Share speaking opportunity",
          "Alumni event hosting"
        ] : [
          "Event coordination help",
          "Attendance analytics", 
          "Speaker recommendations",
          "Budget planning assistance"
        ];
      } else {
        botResponse = getPersonalizedDefaultResponse();
        suggestions = getPersonalizedSuggestions();
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        type: "bot",
        content: botResponse,
        timestamp: new Date().toISOString(),
        suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const getPersonalizedDefaultResponse = () => {
    if (!user) return "I'm here to help you with your career journey! What would you like to know?";

    switch (user.role) {
      case 'student':
        return `Hi ${user.name}! As your AI assistant, I'm here to help you succeed as a ${user.department} student:

🎯 **I can help you with:**
• Finding relevant ${user.department} alumni mentors
• Career guidance specific to your field and batch year
• Skill development recommendations for ${user.department} 
• Event suggestions tailored to your interests
• Interview prep and portfolio building

What would you like to focus on today?`;

      case 'alumni':
        return `Hello ${user.name}! I'm here to support your mentoring journey as a ${user.profession} professional:

🤝 **How I can assist:**
• Managing and optimizing your mentorship approach
• Sharing industry insights with students
• Connecting you with fellow ${user.department} alumni
• Event recommendations for professional development
• Tips for effective student guidance

What aspect of mentoring would you like to explore?`;
      
      default:
        return "How can I assist you today?";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getQuickActions().map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <div className="flex items-start gap-3">
                      <action.icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="shadow-elegant h-[700px] flex flex-col">
              <CardHeader className="border-b bg-gradient-card">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  AI Mentor Assistant
                  <Badge variant="secondary" className="ml-auto">
                    {user ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Mode` : 'Demo Mode'}
                  </Badge>
                </CardTitle>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div className={`flex items-start gap-3 ${
                        message.type === "user" ? "justify-end" : "justify-start"
                      }`}>
                        {message.type === "bot" && (
                          <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        <div className={`max-w-lg rounded-lg p-3 ${
                          message.type === "user" 
                            ? "bg-primary text-primary-foreground ml-auto" 
                            : "bg-muted"
                        }`}>
                          <div className="text-sm whitespace-pre-line">
                            {message.content}
                          </div>
                        </div>

                        {message.type === "user" && (
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={user ? 
                      user.role === 'student' ? `Ask about ${user.department} careers, alumni, or events...` :
                      user.role === 'alumni' ? "Share insights or ask about mentoring students..." :
                      "Ask about platform management, analytics, or events..."
                      : "Ask me anything about careers, alumni, or events..."
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-gradient-hero hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;