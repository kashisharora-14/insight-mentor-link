import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// import { supabase } from '@/integrations/supabase/client'; // Replaced with API client
import { User, Building, Calendar, LinkedinIcon, Phone, Mail, Edit3, Save, X } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  graduation_year?: number;
  department?: string;
  current_job?: string;
  company?: string;
  skills?: string[];
  linkedin_profile?: string;
  phone?: string;
  bio?: string;
  is_verified: boolean;
  is_mentor_available: boolean;
}

const AlumniProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } else if (data) {
      setProfile(data);
      setEditData(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const dataToSave = {
        ...editData,
        user_id: user.id,
        email: user.email,
        name: editData.name || user.name || '',
        role: editData.role || 'student',
      };

      let result;
      if (profile) {
        const { data, error } = await supabase
          .from('profiles')
          .update(dataToSave)
          .eq('user_id', user.id)
          .select()
          .single();
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .insert(dataToSave)
          .select()
          .single();
        result = { data, error };
      }

      if (result.error) throw result.error;

      setProfile(result.data);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !editData.skills?.includes(newSkill)) {
      setEditData({
        ...editData,
        skills: [...(editData.skills || []), newSkill]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditData({
      ...editData,
      skills: editData.skills?.filter(skill => skill !== skillToRemove)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditData(profile || {});
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {!profile && !isEditing ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
              <p className="text-muted-foreground mb-6">
                Create your profile to connect with other alumni and access mentorship opportunities.
              </p>
              <Button onClick={() => setIsEditing(true)}>Create Profile</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                {profile?.is_verified && (
                  <Badge className="w-fit">Verified</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile?.name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-foreground">{profile?.email || user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground">{profile?.phone || 'Not provided'}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    {isEditing ? (
                      <select
                        id="role"
                        value={editData.role || ''}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="w-full p-2 border border-border rounded-md bg-background"
                      >
                        <option value="">Select role</option>
                        <option value="student">Student</option>
                        <option value="alumni">Alumni</option>
                      </select>
                    ) : (
                      <Badge variant="secondary">{profile?.role || 'Not specified'}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={editData.department || ''}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        placeholder="e.g., Computer Science"
                      />
                    ) : (
                      <p className="text-foreground">{profile?.department || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    {isEditing ? (
                      <Input
                        id="graduation_year"
                        type="number"
                        value={editData.graduation_year || ''}
                        onChange={(e) => setEditData({ ...editData, graduation_year: parseInt(e.target.value) })}
                        placeholder="e.g., 2020"
                      />
                    ) : (
                      <p className="text-foreground">{profile?.graduation_year || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="current_job">Current Position</Label>
                    {isEditing ? (
                      <Input
                        id="current_job"
                        value={editData.current_job || ''}
                        onChange={(e) => setEditData({ ...editData, current_job: e.target.value })}
                        placeholder="e.g., Software Engineer"
                      />
                    ) : (
                      <p className="text-foreground">{profile?.current_job || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={editData.company || ''}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        placeholder="e.g., Google"
                      />
                    ) : (
                      <p className="text-foreground">{profile?.company || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin_profile"
                      value={editData.linkedin_profile || ''}
                      onChange={(e) => setEditData({ ...editData, linkedin_profile: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <LinkedinIcon className="w-4 h-4 text-muted-foreground" />
                      {profile?.linkedin_profile ? (
                        <a href={profile.linkedin_profile} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {profile.linkedin_profile}
                        </a>
                      ) : (
                        <p className="text-foreground">Not provided</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isEditing ? editData.skills : profile?.skills)?.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  )) || <p className="text-muted-foreground">No skills added yet</p>}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill}>Add</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <p className="text-foreground">{profile?.bio || 'No bio provided'}</p>
                )}
              </CardContent>
            </Card>

            {/* Mentorship Availability */}
            {profile?.role === 'alumni' && (
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship</CardTitle>
                  <CardDescription>Make yourself available as a mentor to help students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_mentor_available"
                      checked={isEditing ? editData.is_mentor_available : profile.is_mentor_available}
                      onCheckedChange={(checked) => 
                        isEditing && setEditData({ ...editData, is_mentor_available: !!checked })
                      }
                      disabled={!isEditing}
                    />
                    <Label htmlFor="is_mentor_available">Available as a mentor</Label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniProfile;