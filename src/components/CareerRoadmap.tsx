import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Route, 
  Sparkles, 
  Users, 
  Calendar, 
  TrendingUp,
  RefreshCw,
  Download,
  Share,
  Trophy
} from "lucide-react";
import CareerRoadmapForm from "./CareerRoadmapForm";
import RoadmapVisualization from "./RoadmapVisualization";
import { generateCareerRoadmap, mockAlumniRecommendations, mockOpportunityRecommendations } from "@/data/roadmapData";
import type { CareerRoadmap as CareerRoadmapType, RoadmapItem, RoadmapInputForm, AlumniRecommendation, OpportunityRecommendation } from "@/types/roadmap";

const CareerRoadmap = () => {
  const [activeTab, setActiveTab] = useState<"generator" | "roadmap" | "recommendations">("generator");
  const [currentRoadmap, setCurrentRoadmap] = useState<CareerRoadmapType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasExistingRoadmap, setHasExistingRoadmap] = useState(false);

  const handleFormSubmit = async (formData: RoadmapInputForm) => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const generatedRoadmap = generateCareerRoadmap(formData);
      setCurrentRoadmap(generatedRoadmap);
      setHasExistingRoadmap(true);
      setActiveTab("roadmap");
    } catch (error) {
      console.error("Error generating roadmap:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleItemUpdate = (itemId: string, status: RoadmapItem['status']) => {
    if (!currentRoadmap) return;

    const updatedItems = currentRoadmap.roadmapItems.map(item => 
      item.id === itemId ? { ...item, status } : item
    );

    // Update progress
    const completedItems = updatedItems.filter(item => item.status === 'completed').length;
    const skillsAcquired = updatedItems
      .filter(item => item.status === 'completed' && item.type === 'skill')
      .reduce((acc, item) => acc + (item.skills?.length || 0), 0);
    const projectsCompleted = updatedItems.filter(item => item.status === 'completed' && item.type === 'project').length;

    const updatedRoadmap: CareerRoadmapType = {
      ...currentRoadmap,
      roadmapItems: updatedItems,
      progress: {
        ...currentRoadmap.progress,
        completedItems,
        skillsAcquired: currentRoadmap.currentSkills.length + skillsAcquired,
        projectsCompleted
      },
      updatedAt: new Date()
    };

    setCurrentRoadmap(updatedRoadmap);
  };

  const handleRegenerateRoadmap = () => {
    setCurrentRoadmap(null);
    setHasExistingRoadmap(false);
    setActiveTab("generator");
  };

  if (!hasExistingRoadmap && activeTab === "generator") {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            🚀 Create Your Personalized Career Roadmap
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered system will analyze your goals, skills, and interests to create a 
            comprehensive roadmap with recommended courses, projects, mentors, and networking 
            opportunities tailored specifically for you.
          </p>
        </div>
        
        <CareerRoadmapForm onSubmit={handleFormSubmit} isLoading={isGenerating} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Career Roadmap</h2>
          {currentRoadmap && (
            <p className="text-muted-foreground">
              {currentRoadmap.careerGoal.title} • Updated {currentRoadmap.updatedAt.toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRegenerateRoadmap}>
            <RefreshCw className="w-4 h-4 mr-2" />
            New Roadmap
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roadmap" className="flex items-center gap-2">
            <Route className="w-4 h-4" />
            My Roadmap
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Update Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap">
          {currentRoadmap ? (
            <RoadmapVisualization 
              roadmap={currentRoadmap} 
              onItemUpdate={handleItemUpdate}
            />
          ) : (
            <Card className="shadow-elegant">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Route className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Roadmap Yet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Generate your first career roadmap to see your personalized timeline here.
                </p>
                <Button onClick={() => setActiveTab("generator")} className="bg-gradient-hero hover:opacity-90">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Roadmap
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations">
          <RecommendationsTab currentRoadmap={currentRoadmap} />
        </TabsContent>

        <TabsContent value="generator">
          <CareerRoadmapForm onSubmit={handleFormSubmit} isLoading={isGenerating} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const RecommendationsTab = ({ currentRoadmap }: { currentRoadmap: CareerRoadmapType | null }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Alumni Mentors */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Recommended Alumni Mentors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect with these alumni who have experience in your target field:
          </p>
          <div className="space-y-4">
            {mockAlumniRecommendations.slice(0, 3).map((alumni) => (
              <AlumniRecommendationCard key={alumni.id} alumni={alumni} />
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Alumni
          </Button>
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Recommended Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Opportunities that align with your career goals:
          </p>
          <div className="space-y-4">
            {mockOpportunityRecommendations.map((opportunity) => (
              <OpportunityRecommendationCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Explore More Opportunities
          </Button>
        </CardContent>
      </Card>

      {/* Progress Insights */}
      {currentRoadmap && (
        <Card className="shadow-elegant md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Your Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {Math.round((currentRoadmap.progress.completedItems / currentRoadmap.progress.totalItems) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Roadmap Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {currentRoadmap.progress.skillsAcquired}
                </div>
                <div className="text-sm text-muted-foreground">Skills Acquired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {currentRoadmap.careerGoal.timeframe - currentRoadmap.progress.currentYear + 1}
                </div>
                <div className="text-sm text-muted-foreground">Years Remaining</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-card rounded-lg">
              <h4 className="font-semibold mb-2">🎯 Recommended Next Steps</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Focus on high-priority Year {currentRoadmap.progress.currentYear} activities</li>
                <li>• Connect with recommended alumni mentors</li>
                <li>• Apply to relevant opportunities and competitions</li>
                <li>• Update your progress regularly to stay on track</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const AlumniRecommendationCard = ({ alumni }: { alumni: AlumniRecommendation }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gradient-card rounded-lg hover:shadow-glow transition-shadow">
      <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
        {alumni.name.split(' ').map(n => n[0]).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-foreground">{alumni.name}</h4>
            <p className="text-sm text-muted-foreground">{alumni.position} at {alumni.company}</p>
            <p className="text-xs text-muted-foreground">Batch {alumni.batchYear} • {alumni.department}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {alumni.relevanceScore}% match
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {alumni.matchingSkills.slice(0, 3).map(skill => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
        <Button size="sm" variant="outline" className="w-full mt-3 text-xs">
          <Users className="w-3 h-3 mr-1" />
          Connect
        </Button>
      </div>
    </div>
  );
};

const OpportunityRecommendationCard = ({ opportunity }: { opportunity: OpportunityRecommendation }) => {
  const getTypeIcon = () => {
    switch (opportunity.type) {
      case 'certification': return <Trophy className="w-4 h-4" />;
      case 'project': return <Route className="w-4 h-4" />;
      case 'workshop': return <Calendar className="w-4 h-4" />;
      case 'internship': return <Users className="w-4 h-4" />;
      case 'competition': return <TrendingUp className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-3 bg-gradient-card rounded-lg hover:shadow-glow transition-shadow">
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {getTypeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-foreground text-sm">{opportunity.title}</h4>
            <Badge variant="secondary" className="text-xs">
              {opportunity.relevanceScore}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{opportunity.organization}</p>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {opportunity.description}
      </p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {opportunity.skillsGained.slice(0, 3).map(skill => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>Duration: {opportunity.duration}</span>
        <Badge variant={opportunity.difficulty === 'beginner' ? 'secondary' : opportunity.difficulty === 'intermediate' ? 'default' : 'destructive'} className="text-xs">
          {opportunity.difficulty}
        </Badge>
      </div>

      {opportunity.deadline && (
        <p className="text-xs text-warning mb-2">
          Deadline: {opportunity.deadline.toLocaleDateString()}
        </p>
      )}

      <Button size="sm" variant="outline" className="w-full text-xs">
        Learn More
      </Button>
    </div>
  );
};

export default CareerRoadmap;