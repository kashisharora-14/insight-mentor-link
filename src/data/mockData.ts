// Mock data for the prototype
export const departments = [
  "UICET", "UIET", "UBS", "Law", "Arts"
];

export const alumni = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    email: "sarah.chen@example.com",
    department: "UICET",
    batchYear: 2015,
    profession: "Senior Software Engineer at Google",
    location: "San Francisco, CA",
    bio: "Passionate about AI/ML and mentoring the next generation of engineers. Former startup founder with expertise in scalable systems.",
    avatar: "/api/placeholder/150/150",
    latitude: 37.7749,
    longitude: -122.4194,
    skills: ["Machine Learning", "Python", "React", "Leadership"]
  },
  {
    id: 2,
    name: "Prof. Raj Sharma",
    email: "raj.sharma@example.com",
    department: "UBS",
    batchYear: 2012,
    profession: "Investment Banking Director at Goldman Sachs",
    location: "New York, NY",
    bio: "Finance expert with 10+ years in investment banking. Specialized in M&A transactions and corporate finance.",
    avatar: "/api/placeholder/150/150",
    latitude: 40.7128,
    longitude: -74.0060,
    skills: ["Finance", "Investment Banking", "M&A", "Strategy"]
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    email: "priya.patel@example.com",
    department: "Law",
    batchYear: 2014,
    profession: "Corporate Lawyer at Baker McKenzie",
    location: "London, UK",
    bio: "International corporate law expert. Passionate about mentoring law students and young professionals.",
    avatar: "/api/placeholder/150/150",
    latitude: 51.5074,
    longitude: -0.1278,
    skills: ["Corporate Law", "International Law", "Contract Negotiation"]
  },
  {
    id: 4,
    name: "Arjun Kumar",
    email: "arjun.kumar@example.com",
    department: "UIET",
    batchYear: 2016,
    profession: "Product Manager at Microsoft",
    location: "Seattle, WA",
    bio: "Product management leader with expertise in cloud technologies and developer tools.",
    avatar: "/api/placeholder/150/150",
    latitude: 47.6062,
    longitude: -122.3321,
    skills: ["Product Management", "Cloud Computing", "Strategy", "Leadership"]
  },
  {
    id: 5,
    name: "Maya Singh",
    email: "maya.singh@example.com",
    department: "Arts",
    batchYear: 2013,
    profession: "Creative Director at Ogilvy",
    location: "Mumbai, India",
    bio: "Award-winning creative director with expertise in brand strategy and digital marketing.",
    avatar: "/api/placeholder/150/150",
    latitude: 19.0760,
    longitude: 72.8777,
    skills: ["Creative Direction", "Brand Strategy", "Digital Marketing"]
  }
];

export const students = [
  {
    id: 1,
    name: "Aarav Mehta",
    email: "aarav.mehta@student.edu",
    department: "UICET",
    batchYear: 2025,
    avatar: "/api/placeholder/150/150"
  },
  {
    id: 2,
    name: "Anisha Verma",
    email: "anisha.verma@student.edu",
    department: "UBS",
    batchYear: 2026,
    avatar: "/api/placeholder/150/150"
  }
];

export const mentorshipRequests = [
  {
    id: 1,
    studentId: 1,
    alumniId: 1,
    studentName: "Aarav Mehta",
    alumniName: "Dr. Sarah Chen",
    purpose: "Career guidance in Machine Learning and AI",
    preferredSlots: "Weekends, 10 AM - 12 PM",
    question: "How do I transition from academic projects to industry-level ML systems?",
    status: "pending" as const,
    createdAt: "2024-01-15",
    meetingLink: ""
  },
  {
    id: 2,
    studentId: 2,
    alumniId: 2,
    studentName: "Anisha Verma",
    alumniName: "Prof. Raj Sharma",
    purpose: "Investment banking career path",
    preferredSlots: "Weekdays, 6 PM - 8 PM",
    question: "What skills should I focus on for a career in investment banking?",
    status: "accepted" as const,
    createdAt: "2024-01-10",
    meetingLink: "https://meet.google.com/abc-def-ghi",
    scheduledTime: "2024-01-20 18:00"
  },
  {
    id: 3,
    studentId: 1,
    alumniId: 4,
    studentName: "Aarav Mehta",
    alumniName: "Arjun Kumar",
    purpose: "Product Management transition from Engineering",
    preferredSlots: "Any time flexible",
    question: "How did you transition from engineering to product management?",
    status: "completed" as const,
    createdAt: "2024-01-05",
    meetingLink: "https://zoom.us/j/123456789",
    scheduledTime: "2024-01-12 15:00"
  }
];

export const events = [
  {
    id: 1,
    title: "Annual Tech Conference 2024",
    description: "Join industry leaders discussing the latest trends in AI, blockchain, and cloud computing.",
    date: "2024-03-15",
    time: "09:00 AM",
    department: "UICET",
    location: "University Auditorium",
    registrationLink: "https://events.university.edu/tech-conf-2024",
    image: "/api/placeholder/300/200"
  },
  {
    id: 2,
    title: "Finance Career Fair",
    description: "Meet recruiters from top financial institutions and learn about career opportunities.",
    date: "2024-02-28",
    time: "10:00 AM",
    department: "UBS",
    location: "Business School Campus",
    registrationLink: "https://events.university.edu/finance-fair",
    image: "/api/placeholder/300/200"
  },
  {
    id: 3,
    title: "Legal Workshop: Corporate Law Trends",
    description: "Expert panel discussion on emerging trends in corporate law and compliance.",
    date: "2024-03-10",
    time: "02:00 PM",
    department: "Law",
    location: "Law Faculty Building",
    registrationLink: "https://events.university.edu/law-workshop",
    image: "/api/placeholder/300/200"
  },
  {
    id: 4,
    title: "Engineering Innovation Summit",
    description: "Showcase of cutting-edge engineering projects and research.",
    date: "2024-04-05",
    time: "11:00 AM",
    department: "UIET",
    location: "Engineering Complex",
    registrationLink: "https://events.university.edu/eng-summit",
    image: "/api/placeholder/300/200"
  },
  {
    id: 5,
    title: "Arts & Culture Festival",
    description: "Celebrate creativity with exhibitions, performances, and workshops.",
    date: "2024-03-25",
    time: "06:00 PM",
    department: "Arts",
    location: "Cultural Center",
    registrationLink: "https://events.university.edu/arts-festival",
    image: "/api/placeholder/300/200"
  }
];

export const chatMessages = [
  {
    id: 1,
    type: "bot" as const,
    content: "Hi! I'm your AI mentor assistant. I can help you find the right alumni to connect with, answer career questions, or suggest relevant events. What would you like to know?",
    timestamp: new Date().toISOString()
  }
];

export const connections = [
  {
    id: 1,
    studentId: 1,
    alumniId: 2,
    studentName: "Aarav Mehta",
    alumniName: "Prof. Raj Sharma",
    connectedAt: "2024-01-10",
    lastInteraction: "2024-01-20"
  },
  {
    id: 2,
    studentId: 1,
    alumniId: 4,
    studentName: "Aarav Mehta",
    alumniName: "Arjun Kumar",
    connectedAt: "2024-01-05",
    lastInteraction: "2024-01-12"
  }
];