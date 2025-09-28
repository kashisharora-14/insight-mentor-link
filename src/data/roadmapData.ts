import type { 
  CareerRoadmap, 
  RoadmapItem, 
  YearlyMilestone, 
  AlumniRecommendation, 
  OpportunityRecommendation,
  RoadmapInputForm 
} from "@/types/roadmap";

// Mock alumni data for recommendations
export const mockAlumniRecommendations: AlumniRecommendation[] = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    position: "Senior Data Scientist",
    company: "Google",
    department: "Computer Science",
    batchYear: 2018,
    relevanceScore: 95,
    matchingSkills: ["Machine Learning", "Python", "Data Analysis"],
    careerPath: ["Junior Developer", "Data Analyst", "ML Engineer", "Senior Data Scientist"]
  },
  {
    id: "2",
    name: "Arjun Kumar",
    position: "Product Manager",
    company: "Microsoft",
    department: "Computer Science",
    batchYear: 2019,
    relevanceScore: 88,
    matchingSkills: ["Leadership", "Product Strategy", "Data Analysis"],
    careerPath: ["Software Engineer", "Senior Engineer", "Tech Lead", "Product Manager"]
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    position: "AI Research Scientist",
    company: "OpenAI",
    department: "Computer Science",
    batchYear: 2017,
    relevanceScore: 92,
    matchingSkills: ["Deep Learning", "Python", "Research"],
    careerPath: ["Research Assistant", "ML Engineer", "Senior Researcher", "Principal Scientist"]
  }
];

// Mock opportunity recommendations
export const mockOpportunityRecommendations: OpportunityRecommendation[] = [
  {
    id: "1",
    title: "Google Summer of Code 2024",
    type: "project",
    description: "Contribute to open source projects with mentorship from industry experts",
    organization: "Google",
    deadline: new Date("2024-04-02"),
    duration: "3 months",
    relevanceScore: 90,
    skillsGained: ["Open Source", "Collaboration", "Software Development"],
    difficulty: "intermediate"
  },
  {
    id: "2",
    title: "AWS Machine Learning Certification",
    type: "certification",
    description: "Industry-recognized certification in machine learning on AWS platform",
    organization: "Amazon Web Services",
    duration: "2-3 months",
    relevanceScore: 85,
    skillsGained: ["AWS", "Machine Learning", "Cloud Computing"],
    difficulty: "intermediate"
  },
  {
    id: "3",
    title: "Tech Career Fair 2024",
    type: "workshop",
    description: "Connect with top tech companies and learn about career opportunities",
    organization: "Career Services",
    deadline: new Date("2024-03-15"),
    duration: "1 day",
    relevanceScore: 75,
    skillsGained: ["Networking", "Interview Skills", "Career Planning"],
    difficulty: "beginner"
  }
];

// AI-powered roadmap generation logic
export const generateCareerRoadmap = (formData: RoadmapInputForm): CareerRoadmap => {
  const studentId = "current-student"; // In real app, this would come from auth context
  
  // Generate roadmap items based on career goal and current skills
  const roadmapItems = generateRoadmapItems(formData);
  
  // Generate yearly milestones
  const yearlyMilestones = generateYearlyMilestones(formData, roadmapItems);
  
  // Calculate progress (starts at 0 for new roadmap)
  const progress = {
    completedItems: 0,
    totalItems: roadmapItems.length,
    currentYear: 1,
    skillsAcquired: formData.currentSkills.technical.length + formData.currentSkills.soft.length + formData.currentSkills.domain.length,
    projectsCompleted: 0
  };

  const roadmap: CareerRoadmap = {
    id: `roadmap-${Date.now()}`,
    studentId,
    careerGoal: {
      id: `goal-${Date.now()}`,
      title: formData.careerGoal.title,
      description: formData.careerGoal.description,
      targetPosition: formData.careerGoal.targetPosition,
      targetCompany: formData.careerGoal.targetCompany,
      timeframe: formData.careerGoal.timeframe,
      priority: 'high'
    },
    currentSkills: [
      ...formData.currentSkills.technical.map(skill => ({
        id: `skill-${skill}`,
        name: skill,
        category: 'technical' as const,
        level: 'intermediate' as const,
        verified: false
      })),
      ...formData.currentSkills.soft.map(skill => ({
        id: `skill-${skill}`,
        name: skill,
        category: 'soft' as const,
        level: 'intermediate' as const,
        verified: false
      })),
      ...formData.currentSkills.domain.map(skill => ({
        id: `skill-${skill}`,
        name: skill,
        category: 'domain' as const,
        level: 'intermediate' as const,
        verified: false
      }))
    ],
    interests: formData.interests.map(interest => ({
      id: `interest-${interest}`,
      area: interest,
      level: 'moderate' as const
    })),
    roadmapItems,
    yearlyMilestones,
    createdAt: new Date(),
    updatedAt: new Date(),
    progress
  };

  return roadmap;
};

