import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  Brain, 
  Heart, 
  Settings, 
  Plus, 
  X,
  Sparkles,
  Clock,
  GraduationCap
} from "lucide-react";
import type { RoadmapInputForm } from "@/types/roadmap";

interface CareerRoadmapFormProps {
  onSubmit: (formData: RoadmapInputForm) => void;
  isLoading?: boolean;
}

const CareerRoadmapForm = ({ onSubmit, isLoading = false }: CareerRoadmapFormProps) => {
  const [activeStep, setActiveStep] = useState("goal");
  const [formData, setFormData] = useState<RoadmapInputForm>({
    careerGoal: {
      title: "",
      targetPosition: "",
      targetCompany: "",
      timeframe: 5,
      description: ""
    },
    currentSkills: {
      technical: [],
      soft: [],
      domain: []
    },
    interests: [],
    preferences: {
      learningStyle: "mixed",
      timeCommitment: "flexible",
      focusAreas: []
    }
  });

  const [newSkill, setNewSkill] = useState({ category: "technical", name: "" });
  const [newInterest, setNewInterest] = useState("");

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const category = newSkill.category as keyof typeof formData.currentSkills;
      setFormData(prev => ({
        ...prev,
        currentSkills: {
          ...prev.currentSkills,
          [category]: [...prev.currentSkills[category], newSkill.name.trim()]
        }
      }));
      setNewSkill({ ...newSkill, name: "" });
    }
  };

  const removeSkill = (category: keyof typeof formData.currentSkills, skill: string) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: {
        ...prev.currentSkills,
        [category]: prev.currentSkills[category].filter(s => s !== skill)
      }
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isFormValid = () => {
    return formData.careerGoal.title && 
           formData.careerGoal.targetPosition && 
           (formData.currentSkills.technical.length > 0 || 
            formData.currentSkills.soft.length > 0 || 
            formData.currentSkills.domain.length > 0) &&
           formData.interests.length > 0;
  };

  const commonTechnicalSkills = [
    "Python", "JavaScript", "React", "Node.js", "SQL", "Java", "C++", 
    "Machine Learning", "Data Analysis", "Cloud Computing", "Docker"
  ];

  const commonSoftSkills = [
    "Communication", "Leadership", "Problem Solving", "Teamwork", 
    "Time Management", "Critical Thinking", "Adaptability"
  ];

  const commonInterests = [
    "Artificial Intelligence", "Web Development", "Data Science", "Mobile Apps",
    "Cybersecurity", "Cloud Computing", "UI/UX Design", "Product Management",
    "DevOps", "Blockchain", "IoT", "Robotics"
  ];

  const focusAreas = [
    "Technical Skills", "Leadership", "Entrepreneurship", "Research",
    "Industry Connections", "Certifications", "Open Source", "Mentorship"
  ];

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Career Roadmap Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Let's create a personalized roadmap for your career goals. This will help us recommend 
          the right skills, projects, and connections for your journey.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeStep} onValueChange={setActiveStep} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="goal" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Career Goal</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Interests</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
          </TabsList>

          {/* Career Goal Tab */}
          <TabsContent value="goal" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="career-title">Career Goal Title *</Label>
                <Input
                  id="career-title"
                  placeholder="e.g., Become a Data Scientist at a top tech company"
                  value={formData.careerGoal.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    careerGoal: { ...prev.careerGoal, title: e.target.value }
                  }))}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target-position">Target Position *</Label>
                  <Input
                    id="target-position"
                    placeholder="e.g., Senior Data Scientist"
                    value={formData.careerGoal.targetPosition}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      careerGoal: { ...prev.careerGoal, targetPosition: e.target.value }
                    }))}
                  />
                </div>

                <div>
                  <Label htmlFor="target-company">Target Company (Optional)</Label>
                  <Input
                    id="target-company"
                    placeholder="e.g., Google, Microsoft, or Startup"
                    value={formData.careerGoal.targetCompany}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      careerGoal: { ...prev.careerGoal, targetCompany: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timeframe">Timeframe (Years)</Label>
                <Select
                  value={formData.careerGoal.timeframe.toString()}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    careerGoal: { ...prev.careerGoal, timeframe: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 years</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="4">4 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="6">6+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your career aspirations, the impact you want to make, or specific areas you're passionate about..."
                  value={formData.careerGoal.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    careerGoal: { ...prev.careerGoal, description: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label>Add Your Current Skills *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add skills you already have or are currently learning. This helps us understand your starting point.
                </p>
                
                <div className="flex gap-2 mb-4">
                  <Select
                    value={newSkill.category}
                    onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="soft">Soft Skills</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enter skill name"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Add Buttons */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Quick Add Technical Skills:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonTechnicalSkills.map(skill => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            if (!formData.currentSkills.technical.includes(skill)) {
                              setFormData(prev => ({
                                ...prev,
                                currentSkills: {
                                  ...prev.currentSkills,
                                  technical: [...prev.currentSkills.technical, skill]
                                }
                              }));
                            }
                          }}
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Quick Add Soft Skills:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonSoftSkills.map(skill => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            if (!formData.currentSkills.soft.includes(skill)) {
                              setFormData(prev => ({
                                ...prev,
                                currentSkills: {
                                  ...prev.currentSkills,
                                  soft: [...prev.currentSkills.soft, skill]
                                }
                              }));
                            }
                          }}
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Skills Display */}
                <div className="space-y-4 mt-6">
                  {Object.entries(formData.currentSkills).map(([category, skills]) => (
                    skills.length > 0 && (
                      <div key={category}>
                        <Label className="text-sm capitalize">{category} Skills:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.map(skill => (
                            <Badge key={skill} variant="default" className="flex items-center gap-1">
                              {skill}
                              <X
                                className="w-3 h-3 cursor-pointer hover:text-destructive"
                                onClick={() => removeSkill(category as keyof typeof formData.currentSkills, skill)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6">
            <div>
              <Label>Your Interests *</Label>
              <p className="text-sm text-muted-foreground mb-4">
                What areas of technology or business are you passionate about? This helps us suggest relevant opportunities.
              </p>
              
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter an interest area"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button onClick={addInterest} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label className="text-sm">Quick Add Common Interests:</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-6">
                  {commonInterests.map(interest => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        if (!formData.interests.includes(interest)) {
                          setFormData(prev => ({
                            ...prev,
                            interests: [...prev.interests, interest]
                          }));
                        }
                      }}
                    >
                      + {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.interests.length > 0 && (
                <div>
                  <Label className="text-sm">Your Selected Interests:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.interests.map(interest => (
                      <Badge key={interest} variant="default" className="flex items-center gap-1">
                        {interest}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-destructive"
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label>Learning Style</Label>
                <Select
                  value={formData.preferences.learningStyle}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, learningStyle: value as any }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hands-on">Hands-on (Projects & Practice)</SelectItem>
                    <SelectItem value="theoretical">Theoretical (Courses & Reading)</SelectItem>
                    <SelectItem value="mixed">Mixed Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time Commitment</Label>
                <Select
                  value={formData.preferences.timeCommitment}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, timeCommitment: value as any }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="part-time">Part-time (10-15 hrs/week)</SelectItem>
                    <SelectItem value="full-time">Full-time (30+ hrs/week)</SelectItem>
                    <SelectItem value="flexible">Flexible Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Focus Areas (Select all that apply)</Label>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {focusAreas.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={formData.preferences.focusAreas.includes(area)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                focusAreas: [...prev.preferences.focusAreas, area]
                              }
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                focusAreas: prev.preferences.focusAreas.filter(f => f !== area)
                              }
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={area} className="text-sm font-normal">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation and Submit */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            {activeStep !== "goal" && (
              <Button
                variant="outline"
                onClick={() => {
                  const steps = ["goal", "skills", "interests", "preferences"];
                  const currentIndex = steps.indexOf(activeStep);
                  if (currentIndex > 0) setActiveStep(steps[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {activeStep !== "preferences" ? (
              <Button
                onClick={() => {
                  const steps = ["goal", "skills", "interests", "preferences"];
                  const currentIndex = steps.indexOf(activeStep);
                  if (currentIndex < steps.length - 1) setActiveStep(steps[currentIndex + 1]);
                }}
                disabled={
                  (activeStep === "goal" && !formData.careerGoal.title) ||
                  (activeStep === "skills" && 
                   formData.currentSkills.technical.length === 0 && 
                   formData.currentSkills.soft.length === 0 && 
                   formData.currentSkills.domain.length === 0) ||
                  (activeStep === "interests" && formData.interests.length === 0)
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || isLoading}
                className="bg-gradient-hero hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Generate My Roadmap
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareerRoadmapForm;