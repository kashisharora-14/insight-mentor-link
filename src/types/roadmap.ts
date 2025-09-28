// Career Roadmap Types and Interfaces

export interface CareerGoal {
  id: string;
  title: string;
  description: string;
  targetPosition: string;
  targetCompany?: string;
  timeframe: number; // years
  priority: 'high' | 'medium' | 'low';
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
}

export interface Interest {
  id: string;
  area: string;
  level: 'casual' | 'moderate' | 'passionate';
}

export type RoadmapItemType = 'skill' | 'project' | 'mentorship' | 'networking' | 'certification' | 'course';

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  type: RoadmapItemType;
  priority: 'high' | 'medium' | 'low';
  timeEstimate: string; // e.g., "2-3 months"
  year: number; // 1-5
  quarter?: number; // 1-4
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  prerequisites?: string[];
  skills?: string[];
  resources?: string[];
  alumniMentors?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface YearlyMilestone {
  year: number;
  title: string;
  description: string;
  keySkills: string[];
  majorProjects: string[];
  networkingGoals: string[];
  targetAchievements: string[];
}

export interface CareerRoadmap {
  id: string;
  studentId: string;
  careerGoal: CareerGoal;
  currentSkills: Skill[];
  interests: Interest[];
  roadmapItems: RoadmapItem[];
  yearlyMilestones: YearlyMilestone[];
  createdAt: Date;
  updatedAt: Date;
  progress: {
    completedItems: number;
    totalItems: number;
    currentYear: number;
    skillsAcquired: number;
    projectsCompleted: number;
  };
}

export interface RoadmapInputForm {
  careerGoal: {
    title: string;
    targetPosition: string;
    targetCompany: string;
    timeframe: number;
    description: string;
  };
  currentSkills: {
    technical: string[];
    soft: string[];
    domain: string[];
  };
  interests: string[];
  preferences: {
    learningStyle: 'hands-on' | 'theoretical' | 'mixed';
    timeCommitment: 'part-time' | 'full-time' | 'flexible';
    focusAreas: string[];
  };
}

export interface AlumniRecommendation {
  id: string;
  name: string;
  position: string;
  company: string;
  department: string;
  batchYear: number;
  relevanceScore: number;
  matchingSkills: string[];
  careerPath: string[];
}

export interface OpportunityRecommendation {
  id: string;
  title: string;
  type: 'internship' | 'project' | 'competition' | 'workshop' | 'certification';
  description: string;
  organization: string;
  deadline?: Date;
  duration: string;
  relevanceScore: number;
  skillsGained: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}