import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Calendar
} from "lucide-react";

interface Message {
  id: number;
  type: "user" | "bot";
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages as Message[]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      icon: Users,
      title: "Find Alumni",
      description: "Help me find alumni in my field",
      prompt: "I'm looking for alumni who work in software engineering. Can you suggest some mentors?"
    },
    {
      icon: Briefcase,
      title: "Career Advice",
      description: "Get career guidance",
      prompt: "What skills should I focus on for a career in data science?"
    },
    {
      icon: TrendingUp,
      title: "Industry Trends",
      description: "Latest industry insights",
      prompt: "What are the current trends in artificial intelligence and machine learning?"
    },
    {
      icon: Calendar,
      title: "Upcoming Events",
      description: "Relevant events for me",
      prompt: "Are there any upcoming tech events I should attend?"
    }
  ];

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

    // Simulate AI response
    setTimeout(() => {
      let botResponse = "";
      let suggestions: string[] = [];

      if (content.toLowerCase().includes("alumni") || content.toLowerCase().includes("mentor")) {
        const relevantAlumni = alumni.slice(0, 2);
        botResponse = `I found some great alumni who might be perfect mentors for you:

${relevantAlumni.map(person => 
  `🎓 **${person.name}** - ${person.profession}
  📍 ${person.location} | ${person.department} '${person.batchYear}
  💡 ${person.bio.substring(0, 100)}...`
).join('\n\n')}

Would you like me to help you draft a mentorship request to any of these alumni?`;
        
        suggestions = [
          "Help me write a mentorship request",
          "Show me more alumni in this field",
          "What questions should I ask a mentor?"
        ];
      } else if (content.toLowerCase().includes("career") || content.toLowerCase().includes("skills")) {
        botResponse = `Based on current industry trends, here are key skills to focus on:

🚀 **Technical Skills:**
• Programming languages (Python, JavaScript, React)
• Data analysis and visualization
• Cloud platforms (AWS, Azure, GCP)
• Machine learning fundamentals

🎯 **Soft Skills:**
• Communication and presentation
• Problem-solving mindset
• Team collaboration
• Adaptability and continuous learning

I can connect you with alumni who excel in these areas. Would you like specific recommendations?`;
        
        suggestions = [
          "Find alumni with these skills",
          "What courses should I take?",
          "How to build a strong portfolio?"
        ];
      } else if (content.toLowerCase().includes("events")) {
        botResponse = `Here are some upcoming events that might interest you:

📅 **This Month:**
• Tech Conference 2024 - March 15th
• Finance Career Fair - February 28th
• Legal Workshop - March 10th

🔥 **Recommended for you:**
• AI/ML Workshop - Perfect for building technical skills
• Alumni Networking Night - Great for making connections

Would you like me to help you register for any of these events?`;
        
        suggestions = [
          "Register for Tech Conference",
          "Tell me about networking events",
          "What should I prepare for career fairs?"
        ];
      } else {
        botResponse = `I'm here to help you with your career journey! I can assist you with:

🎯 **Finding the right mentors** based on your interests and goals
📚 **Career guidance** and skill development recommendations  
🌐 **Alumni connections** across different industries and locations
📅 **Event recommendations** tailored to your field
💡 **Interview preparation** and portfolio building tips

What specific area would you like to explore today?`;
        
        suggestions = [
          "Help me find a mentor",
          "What skills should I develop?",
          "Show me upcoming events",
          "Career advice for my field"
        ];
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
                {quickActions.map((action, index) => (
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
                    Online
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
                    placeholder="Ask me anything about careers, alumni, or events..."
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