const generateRoadmapItems = (formData: RoadmapInputForm): RoadmapItem[] => {
  const items: RoadmapItem[] = [];
  const careerGoal = formData.careerGoal.targetPosition.toLowerCase();
  const interests = formData.interests;
  const timeframe = formData.careerGoal.timeframe;

  // Generate items based on career goal
  if (careerGoal.includes('data scientist') || careerGoal.includes('machine learning')) {
    items.push(...generateDataScienceRoadmap(timeframe, interests));
  } else if (careerGoal.includes('software engineer') || careerGoal.includes('developer')) {
    items.push(...generateSoftwareEngineerRoadmap(timeframe, interests));
  } else if (careerGoal.includes('product manager')) {
    items.push(...generateProductManagerRoadmap(timeframe, interests));
  } else {
    // Generic tech career roadmap
    items.push(...generateGenericTechRoadmap(timeframe, interests));
  }

  // Add mentorship and networking items for all paths
  items.push(...generateMentorshipAndNetworkingItems(timeframe));

  return items;
};

const generateDataScienceRoadmap = (timeframe: number, interests: string[]): RoadmapItem[] => {
  const items: RoadmapItem[] = [
    // Year 1
    {
      id: "ds-1-1",
      title: "Master Python for Data Science",
      description: "Learn pandas, numpy, matplotlib, and scikit-learn",
      type: "skill",
      priority: "high",
      timeEstimate: "3-4 months",
      year: 1,
      quarter: 1,
      status: "pending",
      skills: ["Python", "Pandas", "NumPy"],
      difficulty: "medium",
      resources: ["Python for Data Science Handbook", "Kaggle Learn"]
    },
    {
      id: "ds-1-2",
      title: "Build First Data Analysis Project",
      description: "Complete an end-to-end data analysis project with visualization",
      type: "project",
      priority: "high",
      timeEstimate: "1 month",
      year: 1,
      quarter: 2,
      status: "pending",
      skills: ["Data Analysis", "Visualization"],
      difficulty: "medium",
      prerequisites: ["ds-1-1"]
    },
    {
      id: "ds-1-3",
      title: "Learn SQL and Database Fundamentals",
      description: "Master SQL queries, joins, and database design",
      type: "skill",
      priority: "high",
      timeEstimate: "2 months",
      year: 1,
      quarter: 3,
      status: "pending",
      skills: ["SQL", "Database Design"],
      difficulty: "medium"
    },
    {
      id: "ds-1-4",
      title: "Statistics and Probability Course",
      description: "Complete online course in statistics for data science",
      type: "course",
      priority: "high",
      timeEstimate: "2-3 months",
      year: 1,
      quarter: 4,
      status: "pending",
      skills: ["Statistics", "Probability"],
      difficulty: "medium"
    },
    // Year 2
    {
      id: "ds-2-1",
      title: "Machine Learning Fundamentals",
      description: "Learn supervised and unsupervised learning algorithms",
      type: "skill",
      priority: "high",
      timeEstimate: "3 months",
      year: 2,
      quarter: 1,
      status: "pending",
      skills: ["Machine Learning", "Scikit-learn"],
      difficulty: "hard"
    },
    {
      id: "ds-2-2",
      title: "Kaggle Competition Participation",
      description: "Participate in 2-3 Kaggle competitions to gain practical experience",
      type: "project",
      priority: "medium",
      timeEstimate: "Ongoing",
      year: 2,
      quarter: 2,
      status: "pending",
      skills: ["Machine Learning", "Competition", "Problem Solving"],
      difficulty: "hard"
    }
  ];

  // Add deep learning items if AI is an interest
  if (interests.some(interest => interest.toLowerCase().includes('artificial intelligence') || interest.toLowerCase().includes('deep learning'))) {
    items.push({
      id: "ds-3-1",
      title: "Deep Learning Specialization",
      description: "Complete Andrew Ng's Deep Learning specialization",
      type: "course",
      priority: "high",
      timeEstimate: "4 months",
      year: 3,
      quarter: 1,
      status: "pending",
      skills: ["Deep Learning", "TensorFlow", "Neural Networks"],
      difficulty: "hard",
      prerequisites: ["ds-2-1"]
    });
  }

  return items;
};

