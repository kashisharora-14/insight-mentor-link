
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Plus, X, Briefcase, GraduationCap, Award, MapPin, Linkedin, Github, Twitter } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface AlumniProfile {
  id?: string;
  name: string;
  email: string;
  graduationYear: string;
  degree: string;
  major: string;
  currentCompany: string;
  currentPosition: string;
  location: string;
  bio: string;
  skills: string[];
  expertise: string[];
  availableForMentorship: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  achievements: string[];
  profileImage?: string;
}

export default function AlumniProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  
  const [profile, setProfile] = useState<AlumniProfile>({
    name: '',
    email: user?.email || '',
    graduationYear: '',
    degree: '',
    major: '',
    currentCompany: '',
    currentPosition: '',
    location: '',
    bio: '',
    skills: [],
    expertise: [],
    availableForMentorship: true,
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    achievements: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/alumni/profile');
      if (response.data) {
        setProfile({
          ...response.data,
          skills: response.data.skills || [],
          expertise: response.data.expertise || [],
          achievements: response.data.achievements || [],
        });
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error fetching profile:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !profile.expertise.includes(newExpertise.trim())) {
      setProfile(prev => ({ ...prev, expertise: [...prev.expertise, newExpertise.trim()] }));
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setProfile(prev => ({ ...prev, expertise: prev.expertise.filter(e => e !== expertise) }));
  };

  const addAchievement = () => {
    if (newAchievement.trim() && !profile.achievements.includes(newAchievement.trim())) {
      setProfile(prev => ({ ...prev, achievements: [...prev.achievements, newAchievement.trim()] }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievement: string) => {
    setProfile(prev => ({ ...prev, achievements: prev.achievements.filter(a => a !== achievement) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post('/alumni/profile', profile);
      toast.success('Profile saved successfully!');
      navigate('/alumni-dashboard');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/alumni-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="text-2xl">Edit Your Profile</CardTitle>
            <CardDescription className="text-purple-100">
              Complete your profile to appear in the alumni directory and offer mentorship
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      value={profile.graduationYear}
                      onChange={handleInputChange}
                      required
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={profile.degree}
                      onChange={handleInputChange}
                      required
                      placeholder="Bachelor of Science"
                    />
                  </div>

                  <div>
                    <Label htmlFor="major">Major *</Label>
                    <Input
                      id="major"
                      name="major"
                      value={profile.major}
                      onChange={handleInputChange}
                      required
                      placeholder="Computer Science"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      placeholder="Chandigarh, India"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself, your journey, and what you're passionate about..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentCompany">Current Company</Label>
                    <Input
                      id="currentCompany"
                      name="currentCompany"
                      value={profile.currentCompany}
                      onChange={handleInputChange}
                      placeholder="Google"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentPosition">Current Position</Label>
                    <Input
                      id="currentPosition"
                      name="currentPosition"
                      value={profile.currentPosition}
                      onChange={handleInputChange}
                      placeholder="Software Engineer"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., Python, React)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Expertise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Areas of Expertise</h3>
                <div className="flex gap-2">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Add expertise (e.g., Machine Learning, UI/UX)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  />
                  <Button type="button" onClick={addExpertise}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise.map((exp, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1 border-blue-300">
                      {exp}
                      <button
                        type="button"
                        onClick={() => removeExpertise(exp)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Achievements
                </h3>
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add an achievement"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                  />
                  <Button type="button" onClick={addAchievement}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {profile.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="flex-1">{achievement}</span>
                      <button
                        type="button"
                        onClick={() => removeAchievement(achievement)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <Input
                      name="linkedinUrl"
                      value={profile.linkedinUrl}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-gray-800" />
                    <Input
                      name="githubUrl"
                      value={profile.githubUrl}
                      onChange={handleInputChange}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <Input
                      name="twitterUrl"
                      value={profile.twitterUrl}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                </div>
              </div>

              {/* Mentorship Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mentorship</h3>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="availableForMentorship"
                    checked={profile.availableForMentorship}
                    onChange={(e) => setProfile(prev => ({ ...prev, availableForMentorship: e.target.checked }))}
                    className="h-5 w-5 rounded text-green-600"
                  />
                  <Label htmlFor="availableForMentorship" className="cursor-pointer">
                    I am available to mentor students
                  </Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
                  {loading ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/alumni-dashboard')}>
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
