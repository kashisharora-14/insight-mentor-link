import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { toast } from '../components/ui/use-toast'
import { Loader2, Save, ArrowLeft } from 'lucide-react'

export default function StudentProfileForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    rollNumber: '',
    program: '',
    batchType: '',
    currentYear: '',
    currentSemester: '',
    batchYear: '',
    cgpa: '',
    currentBacklog: '0',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    category: '',
    nationality: 'Indian',
    religion: '',
    phoneNumber: '',
    alternateEmail: '',
    permanentAddress: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    admissionType: '',
    scholarshipStatus: '',
    hostelResident: false,
    hostelRoomNumber: '',
    transportMode: '',
    technicalSkills: '',
    softSkills: '',
    interests: '',
    careerGoals: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      // Corrected to use 'authToken' as per the thinking
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/student-profile/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setFormData({
            rollNumber: data.profile.rollNumber || '',
            program: data.profile.program || '',
            batchType: data.profile.batchType || '',
            currentYear: data.profile.currentYear?.toString() || '',
            currentSemester: data.profile.currentSemester?.toString() || '',
            batchYear: data.profile.batchYear?.toString() || '',
            cgpa: data.profile.cgpa || '',
            currentBacklog: data.profile.currentBacklog?.toString() || '0',
            dateOfBirth: data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '',
            gender: data.profile.gender || '',
            bloodGroup: data.profile.bloodGroup || '',
            category: data.profile.category || '',
            nationality: data.profile.nationality || 'Indian',
            religion: data.profile.religion || '',
            phoneNumber: data.profile.phoneNumber || '',
            alternateEmail: data.profile.alternateEmail || '',
            permanentAddress: data.profile.permanentAddress || '',
            currentAddress: data.profile.currentAddress || '',
            city: data.profile.city || '',
            state: data.profile.state || '',
            pincode: data.profile.pincode || '',
            admissionType: data.profile.admissionType || '',
            scholarshipStatus: data.profile.scholarshipStatus || '',
            hostelResident: data.profile.hostelResident || false,
            hostelRoomNumber: data.profile.hostelRoomNumber || '',
            transportMode: data.profile.transportMode || '',
            technicalSkills: data.profile.technicalSkills?.join(', ') || '',
            softSkills: data.profile.softSkills?.join(', ') || '',
            interests: data.profile.interests?.join(', ') || '',
            careerGoals: data.profile.careerGoals || '',
            linkedinUrl: data.profile.linkedinUrl || '',
            githubUrl: data.profile.githubUrl || '',
            portfolioUrl: data.profile.portfolioUrl || '',
          })
        }
      } else if (response.status === 401) {
        console.error('❌ Token is invalid or expired during fetch');
        localStorage.removeItem('authToken'); // Corrected to remove 'authToken'
        localStorage.removeItem('user');
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        });
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: 'Error',
        description: 'Could not load profile data. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Use setLoading for the submit button

    try {
      // Corrected to use 'authToken' as per the thinking
      const token = localStorage.getItem('authToken');

      if (!token || token === 'null' || token === 'undefined') {
        console.error('❌ No valid token found');
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      console.log('✅ Submitting profile data with valid token');
      // Convert form data to match backend expectations
      const submitData = {
        ...formData,
        currentYear: formData.currentYear ? parseInt(formData.currentYear) : undefined,
        currentSemester: formData.currentSemester ? parseInt(formData.currentSemester) : undefined,
        batchYear: formData.batchYear ? parseInt(formData.batchYear) : undefined,
        currentBacklog: formData.currentBacklog ? parseInt(formData.currentBacklog) : 0,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : undefined,
        technicalSkills: formData.technicalSkills ? formData.technicalSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        softSkills: formData.softSkills ? formData.softSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: formData.interests ? formData.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
      }

      console.log('Submitting profile data:', submitData)

      // Updated to use the corrected token retrieval logic
      const tokenForSubmit = localStorage.getItem('authToken');
      if (!tokenForSubmit) {
        console.error('❌ No authentication token found for submission');
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const response = await fetch('/api/student-profile/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenForSubmit}`,
        },
        body: JSON.stringify(submitData),
      });


      if (response.status === 401) {
        console.error('❌ Token is invalid or expired');
        localStorage.removeItem('authToken'); // Corrected to remove 'authToken'
        localStorage.removeItem('user');
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save profile');
      }

      const result = await response.json();
      console.log('✅ Profile saved successfully:', result);

      toast({
        title: 'Success',
        description: 'Profile saved successfully',
      })
      navigate('/student-dashboard')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Error',
        description: 'An error occurred while saving your profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/student-dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
            <CardDescription>
              Fill in your details for Panjab University CS Department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rollNumber">Roll Number *</Label>
                    <Input
                      id="rollNumber"
                      value={formData.rollNumber}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      placeholder="e.g., MCA/M/2024/001"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="program">Program *</Label>
                    <Select value={formData.program} onValueChange={(value) => handleInputChange('program', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="MSCIT">MSCIT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="batchType">Batch Type *</Label>
                    <Select value={formData.batchType} onValueChange={(value) => handleInputChange('batchType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currentYear">Current Year *</Label>
                    <Select value={formData.currentYear} onValueChange={(value) => handleInputChange('currentYear', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currentSemester">Current Semester *</Label>
                    <Select value={formData.currentSemester} onValueChange={(value) => handleInputChange('currentSemester', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="batchYear">Batch Year (Graduation) *</Label>
                    <Input
                      id="batchYear"
                      type="number"
                      value={formData.batchYear}
                      onChange={(e) => handleInputChange('batchYear', e.target.value)}
                      placeholder="e.g., 2026"
                      min="2020"
                      max="2030"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      value={formData.cgpa}
                      onChange={(e) => handleInputChange('cgpa', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      max="10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentBacklog">Current Backlog</Label>
                    <Input
                      id="currentBacklog"
                      type="number"
                      value={formData.currentBacklog}
                      onChange={(e) => handleInputChange('currentBacklog', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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

                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
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

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="ST">ST</SelectItem>
                        <SelectItem value="OBC">OBC</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleInputChange('nationality', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="religion">Religion</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => handleInputChange('religion', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <p className="text-sm text-muted-foreground">Your contact details</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="10-digit number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="alternateEmail">Alternate Email</Label>
                    <Input
                      id="alternateEmail"
                      type="email"
                      value={formData.alternateEmail}
                      onChange={(e) => handleInputChange('alternateEmail', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="permanentAddress">Permanent Address</Label>
                    <Textarea
                      id="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="currentAddress">Current Address</Label>
                    <Textarea
                      id="currentAddress"
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills & Social Links</h3>
                <p className="text-sm text-muted-foreground">Showcase your technical skills and professional profiles</p>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="technicalSkills">Technical Skills (comma-separated)</Label>
                    <Input
                      id="technicalSkills"
                      value={formData.technicalSkills}
                      onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                      placeholder="Python, Java, React, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={formData.githubUrl}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </div>

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
  )
}