const generateSoftwareEngineerRoadmap = (timeframe: number, interests: string[]): RoadmapItem[] => {
  return [
    {
      id: "se-1-1",
      title: "Master Full-Stack Development",
      description: "Learn React, Node.js, and database fundamentals",
      type: "skill",
      priority: "high",
      timeEstimate: "4 months",
      year: 1,
      quarter: 1,
      status: "pending",
      skills: ["React", "Node.js", "JavaScript"],
      difficulty: "medium"
    },
    {
      id: "se-1-2",
      title: "Build Portfolio Website",
      description: "Create a professional portfolio showcasing your projects",
      type: "project",
      priority: "high",
      timeEstimate: "2 months",
      year: 1,
      quarter: 2,
      status: "pending",
      skills: ["Web Development", "Portfolio"],
      difficulty: "medium"
    },
    {
      id: "se-2-1",
      title: "Learn System Design",
      description: "Understand scalable system architecture and design patterns",
      type: "skill",
      priority: "high",
      timeEstimate: "3 months",
      year: 2,
      quarter: 1,
      status: "pending",
      skills: ["System Design", "Architecture"],
      difficulty: "hard"
    },
    {
      id: "se-2-2",
      title: "Contribute to Open Source",
      description: "Make meaningful contributions to popular open source projects",
      type: "project",
      priority: "medium",
      timeEstimate: "Ongoing",
      year: 2,
      quarter: 2,
      status: "pending",
      skills: ["Open Source", "Collaboration"],
      difficulty: "medium"
    }
  ];
};

const generateProductManagerRoadmap = (timeframe: number, interests: string[]): RoadmapItem[] => {
  return [
    {
      id: "pm-1-1",
      title: "Product Management Fundamentals",
      description: "Learn product strategy, roadmapping, and user research",
      type: "skill",
      priority: "high",
      timeEstimate: "3 months",
      year: 1,
      quarter: 1,
      status: "pending",
      skills: ["Product Strategy", "User Research"],
      difficulty: "medium"
    },
    {
      id: "pm-1-2",
      title: "Launch a Mini Product",
      description: "Build and launch a small product or feature",
      type: "project",
      priority: "high",
      timeEstimate: "4 months",
      year: 1,
      quarter: 2,
      status: "pending",
      skills: ["Product Launch", "Project Management"],
      difficulty: "hard"
    }
  ];
};

const generateGenericTechRoadmap = (timeframe: number, interests: string[]): RoadmapItem[] => {
  return [
    {
      id: "tech-1-1",
      title: "Programming Fundamentals",
      description: "Master a programming language relevant to your field",
      type: "skill",
      priority: "high",
      timeEstimate: "3 months",
      year: 1,
      quarter: 1,
      status: "pending",
      skills: ["Programming"],
      difficulty: "medium"
    },
    {
      id: "tech-1-2",
      title: "Build First Project",
      description: "Create a project that demonstrates your skills",
      type: "project",
      priority: "high",
      timeEstimate: "2 months",
      year: 1,
      quarter: 2,
      status: "pending",
      skills: ["Project Development"],
      difficulty: "medium"
    }
  ];
};

