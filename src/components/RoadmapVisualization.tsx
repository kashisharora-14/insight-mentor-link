import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Users, 
  Code2, 
  BookOpen, 
  Network, 
  Trophy, 
  Target,
  Calendar,
  TrendingUp,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import type { CareerRoadmap, RoadmapItem, YearlyMilestone } from "@/types/roadmap";

interface RoadmapVisualizationProps {
  roadmap: CareerRoadmap;
  onItemUpdate?: (itemId: string, status: RoadmapItem['status']) => void;
}

const RoadmapVisualization = ({ roadmap, onItemUpdate }: RoadmapVisualizationProps) => {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');

  const getTypeIcon = (type: RoadmapItem['type']) => {
    switch (type) {
      case 'skill': return <Code2 className="w-4 h-4" />;
      case 'project': return <Target className="w-4 h-4" />;
      case 'mentorship': return <Users className="w-4 h-4" />;
      case 'networking': return <Network className="w-4 h-4" />;
      case 'certification': return <Trophy className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: RoadmapItem['type']) => {
    switch (type) {
      case 'skill': return 'bg-blue-500';
      case 'project': return 'bg-green-500';
      case 'mentorship': return 'bg-purple-500';
      case 'networking': return 'bg-orange-500';
      case 'certification': return 'bg-yellow-500';
      case 'course': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Play className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'skipped': return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default: return <Circle className="w-4 h-4 text-gray-300" />;
    }
  };

  const getItemsByYear = (year: number) => {
    return roadmap.roadmapItems.filter(item => item.year === year);
  };

  const getMilestoneByYear = (year: number) => {
    return roadmap.yearlyMilestones.find(m => m.year === year);
  };

  const calculateYearProgress = (year: number) => {
    const yearItems = getItemsByYear(year);
    if (yearItems.length === 0) return 0;
    const completedItems = yearItems.filter(item => item.status === 'completed').length;
    return (completedItems / yearItems.length) * 100;
  };

  const years = Array.from({ length: roadmap.careerGoal.timeframe }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Header with Progress Overview */}
      <Card className="shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Your Career Roadmap
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {roadmap.careerGoal.title}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round((roadmap.progress.completedItems / roadmap.progress.totalItems) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">{roadmap.progress.completedItems}</div>
              <div className="text-xs text-muted-foreground">Completed Items</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">{roadmap.progress.skillsAcquired}</div>
              <div className="text-xs text-muted-foreground">Skills Acquired</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">{roadmap.progress.projectsCompleted}</div>
              <div className="text-xs text-muted-foreground">Projects Done</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">Year {roadmap.progress.currentYear}</div>
              <div className="text-xs text-muted-foreground">Current Phase</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{roadmap.progress.completedItems} of {roadmap.progress.totalItems} items</span>
            </div>
            <Progress value={(roadmap.progress.completedItems / roadmap.progress.totalItems) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Year Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {years.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? "default" : "outline"}
            onClick={() => setSelectedYear(year)}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Year {year}
            <Badge variant="secondary" className="ml-1">
              {Math.round(calculateYearProgress(year))}%
            </Badge>
          </Button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'timeline' | 'grid')}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6">
          <YearTimelineView 
            year={selectedYear}
            milestone={getMilestoneByYear(selectedYear)}
            items={getItemsByYear(selectedYear)}
            onItemUpdate={onItemUpdate}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid" className="space-y-6">
          <YearGridView 
            year={selectedYear}
            milestone={getMilestoneByYear(selectedYear)}
            items={getItemsByYear(selectedYear)}
            onItemUpdate={onItemUpdate}
            getTypeIcon={getTypeIcon}
            getTypeColor={getTypeColor}
            getStatusIcon={getStatusIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Timeline View Component
const YearTimelineView = ({ 
  year, 
  milestone, 
  items, 
  onItemUpdate, 
  getTypeIcon, 
  getTypeColor, 
  getStatusIcon 
}: any) => {
  const quarters = [1, 2, 3, 4];

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Year {year} Timeline
        </CardTitle>
        {milestone && (
          <div className="bg-gradient-card p-4 rounded-lg mt-4">
            <h3 className="font-semibold text-foreground mb-2">{milestone.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Key Skills:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {milestone.keySkills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <strong>Target Achievements:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {milestone.targetAchievements.map(achievement => (
                    <li key={achievement} className="text-muted-foreground">{achievement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {quarters.map(quarter => {
            const quarterItems = items.filter((item: RoadmapItem) => item.quarter === quarter);
            
            return (
              <div key={quarter} className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
                    Q{quarter}
                  </div>
                  <div>
                    <h3 className="font-semibold">Quarter {quarter}</h3>
                    <p className="text-sm text-muted-foreground">
                      {quarterItems.length} activities planned
                    </p>
                  </div>
                </div>

                <div className="ml-6 border-l-2 border-border pl-6 space-y-4">
                  {quarterItems.map((item: RoadmapItem) => (
                    <RoadmapItemCard
                      key={item.id}
                      item={item}
                      onItemUpdate={onItemUpdate}
                      getTypeIcon={getTypeIcon}
                      getTypeColor={getTypeColor}
                      getStatusIcon={getStatusIcon}
                    />
                  ))}
                  
                  {quarterItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No activities planned for this quarter</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Grid View Component
const YearGridView = ({ 
  year, 
  milestone, 
  items, 
  onItemUpdate, 
  getTypeIcon, 
  getTypeColor, 
  getStatusIcon 
}: any) => {
  const itemsByType = items.reduce((acc: any, item: RoadmapItem) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {milestone && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Year {year} Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-card p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">{milestone.title}</h3>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(itemsByType).map(([type, typeItems]: [string, any]) => (
          <Card key={type} className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 capitalize">
                {getTypeIcon(type)}
                {type} Activities
                <Badge variant="secondary">{typeItems.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typeItems.map((item: RoadmapItem) => (
                  <RoadmapItemCard
                    key={item.id}
                    item={item}
                    onItemUpdate={onItemUpdate}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                    getStatusIcon={getStatusIcon}
                    compact
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Roadmap Item Card Component
const RoadmapItemCard = ({ 
  item, 
  onItemUpdate, 
  getTypeIcon, 
  getTypeColor, 
  getStatusIcon, 
  compact = false 
}: any) => {
  const handleStatusUpdate = (newStatus: RoadmapItem['status']) => {
    if (onItemUpdate) {
      onItemUpdate(item.id, newStatus);
    }
  };

  return (
    <Card className={`border border-border hover:shadow-glow transition-shadow ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 ${getTypeColor(item.type)} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
          {getTypeIcon(item.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{item.title}</h4>
              {!compact && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusIcon(item.status)}
              <Badge 
                variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {item.priority}
              </Badge>
            </div>
          </div>

          {!compact && (
            <div className="mt-3 space-y-2">
              {item.skills && item.skills.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground">Skills: </span>
                  {item.skills.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs mr-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Duration: {item.timeEstimate}</span>
                <span>Difficulty: {item.difficulty}</span>
              </div>

              {onItemUpdate && (
                <div className="flex gap-1 mt-2">
                  {item.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate('completed')}
                      className="text-xs h-7"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                  )}
                  {item.status !== 'in_progress' && item.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate('in_progress')}
                      className="text-xs h-7"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start
                    </Button>
                  )}
                  {item.status === 'in_progress' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate('pending')}
                      className="text-xs h-7"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RoadmapVisualization;