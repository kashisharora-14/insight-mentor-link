
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
import { ArrowLeft, Plus, X, Briefcase, GraduationCap, Award, MapPin, Linkedin, Github, Twitter, Users, Sparkles } from 'lucide-react';
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
  location: string; // maps to companyLocation
  bio: string;
  skills: string[]; // maps to technicalSkills
  expertise: string[]; // maps to expertiseAreas
  achievements: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  profileImage?: string; // maps to profilePictureUrl
  // mentorship and visibility
  availableForMentorship: boolean; // maps to isMentorAvailable
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
    mentorshipAreas: [],
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    achievements: [],
    profileImage: '',
    preferredCommunication: 'email',
    maxMentees: 3,
    availableForGuestLectures: false,
    availableForNetworking: false,
    availableForJobReferrals: false,
    isPublicProfile: true,
    showContactInfo: true,
  });

  // normalization helpers
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
        setProfile(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: user?.email || prev.email,
          graduationYear: String(data.graduationYear || ''),
          degree: data.degree || prev.degree,
          major: data.major || prev.major,
          currentCompany: data.currentCompany || '',
          currentPosition: data.currentPosition || '',
          location: data.companyLocation || '',
          bio: data.bio || '',
          skills: data.technicalSkills || [],
          expertise: data.expertiseAreas || [],
          achievements: data.achievements || [],
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          twitterUrl: data.twitterUrl || '',
          profileImage: data.profilePictureUrl || '',
          availableForMentorship: Boolean(data.isMentorAvailable),
          mentorshipAreas: data.mentorshipAreas || [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Map UI state to backend payload
      const payload: any = {
        currentCompany: profile.currentCompany,
        currentPosition: profile.currentPosition,
        companyLocation: profile.location,
        bio: profile.bio,
        technicalSkills: profile.skills,
        expertiseAreas: profile.expertise,
        achievements: profile.achievements,
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
        batchType: undefined,
        industry: undefined,
        workType: undefined,
        yearsOfExperience: undefined,
      };

      await apiClient.post('/alumni-profile/profile', payload);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <Label htmlFor="graduationYear">Graduation Year (Optional)</Label>
                    <Input
                      id="graduationYear"
                      name="graduationYear"
                      type="number"
                      value={profile.graduationYear}
                      onChange={handleInputChange}
                      placeholder="2020"
                    />
                    <p className="text-xs text-muted-foreground mt-1">If you don't remember, you can skip this</p>
                  </div>

                  <div>
                    <Label htmlFor="degree">Degree (Optional)</Label>
                    <Input
                      id="degree"
                      name="degree"
                      value={profile.degree}
                      onChange={handleInputChange}
                      placeholder="MCA / MSCIT / Bachelor of Science"
                    />
                    <p className="text-xs text-muted-foreground mt-1">If you don't remember, you can skip this</p>
                  </div>

                  <div>
                    <Label htmlFor="major">Major (Optional)</Label>
                    <Input
                      id="major"
                      name="major"
                      value={profile.major}
                      onChange={handleInputChange}
                      placeholder="Computer Science"
                    />
                    <p className="text-xs text-muted-foreground mt-1">If you don't remember, you can skip this</p>
                  </div>

                  <div>
                    <Label htmlFor="location">Current Location</Label>
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

                {/* Mentorship Areas */}
                {profile.availableForMentorship && (
                  <div className="space-y-3">
                    <Label>Mentorship Areas</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newMentorshipArea}
                        onChange={(e) => setNewMentorshipArea(e.target.value)}
                        placeholder="Add an area (e.g., Career, DSA, Resume)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorshipArea())}
                      />
                      <Button type="button" onClick={addMentorshipArea}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                )}

                {/* Preferences */}
                {profile.availableForMentorship && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="preferredCommunication">Preferred Communication</Label>
                      <select
                        id="preferredCommunication"
                        className="w-full border rounded h-10 px-3"
                        value={profile.preferredCommunication}
                        onChange={(e) => setProfile(prev => ({ ...prev, preferredCommunication: e.target.value }))}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="chat">Chat</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="maxMentees">Max Mentees</Label>
                      <Input
                        id="maxMentees"
                        type="number"
                        min={1}
                        value={profile.maxMentees}
                        onChange={(e) => setProfile(prev => ({ ...prev, maxMentees: Number(e.target.value || 0) }))}
                        placeholder="3"
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <input
                        type="checkbox"
                        id="availableForJobReferrals"
                        checked={!!profile.availableForJobReferrals}
                        onChange={(e) => setProfile(prev => ({ ...prev, availableForJobReferrals: e.target.checked }))}
                      />
                      <Label htmlFor="availableForJobReferrals">Available for Job Referrals</Label>
                    </div>
                  </div>
                )}

                {profile.availableForMentorship && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="availableForGuestLectures"
                        checked={!!profile.availableForGuestLectures}
                        onChange={(e) => setProfile(prev => ({ ...prev, availableForGuestLectures: e.target.checked }))}
                      />
                      <Label htmlFor="availableForGuestLectures">Available for Guest Lectures</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="availableForNetworking"
                        checked={!!profile.availableForNetworking}
                        onChange={(e) => setProfile(prev => ({ ...prev, availableForNetworking: e.target.checked }))}
                      />
                      <Label htmlFor="availableForNetworking">Available for Networking</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Visibility & Profile Picture */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Visibility</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                    <input
                      type="checkbox"
                      id="isPublicProfile"
                      checked={!!profile.isPublicProfile}
                      onChange={(e) => setProfile(prev => ({ ...prev, isPublicProfile: e.target.checked }))}
                    />
                    <div>
                      <Label htmlFor="isPublicProfile">Public Profile</Label>
                      <p className="text-xs text-muted-foreground">Show in the Alumni Directory</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                    <input
                      type="checkbox"
                      id="showContactInfo"
                      checked={!!profile.showContactInfo}
                      onChange={(e) => setProfile(prev => ({ ...prev, showContactInfo: e.target.checked }))}
                    />
                    <div>
                      <Label htmlFor="showContactInfo">Show Contact Info</Label>
                      <p className="text-xs text-muted-foreground">Allow students to see your email/phone</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="profileImage">Profile Picture (optional)</Label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    value={profile.profileImage}
                    onChange={handleInputChange}
                    placeholder="https://.../your-photo.jpg"
                  />
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

              {/* Live Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Preview</h3>
                <div className="rounded-xl border shadow-elegant p-6 bg-white">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt={profile.name || 'Profile'} className="w-16 h-16 rounded-full object-cover" />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(profile.name || '?').split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{profile.name || 'Your Name'}</h3>
                      <div className="text-xs text-muted-foreground">
                        {profile.degree ? `${profile.degree} • ` : ''}{profile.graduationYear || 'Year'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3 text-sm text-muted-foreground">
                    {profile.currentPosition && (
                      <div className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-primary" />{profile.currentPosition}</div>
                    )}
                    {profile.currentCompany && (
                      <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-primary" />{profile.currentCompany}{profile.location ? ` • ${profile.location}` : ''}</div>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{profile.bio}</p>
                  )}

                  {profile.expertise?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Expertise:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.expertise.slice(0, 3).map((a, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                        ))}
                        {profile.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{profile.expertise.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.availableForMentorship && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white gap-1">
                        <Users className="w-3 h-3" /> Mentor
                      </Badge>
                    )}
                    {profile.availableForJobReferrals && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-1">
                        <Briefcase className="w-3 h-3" /> Referrals
                      </Badge>
                    )}
                    {profile.availableForGuestLectures && (
                      <Badge className="bg-purple-500 hover:bg-purple-600 text-white gap-1">
                        <Award className="w-3 h-3" /> Lectures
                      </Badge>
                    )}
                    {profile.availableForNetworking && (
                      <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-1">
                        <Sparkles className="w-3 h-3" /> Networking
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