const generateMentorshipAndNetworkingItems = (timeframe: number): RoadmapItem[] => {
  return [
    {
      id: "network-1-1",
      title: "Connect with Alumni Mentors",
      description: "Establish relationships with 2-3 alumni in your field",
      type: "mentorship",
      priority: "high",
      timeEstimate: "Ongoing",
      year: 1,
      quarter: 1,
      status: "pending",
      skills: ["Networking", "Communication"],
      difficulty: "easy",
      alumniMentors: ["Dr. Sarah Chen", "Arjun Kumar"]
    },
    {
      id: "network-1-2",
      title: "Attend Tech Meetups",
      description: "Participate in 2-3 local tech meetups or conferences",
      type: "networking",
      priority: "medium",
      timeEstimate: "Ongoing",
      year: 1,
      quarter: 2,
      status: "pending",
      skills: ["Networking", "Industry Knowledge"],
      difficulty: "easy"
    },
    {
      id: "network-2-1",
      title: "Industry Conference Participation",
      description: "Attend major conference in your field",
      type: "networking",
      priority: "medium",
      timeEstimate: "1 week",
      year: 2,
      quarter: 3,
      status: "pending",
      skills: ["Networking", "Industry Trends"],
      difficulty: "medium"
    }
  ];
};

const generateYearlyMilestones = (formData: RoadmapInputForm, roadmapItems: RoadmapItem[]): YearlyMilestone[] => {
  const milestones: YearlyMilestone[] = [];
  const timeframe = formData.careerGoal.timeframe;
  const careerGoal = formData.careerGoal.targetPosition.toLowerCase();

  for (let year = 1; year <= timeframe; year++) {
    const yearItems = roadmapItems.filter(item => item.year === year);
    const skills = [...new Set(yearItems.flatMap(item => item.skills || []))];
    const projects = yearItems.filter(item => item.type === 'project').map(item => item.title);

    let milestone: YearlyMilestone;

    if (year === 1) {
      milestone = {
        year,
        title: "Foundation Year",
        description: "Build strong fundamentals and complete first projects",
        keySkills: skills,
        majorProjects: projects,
        networkingGoals: ["Connect with 2-3 alumni mentors", "Join tech communities"],
        targetAchievements: [
          "Master core technical skills",
          "Complete first significant project",
          "Build professional network foundation"
        ]
      };
    } else if (year === 2) {
      milestone = {
        year,
        title: "Skill Development",
        description: "Deepen expertise and gain practical experience",
        keySkills: skills,
        majorProjects: projects,
        networkingGoals: ["Expand industry connections", "Attend conferences"],
        targetAchievements: [
          "Gain advanced technical proficiency",
          "Complete complex projects",
          "Secure internship or part-time role"
        ]
      };
    } else if (year === timeframe) {
      milestone = {
        year,
        title: "Career Launch",
        description: "Achieve career goal and establish professional presence",
        keySkills: skills,
        majorProjects: projects,
        networkingGoals: ["Maintain mentor relationships", "Become a mentor"],
        targetAchievements: [
          `Secure position as ${formData.careerGoal.targetPosition}`,
          "Establish industry reputation",
          "Give back to community"
        ]
      };
    } else {
      milestone = {
        year,
        title: `Advanced Development - Year ${year}`,
        description: "Continue growing expertise and taking on leadership roles",
        keySkills: skills,
        majorProjects: projects,
        networkingGoals: ["Lead community initiatives", "Mentor junior members"],
        targetAchievements: [
          "Take on leadership responsibilities",
          "Develop specialized expertise",
          "Build industry recognition"
        ]
      };
    }

    milestones.push(milestone);
  }

  return milestones;
};