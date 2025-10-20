import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const alumniProfileSchema = z.object({
  // Academic Information
  rollNumber: z.string().min(1, "Roll number is required"),
  program: z.enum(["MCA", "MSCIT"], { required_error: "Program is required" }),
  batchType: z.enum(["Morning", "Evening"], { required_error: "Batch type is required" }),
  graduationYear: z.string().min(4, "Graduation year is required"),
  admissionYear: z.string().min(4, "Admission year is required"),
  cgpa: z.string().optional(),
  
  // Personal Details
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  alternateEmail: z.string().email("Invalid email").optional().or(z.literal('')),
  currentAddress: z.string().min(1, "Current address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().default("India"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  
  // Professional Information
  currentPosition: z.string().min(1, "Current position is required"),
  currentCompany: z.string().min(1, "Current company is required"),
  companyLocation: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  workType: z.enum(["Remote", "Hybrid", "On-site"], { required_error: "Work type is required" }),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
  
  // Mentorship Preferences
  isMentorAvailable: z.boolean().default(false),
  availableForJobReferrals: z.boolean().default(false),
  availableForGuestLectures: z.boolean().default(false),
  availableForNetworking: z.boolean().default(false),
  preferredCommunication: z.enum(["Email", "Phone", "LinkedIn", "WhatsApp"]).optional(),
  maxMentees: z.string().optional(),
  
  // Profile Content
  bio: z.string().min(50, "Bio must be at least 50 characters").max(500),
  careerJourney: z.string().min(100, "Career journey must be at least 100 characters").optional(),
  adviceForStudents: z.string().optional(),
  
  // Social Links
  linkedinUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
  githubUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
  portfolioUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
  
  // Profile Visibility
  isPublicProfile: z.boolean().default(true),
  showContactInfo: z.boolean().default(true),
});

type AlumniProfileFormValues = z.infer<typeof alumniProfileSchema>;

interface AlumniProfileFormProps {
  onSuccess?: () => void;
}

export function AlumniProfileForm({ onSuccess }: AlumniProfileFormProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([]);
  const [mentorshipAreas, setMentorshipAreas] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentExpertise, setCurrentExpertise] = useState('');
  const [currentMentorshipArea, setCurrentMentorshipArea] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<AlumniProfileFormValues>({
    resolver: zodResolver(alumniProfileSchema),
    defaultValues: {
      program: undefined,
      batchType: undefined,
      country: "India",
      workType: undefined,
      isMentorAvailable: false,
      availableForJobReferrals: false,
      availableForGuestLectures: false,
      availableForNetworking: false,
      isPublicProfile: true,
      showContactInfo: true,
    },
  });

  const addSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addExpertise = () => {
    if (currentExpertise.trim() && !expertiseAreas.includes(currentExpertise.trim())) {
      setExpertiseAreas([...expertiseAreas, currentExpertise.trim()]);
      setCurrentExpertise('');
    }
  };

  const removeExpertise = (expertiseToRemove: string) => {
    setExpertiseAreas(expertiseAreas.filter(e => e !== expertiseToRemove));
  };

  const addMentorshipArea = () => {
    if (currentMentorshipArea.trim() && !mentorshipAreas.includes(currentMentorshipArea.trim())) {
      setMentorshipAreas([...mentorshipAreas, currentMentorshipArea.trim()]);
      setCurrentMentorshipArea('');
    }
  };

  const removeMentorshipArea = (areaToRemove: string) => {
    setMentorshipAreas(mentorshipAreas.filter(a => a !== areaToRemove));
  };

  const onSubmit = async (values: AlumniProfileFormValues) => {
    setLoading(true);
    try {
      const profileData = {
        ...values,
        technicalSkills: skills,
        expertiseAreas: expertiseAreas,
        mentorshipAreas: form.watch('isMentorAvailable') ? mentorshipAreas : [],
        graduationYear: parseInt(values.graduationYear),
        admissionYear: parseInt(values.admissionYear),
        yearsOfExperience: parseInt(values.yearsOfExperience),
        maxMentees: values.maxMentees ? parseInt(values.maxMentees) : 3,
        cgpa: values.cgpa ? parseFloat(values.cgpa) : null,
      };

      const response = await fetch('/api/alumni/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success("Profile submitted successfully! Waiting for admin verification.");
        if (onSuccess) onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit profile');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Your educational background at Punjab University</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rollNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your roll number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select program" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="MSCIT">MSCIT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="graduationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Graduation Year *</FormLabel>
                    <FormControl>
                      <Input type="number" min="2000" max="2030" placeholder="2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admissionYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Year *</FormLabel>
                    <FormControl>
                      <Input type="number" min="2000" max="2030" placeholder="2022" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CGPA (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" max="10" placeholder="8.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Basic personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alternateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="personal@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your current residential address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Chandigarh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="Punjab" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode *</FormLabel>
                    <FormControl>
                      <Input placeholder="160014" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Your current career and work experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Position *</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company *</FormLabel>
                    <FormControl>
                      <Input placeholder="Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Bangalore, India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Software Development">Software Development</SelectItem>
                        <SelectItem value="Data Science & AI">Data Science & AI</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                        <SelectItem value="Finance & Banking">Finance & Banking</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="On-site">On-site</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="50" placeholder="3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills & Expertise */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>Your technical skills and areas of expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Technical Skills *</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="e.g., JavaScript, Python, React"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Expertise Areas *</FormLabel>
              <FormDescription>e.g., Web Development, Machine Learning, Cloud Computing</FormDescription>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentExpertise}
                  onChange={(e) => setCurrentExpertise(e.target.value)}
                  placeholder="Add expertise area"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                />
                <Button type="button" onClick={addExpertise} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {expertiseAreas.map((expertise) => (
                  <Badge key={expertise} variant="secondary">
                    {expertise}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeExpertise(expertise)} />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentorship & Availability */}
        <Card>
          <CardHeader>
            <CardTitle>Mentorship & Availability</CardTitle>
            <CardDescription>How you'd like to help students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isMentorAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available for Mentorship</FormLabel>
                    <FormDescription>
                      Willing to guide and mentor students
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('isMentorAvailable') && (
              <div className="space-y-4 ml-4 border-l-2 pl-4">
                <div>
                  <FormLabel>Mentorship Areas *</FormLabel>
                  <FormDescription>What areas can you mentor students in?</FormDescription>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={currentMentorshipArea}
                      onChange={(e) => setCurrentMentorshipArea(e.target.value)}
                      placeholder="e.g., Career Guidance, Interview Prep, Technical Skills"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMentorshipArea())}
                    />
                    <Button type="button" onClick={addMentorshipArea} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {mentorshipAreas.map((area) => (
                      <Badge key={area} variant="secondary">
                        {area}
                        <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeMentorshipArea(area)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredCommunication"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Communication</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxMentees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Mentees</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" placeholder="3" {...field} />
                        </FormControl>
                        <FormDescription>How many students can you mentor?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="availableForJobReferrals"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available for Job Referrals</FormLabel>
                    <FormDescription>
                      Help students get referrals at your company
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableForGuestLectures"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available for Guest Lectures</FormLabel>
                    <FormDescription>
                      Willing to conduct sessions for students
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableForNetworking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available for Networking</FormLabel>
                    <FormDescription>
                      Open to connect and network with students
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Profile Content */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Content</CardTitle>
            <CardDescription>Share your story and advice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write a brief professional summary (50-500 characters)"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This will appear on your public profile</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="careerJourney"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Journey (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Share your career story, challenges, and achievements (min 100 characters)"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Inspire students with your journey</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adviceForStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advice for Students (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What advice would you give to current students?"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social & Professional Links</CardTitle>
            <CardDescription>Connect your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub Profile URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/your-username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio/Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-portfolio.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>Control your profile visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="isPublicProfile"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Profile</FormLabel>
                    <FormDescription>
                      Make your profile visible in the Alumni Directory
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showContactInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Show Contact Information</FormLabel>
                    <FormDescription>
                      Allow students to see your phone and email
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit Profile for Verification"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
