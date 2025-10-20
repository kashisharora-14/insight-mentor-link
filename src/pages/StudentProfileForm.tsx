
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, GraduationCap, Phone, Code } from 'lucide-react';
import Navigation from '@/components/ui/navigation';

export default function StudentProfileForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Academic Information
    rollNumber: '',
    department: '',
    batchYear: new Date().getFullYear(),
    currentSemester: 1,
    cgpa: '',
    
    // Personal Details
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    phoneNumber: '',
    alternateEmail: '',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    
    // Skills and Interests
    technicalSkills: [] as string[],
    softSkills: [] as string[],
    interests: [] as string[],
    careerGoals: '',
    
    // Social Links
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student-profile/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setFormData(prev => ({
            ...prev,
            rollNumber: data.profile.rollNumber || '',
            department: data.profile.department || '',
            batchYear: data.profile.batchYear || new Date().getFullYear(),
            currentSemester: data.profile.currentSemester || 1,
            cgpa: data.profile.cgpa || '',
            dateOfBirth: data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '',
            gender: data.profile.gender || '',
            phoneNumber: data.profile.phoneNumber || '',
            alternateEmail: data.profile.alternateEmail || '',
            permanentAddress: data.profile.permanentAddress || '',
            city: data.profile.city || '',
            state: data.profile.state || '',
            pincode: data.profile.pincode || '',
            technicalSkills: data.profile.technicalSkills || [],
            softSkills: data.profile.softSkills || [],
            interests: data.profile.interests || [],
            careerGoals: data.profile.careerGoals || '',
            linkedinUrl: data.profile.linkedinUrl || '',
            githubUrl: data.profile.githubUrl || '',
            portfolioUrl: data.profile.portfolioUrl || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Notice',
        description: 'Starting with a fresh profile form.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Convert dateOfBirth to ISO string if it exists
      const submitData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      };

      const response = await fetch('/api/student-profile/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message || 'Profile saved successfully!',
        });
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (type: 'technical' | 'soft' | 'interest') => {
    const input = type === 'technical' ? skillInput : type === 'soft' ? softSkillInput : interestInput;
    if (!input.trim()) return;

    const field = type === 'technical' ? 'technicalSkills' : type === 'soft' ? 'softSkills' : 'interests';
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], input.trim()]
    }));

    if (type === 'technical') setSkillInput('');
    else if (type === 'soft') setSoftSkillInput('');
    else setInterestInput('');
  };

  const removeSkill = (type: 'technical' | 'soft' | 'interest', index: number) => {
    const field = type === 'technical' ? 'technicalSkills' : type === 'soft' ? 'softSkills' : 'interests';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Fill in your details to help us serve you better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="academic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="academic">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Academic
                  </TabsTrigger>
                  <TabsTrigger value="personal">
                    <User className="w-4 h-4 mr-2" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="contact">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </TabsTrigger>
                  <TabsTrigger value="skills">
                    <Code className="w-4 h-4 mr-2" />
                    Skills
                  </TabsTrigger>
                </TabsList>

                {/* Academic Information */}
                <TabsContent value="academic" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number *</Label>
                      <Input
                        id="rollNumber"
                        value={formData.rollNumber}
                        onChange={(e) => handleChange('rollNumber', e.target.value)}
                        placeholder="e.g., MCA2024001"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Course *</Label>
                      <Select value={formData.department} onValueChange={(v) => handleChange('department', v)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MCA">MCA (Master of Computer Applications)</SelectItem>
                          <SelectItem value="MSc-IT">MSc-IT (Master of Science in IT)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchYear">Batch Year *</Label>
                      <Input
                        id="batchYear"
                        type="number"
                        value={formData.batchYear}
                        onChange={(e) => handleChange('batchYear', parseInt(e.target.value))}
                        min="2020"
                        max="2030"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentSemester">Current Year *</Label>
                      <Select value={formData.currentSemester.toString()} onValueChange={(v) => handleChange('currentSemester', parseInt(v))} required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input
                        id="cgpa"
                        type="number"
                        step="0.01"
                        max="10"
                        value={formData.cgpa}
                        onChange={(e) => handleChange('cgpa', e.target.value)}
                        placeholder="e.g., 8.5"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Personal Details */}
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Contact Information */}
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternateEmail">Alternate Email</Label>
                      <Input
                        id="alternateEmail"
                        type="email"
                        value={formData.alternateEmail}
                        onChange={(e) => handleChange('alternateEmail', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="permanentAddress">Address</Label>
                      <Textarea
                        id="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={(e) => handleChange('permanentAddress', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleChange('pincode', e.target.value)}
                        maxLength={6}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Skills and Professional Information */}
                <TabsContent value="skills" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="technicalSkills">Technical Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          id="technicalSkills"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="e.g., Python, React, Node.js"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('technical'))}
                        />
                        <Button type="button" onClick={() => addSkill('technical')}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.technicalSkills.map((skill, i) => (
                          <span key={i} className="bg-primary/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {skill}
                            <button type="button" onClick={() => removeSkill('technical', i)} className="text-destructive">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="softSkills">Soft Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          id="softSkills"
                          value={softSkillInput}
                          onChange={(e) => setSoftSkillInput(e.target.value)}
                          placeholder="e.g., Communication, Leadership"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('soft'))}
                        />
                        <Button type="button" onClick={() => addSkill('soft')}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.softSkills.map((skill, i) => (
                          <span key={i} className="bg-secondary/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {skill}
                            <button type="button" onClick={() => removeSkill('soft', i)} className="text-destructive">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests">Interests & Career Goals</Label>
                      <div className="flex gap-2">
                        <Input
                          id="interests"
                          value={interestInput}
                          onChange={(e) => setInterestInput(e.target.value)}
                          placeholder="e.g., AI/ML, Web Development"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('interest'))}
                        />
                        <Button type="button" onClick={() => addSkill('interest')}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.interests.map((interest, i) => (
                          <span key={i} className="bg-accent/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {interest}
                            <button type="button" onClick={() => removeSkill('interest', i)} className="text-destructive">×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="careerGoals">Career Aspirations</Label>
                      <Textarea
                        id="careerGoals"
                        value={formData.careerGoals}
                        onChange={(e) => handleChange('careerGoals', e.target.value)}
                        placeholder="Describe your career goals and what you hope to achieve..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Professional Links</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="LinkedIn Profile URL"
                          value={formData.linkedinUrl}
                          onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        />
                        <Input
                          placeholder="GitHub Profile URL"
                          value={formData.githubUrl}
                          onChange={(e) => handleChange('githubUrl', e.target.value)}
                        />
                        <Input
                          placeholder="Portfolio Website URL"
                          value={formData.portfolioUrl}
                          onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/student-dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
