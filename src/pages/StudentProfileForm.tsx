
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
import { Loader2, Save, User, GraduationCap, Phone, Home, Users } from 'lucide-react';
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
    currentBacklog: 0,
    
    // Personal Details
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    category: '',
    nationality: 'Indian',
    religion: '',
    
    // Contact Information
    phoneNumber: '',
    alternateEmail: '',
    permanentAddress: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    
    // Parent Information
    fatherName: '',
    fatherOccupation: '',
    fatherPhone: '',
    motherName: '',
    motherOccupation: '',
    motherPhone: '',
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    
    // Additional Information
    admissionType: '',
    scholarshipStatus: '',
    hostelResident: false,
    hostelRoomNumber: '',
    transportMode: '',
    
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
            ...data.profile,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student-profile/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message || 'Profile saved successfully!',
        });
        // Redirect to student dashboard after a short delay
        setTimeout(() => {
          navigate('/student-dashboard');
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                <TabsList className="grid w-full grid-cols-5">
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
                  <TabsTrigger value="family">
                    <Users className="w-4 h-4 mr-2" />
                    Family
                  </TabsTrigger>
                  <TabsTrigger value="additional">
                    <Home className="w-4 h-4 mr-2" />
                    Additional
                  </TabsTrigger>
                </TabsList>

                {/* Academic Information */}
                <TabsContent value="academic" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rollNumber">Roll Number</Label>
                      <Input
                        id="rollNumber"
                        value={formData.rollNumber}
                        onChange={(e) => handleChange('rollNumber', e.target.value)}
                        placeholder="e.g., CS2021001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={formData.department} onValueChange={(v) => handleChange('department', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchYear">Batch Year</Label>
                      <Input
                        id="batchYear"
                        type="number"
                        value={formData.batchYear}
                        onChange={(e) => handleChange('batchYear', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentSemester">Current Semester</Label>
                      <Select value={formData.currentSemester.toString()} onValueChange={(v) => handleChange('currentSemester', parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                            <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                          ))}
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
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentBacklog">Current Backlogs</Label>
                      <Input
                        id="currentBacklog"
                        type="number"
                        value={formData.currentBacklog}
                        onChange={(e) => handleChange('currentBacklog', parseInt(e.target.value))}
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
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Select value={formData.bloodGroup} onValueChange={(v) => handleChange('bloodGroup', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="General">General</SelectItem>
                          <SelectItem value="OBC">OBC</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="ST">ST</SelectItem>
                          <SelectItem value="EWS">EWS</SelectItem>
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
                      <Label htmlFor="permanentAddress">Permanent Address</Label>
                      <Textarea
                        id="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={(e) => handleChange('permanentAddress', e.target.value)}
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
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Family Information */}
                <TabsContent value="family" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) => handleChange('fatherName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherOccupation">Father's Occupation</Label>
                      <Input
                        id="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fatherPhone">Father's Phone</Label>
                      <Input
                        id="fatherPhone"
                        type="tel"
                        value={formData.fatherPhone}
                        onChange={(e) => handleChange('fatherPhone', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        value={formData.motherName}
                        onChange={(e) => handleChange('motherName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherOccupation">Mother's Occupation</Label>
                      <Input
                        id="motherOccupation"
                        value={formData.motherOccupation}
                        onChange={(e) => handleChange('motherOccupation', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherPhone">Mother's Phone</Label>
                      <Input
                        id="motherPhone"
                        type="tel"
                        value={formData.motherPhone}
                        onChange={(e) => handleChange('motherPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Additional Information */}
                <TabsContent value="additional" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admissionType">Admission Type</Label>
                      <Select value={formData.admissionType} onValueChange={(v) => handleChange('admissionType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select admission type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Merit">Merit</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                          <SelectItem value="Lateral Entry">Lateral Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scholarshipStatus">Scholarship Status</Label>
                      <Input
                        id="scholarshipStatus"
                        value={formData.scholarshipStatus}
                        onChange={(e) => handleChange('scholarshipStatus', e.target.value)}
                        placeholder="e.g., Merit Scholarship, None"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="careerGoals">Career Goals</Label>
                      <Textarea
                        id="careerGoals"
                        value={formData.careerGoals}
                        onChange={(e) => handleChange('careerGoals', e.target.value)}
                        placeholder="Describe your career aspirations..."
                      />
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
