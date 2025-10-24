
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
import { ArrowLeft, Plus, X, Briefcase, GraduationCap, Award, MapPin, Linkedin, Github, Twitter, Users, Sparkles, Upload, Building2, Calendar, TrendingUp } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

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
  city?: string;
  state?: string;
  country?: string;
  bio: string;
  skills: string[];
  expertise: string[];
  achievements: string[];
  workExperience: WorkExperience[];
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  profileImage?: string;
  availableForMentorship: boolean;
  mentorshipAreas: string[];
  preferredCommunication?: string;
  maxMentees?: number;
  availableForGuestLectures?: boolean;
  availableForNetworking?: boolean;
  availableForJobReferrals?: boolean;
  isPublicProfile?: boolean;
  showContactInfo?: boolean;
}

export default function AlumniProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  const [newMentorshipArea, setNewMentorshipArea] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [profile, setProfile] = useState<AlumniProfile>({
    name: '',
    email: user?.email || '',
    graduationYear: '',
    degree: '',
    major: '',
    currentCompany: '',
    currentPosition: '',
    location: '',
    city: '',
    state: '',
    country: 'India',
    bio: '',
    skills: [],
    expertise: [],
    achievements: [],
    workExperience: [],
    availableForMentorship: true,
    mentorshipAreas: [],
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    profileImage: '',
    preferredCommunication: 'email',
    maxMentees: 3,
    availableForGuestLectures: false,
    availableForNetworking: false,
    availableForJobReferrals: false,
    isPublicProfile: true,
    showContactInfo: true,
  });

  const titleCase = (s: string) => s.toLowerCase().split(' ').filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  const normalizeTag = (raw: string) => {
    const v = raw.trim().toLowerCase();
    const corrections: Record<string, string> = {
      'machine liearing': 'Machine Learning',
      'machine learng': 'Machine Learning',
      'ml': 'Machine Learning',
      'ds': 'Data Science',
      'dsa': 'DSA',
      'ui ux': 'UI/UX',
      'uiux': 'UI/UX',
      'frontend': 'Frontend',
      'back-end': 'Backend',
      'node js': 'Node.js',
      'javascript': 'JavaScript',
      'react js': 'React',
    };
    if (corrections[v]) return corrections[v];
    return titleCase(raw.trim());
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/alumni-profile/profile');
      const data = (response as any)?.profile || (response as any);
      if (data) {
        // Parse work experience properly
        let workExp = [];
        try {
          if (Array.isArray(data.previousCompanies)) {
            workExp = data.previousCompanies;
          } else if (typeof data.previousCompanies === 'string') {
            workExp = JSON.parse(data.previousCompanies);
          }
        } catch {
          workExp = [];
        }

        setProfile(prev => ({
          ...prev,
          name: data.name || user?.name || prev.name,
          email: user?.email || prev.email,
          graduationYear: String(data.graduationYear || ''),
          degree: data.degree || prev.degree,
          major: data.major || prev.major,
          currentCompany: data.currentCompany || '',
          currentPosition: data.currentPosition || '',
          location: data.companyLocation || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          bio: data.bio || '',
          skills: Array.isArray(data.technicalSkills) ? data.technicalSkills : [],
          expertise: Array.isArray(data.expertiseAreas) ? data.expertiseAreas : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
          workExperience: workExp,
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          twitterUrl: data.twitterUrl || '',
          profileImage: data.profilePictureUrl || '',
          availableForMentorship: Boolean(data.isMentorAvailable),
          mentorshipAreas: Array.isArray(data.mentorshipAreas) ? data.mentorshipAreas : [],
          preferredCommunication: data.preferredCommunication || 'email',
          maxMentees: data.maxMentees ?? 3,
          availableForGuestLectures: Boolean(data.availableForGuestLectures),
          availableForNetworking: Boolean(data.availableForNetworking),
          availableForJobReferrals: Boolean(data.availableForJobReferrals),
          isPublicProfile: data.isPublicProfile !== false,
          showContactInfo: data.showContactInfo !== false,
        }));
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

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, profileImage: event.target?.result as string }));
        toast.success('Profile picture uploaded!');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Please upload an image file');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, profileImage: event.target?.result as string }));
        toast.success('Profile picture uploaded!');
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    const norm = normalizeTag(newSkill);
    if (norm && !profile.skills.map(s => s.toLowerCase()).includes(norm.toLowerCase())) {
      setProfile(prev => ({ ...prev, skills: [...prev.skills, norm] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addExpertise = () => {
    const norm = normalizeTag(newExpertise);
    if (norm && !profile.expertise.map(s => s.toLowerCase()).includes(norm.toLowerCase())) {
      setProfile(prev => ({ ...prev, expertise: [...prev.expertise, norm] }));
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

  const addMentorshipArea = () => {
    const norm = normalizeTag(newMentorshipArea);
    if (norm && !profile.mentorshipAreas.map(s => s.toLowerCase()).includes(norm.toLowerCase())) {
      setProfile(prev => ({ ...prev, mentorshipAreas: [...prev.mentorshipAreas, norm] }));
      setNewMentorshipArea('');
    }
  };

  const removeMentorshipArea = (area: string) => {
    setProfile(prev => ({ ...prev, mentorshipAreas: prev.mentorshipAreas.filter(a => a !== area) }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: ''
    };
    setProfile(prev => ({ ...prev, workExperience: [...prev.workExperience, newExp] }));
  };

  const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setProfile(prev => {
      const updated = [...prev.workExperience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, workExperience: updated };
    });
  };

  const removeWorkExperience = (index: number) => {
    setProfile(prev => ({ ...prev, workExperience: prev.workExperience.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        name: profile.name,
        currentCompany: profile.currentCompany,
        currentPosition: profile.currentPosition,
        companyLocation: profile.location,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        bio: profile.bio,
        technicalSkills: profile.skills,
        expertiseAreas: profile.expertise,
        achievements: profile.achievements,
        previousCompanies: profile.workExperience,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        twitterUrl: profile.twitterUrl,
        profilePictureUrl: profile.profileImage,
        isMentorAvailable: profile.availableForMentorship,
        mentorshipAreas: profile.mentorshipAreas,
        preferredCommunication: profile.preferredCommunication,
        maxMentees: profile.maxMentees,
        availableForGuestLectures: profile.availableForGuestLectures,
        availableForNetworking: profile.availableForNetworking,
        availableForJobReferrals: profile.availableForJobReferrals,
        isPublicProfile: profile.isPublicProfile,
        showContactInfo: profile.showContactInfo,
        graduationYear: profile.graduationYear ? Number(profile.graduationYear) : undefined,
        degree: profile.degree || undefined,
        program: profile.degree || undefined,
      };

      await apiClient.post('/alumni-profile/profile', payload);
      toast.success('Profile saved successfully!');
      // Add a small delay to ensure the profile is saved before navigating
      setTimeout(() => {
        navigate('/alumni-dashboard');
      }, 500);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/alumni-dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header Card */}
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="text-2xl">Alumni Profile</CardTitle>
              <CardDescription className="text-purple-100">
                Complete your professional profile to connect with students and alumni
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Picture Upload */}
                <div className="lg:col-span-1">
                  <Label>Profile Picture</Label>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                      isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                    }`}
                    onDrop={handleImageDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => document.getElementById('profile-image-input')?.click()}
                  >
                    {profile.profileImage ? (
                      <div className="relative">
                        <img src={profile.profileImage} alt="Profile" className="w-32 h-32 rounded-full mx-auto object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-0 right-1/4 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfile(prev => ({ ...prev, profileImage: '' }));
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>

                {/* Basic Info */}
                <div className="lg:col-span-2 space-y-4">
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
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        name="graduationYear"
                        type="number"
                        value={profile.graduationYear}
                        onChange={handleInputChange}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        name="degree"
                        value={profile.degree}
                        onChange={handleInputChange}
                        placeholder="MCA / MSCIT"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself, your journey, and what you're passionate about..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Position & Location */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Current Position & Location
              </CardTitle>
              <CardDescription>Your current work and location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentPosition">Current Position *</Label>
                  <Input
                    id="currentPosition"
                    name="currentPosition"
                    value={profile.currentPosition}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="currentCompany">Current Company *</Label>
                  <Input
                    id="currentCompany"
                    name="currentCompany"
                    value={profile.currentCompany}
                    onChange={handleInputChange}
                    placeholder="e.g., Google"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Company Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={profile.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Bangalore, India"
                  />
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-3">Your Current Residential Location *</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={profile.city || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g., Bangalore"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      value={profile.state || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="e.g., Karnataka"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      name="country"
                      value={profile.country || 'India'}
                      onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                      placeholder="e.g., India"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience Timeline */}
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Work Experience Timeline
                  </CardTitle>
                  <CardDescription>Add your professional journey</CardDescription>
                </div>
                <Button type="button" onClick={addWorkExperience} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {profile.workExperience.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No work experience added yet</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-blue-200 pl-8 space-y-8">
                    {profile.workExperience.map((exp, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                        <Card className="shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-muted-foreground">
                                  {exp.isCurrent ? 'Current Position' : 'Past Experience'}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeWorkExperience(index)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Company *</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                                  placeholder="Google"
                                />
                              </div>
                              <div>
                                <Label>Position *</Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => updateWorkExperience(index, 'position', e.target.value)}
                                  placeholder="Software Engineer"
                                />
                              </div>
                              <div>
                                <Label>Start Date</Label>
                                <Input
                                  type="month"
                                  value={exp.startDate}
                                  onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={exp.endDate}
                                  onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                                  disabled={exp.isCurrent}
                                />
                              </div>
                              <div className="md:col-span-2 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`current-${index}`}
                                  checked={exp.isCurrent}
                                  onChange={(e) => updateWorkExperience(index, 'isCurrent', e.target.checked)}
                                  className="h-4 w-4"
                                />
                                <Label htmlFor={`current-${index}`} className="cursor-pointer">Currently working here</Label>
                              </div>
                              <div className="md:col-span-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                                  placeholder="Describe your role and achievements..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Expertise */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Technical Skills</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g., Python, React"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
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

              <div>
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="e.g., Machine Learning, UI/UX"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  />
                  <Button type="button" onClick={addExpertise}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
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
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Achievements & Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
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
                  <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Award className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="flex-1 text-sm">{achievement}</span>
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
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Professional Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Mentorship Settings */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Mentorship Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {profile.availableForMentorship && (
                <div className="space-y-4 pl-4 border-l-2 border-green-200">
                  <div>
                    <Label>Mentorship Areas</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newMentorshipArea}
                        onChange={(e) => setNewMentorshipArea(e.target.value)}
                        placeholder="e.g., Career, DSA, Resume"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorshipArea())}
                      />
                      <Button type="button" onClick={addMentorshipArea}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.mentorshipAreas.map((area, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {area}
                          <button type="button" onClick={() => removeMentorshipArea(area)} className="ml-2 hover:text-red-600">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="availableForJobReferrals"
                        checked={!!profile.availableForJobReferrals}
                        onChange={(e) => setProfile(prev => ({ ...prev, availableForJobReferrals: e.target.checked }))}
                      />
                      <Label htmlFor="availableForJobReferrals">Available for Job Referrals</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="availableForGuestLectures"
                        checked={!!profile.availableForGuestLectures}
                        onChange={(e) => setProfile(prev => ({ ...prev, availableForGuestLectures: e.target.checked }))}
                      />
                      <Label htmlFor="availableForGuestLectures">Available for Guest Lectures</Label>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600">
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/alumni-dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
