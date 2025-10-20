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

const studentProfileSchema = z.object({
  // Academic Information - Punjab University CS Department
  rollNumber: z.string().min(1, "Roll number is required"),
  program: z.enum(["MCA", "MSCIT"], { required_error: "Program is required" }),
  batchType: z.enum(["Morning", "Evening"], { required_error: "Batch type is required" }),
  currentYear: z.enum(["1", "2"], { required_error: "Current year is required" }),
  batchYear: z.string().min(4, "Batch/Graduation year is required"),
  currentSemester: z.enum(["1", "2", "3", "4"], { required_error: "Current semester is required" }),
  cgpa: z.string().optional(),
  currentBacklog: z.string().default("0"),
  
  // Personal Details
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().min(1, "Blood group is required"),
  category: z.string().min(1, "Category is required"),
  nationality: z.string().default("Indian"),
  religion: z.string().optional(),
  
  // Contact Information
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  alternateEmail: z.string().email("Invalid email").optional().or(z.literal('')),
  permanentAddress: z.string().min(1, "Permanent address is required"),
  currentAddress: z.string().min(1, "Current address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be at least 6 digits"),
  
  // Parent/Guardian Information
  fatherName: z.string().min(1, "Father's name is required"),
  fatherOccupation: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherName: z.string().min(1, "Mother's name is required"),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  
  // Additional Information
  admissionType: z.string().optional(),
  scholarshipStatus: z.string().optional(),
  hostelResident: z.boolean().default(false),
  hostelRoomNumber: z.string().optional(),
  transportMode: z.string().optional(),
  
  // Career Goals
  careerGoals: z.string().min(50, "Please provide your career goals (at least 50 characters)").optional(),
  
  // Social Links
  linkedinUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
  githubUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
  portfolioUrl: z.string().url("Invalid URL").or(z.literal('')).optional(),
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

interface StudentProfileFormProps {
  onSuccess?: () => void;
}

export function StudentProfileForm({ onSuccess }: StudentProfileFormProps) {
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentTechSkill, setCurrentTechSkill] = useState('');
  const [currentSoftSkill, setCurrentSoftSkill] = useState('');
  const [currentInterest, setCurrentInterest] = useState('');
  const [loading, setLoading] = useState(false);

  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      program: undefined,
      batchType: undefined,
      currentYear: undefined,
      currentSemester: undefined,
      nationality: "Indian",
      currentBacklog: "0",
      hostelResident: false,
    },
  });

  const addTechSkill = () => {
    if (currentTechSkill.trim() && !technicalSkills.includes(currentTechSkill.trim())) {
      setTechnicalSkills([...technicalSkills, currentTechSkill.trim()]);
      setCurrentTechSkill('');
    }
  };

  const removeTechSkill = (skillToRemove: string) => {
    setTechnicalSkills(technicalSkills.filter(s => s !== skillToRemove));
  };

  const addSoftSkill = () => {
    if (currentSoftSkill.trim() && !softSkills.includes(currentSoftSkill.trim())) {
      setSoftSkills([...softSkills, currentSoftSkill.trim()]);
      setCurrentSoftSkill('');
    }
  };

  const removeSoftSkill = (skillToRemove: string) => {
    setSoftSkills(softSkills.filter(s => s !== skillToRemove));
  };

  const addInterest = () => {
    if (currentInterest.trim() && !interests.includes(currentInterest.trim())) {
      setInterests([...interests, currentInterest.trim()]);
      setCurrentInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const onSubmit = async (values: StudentProfileFormValues) => {
    setLoading(true);
    try {
      const profileData = {
        ...values,
        technicalSkills,
        softSkills,
        interests,
        currentYear: parseInt(values.currentYear),
        batchYear: parseInt(values.batchYear),
        currentSemester: parseInt(values.currentSemester),
        cgpa: values.cgpa ? parseFloat(values.cgpa) : null,
        currentBacklog: parseInt(values.currentBacklog),
      };

      const response = await fetch('/api/student/profile', {
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
            <CardDescription>Your current academic details at Punjab University CS Department</CardDescription>
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
                name="currentYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Year *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">First Year</SelectItem>
                        <SelectItem value="2">Second Year</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch/Graduation Year *</FormLabel>
                    <FormControl>
                      <Input type="number" min="2020" max="2035" placeholder="2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentSemester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Semester *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                        <SelectItem value="3">Semester 3</SelectItem>
                        <SelectItem value="4">Semester 4</SelectItem>
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="currentBacklog"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Backlog *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
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
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                          <SelectItem key={bg} value={bg}>
                            {bg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["General", "SC", "ST", "OBC", "Other"].map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Your contact details and address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your permanent residential address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

        {/* Parent/Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle>Parent/Guardian Information</CardTitle>
            <CardDescription>Information about your parents or guardian</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherOccupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Occupation (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherOccupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Occupation (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motherPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother's Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guardianPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guardian Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Other details about your academic life</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="admissionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Type (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select admission type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Management Quota">Management Quota</SelectItem>
                        <SelectItem value="NRI Quota">NRI Quota</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scholarshipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scholarship Status (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scholarship status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Merit Scholarship">Merit Scholarship</SelectItem>
                        <SelectItem value="Need-based">Need-based</SelectItem>
                        <SelectItem value="Government Scholarship">Government Scholarship</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transportMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transport Mode (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select transport mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Own Vehicle">Own Vehicle</SelectItem>
                        <SelectItem value="Public Transport">Public Transport</SelectItem>
                        <SelectItem value="University Bus">University Bus</SelectItem>
                        <SelectItem value="Walking">Walking</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hostelResident"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Hostel Resident</FormLabel>
                    <FormDescription>
                      Are you living in university hostel?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('hostelResident') && (
              <FormField
                control={form.control}
                name="hostelRoomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hostel Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Room 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Skills and Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
            <CardDescription>Your technical skills, soft skills, and areas of interest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <FormLabel>Technical Skills</FormLabel>
              <FormDescription>e.g., Python, Java, React, Machine Learning</FormDescription>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentTechSkill}
                  onChange={(e) => setCurrentTechSkill(e.target.value)}
                  placeholder="Add a technical skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechSkill())}
                />
                <Button type="button" onClick={addTechSkill} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {technicalSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeTechSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Soft Skills</FormLabel>
              <FormDescription>e.g., Communication, Leadership, Teamwork</FormDescription>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentSoftSkill}
                  onChange={(e) => setCurrentSoftSkill(e.target.value)}
                  placeholder="Add a soft skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                />
                <Button type="button" onClick={addSoftSkill} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {softSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeSoftSkill(skill)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <FormLabel>Interests</FormLabel>
              <FormDescription>e.g., Web Development, Data Science, Mobile Apps</FormDescription>
              <div className="flex gap-2 mt-2">
                <Input
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                />
                <Button type="button" onClick={addInterest} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                    <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="careerGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Career Goals (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your career goals and aspirations (min 50 characters)"
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This helps alumni mentors understand your aspirations</FormDescription>
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
            <CardDescription>Connect your professional profiles (Optional)</CardDescription>
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

        <div className="flex justify-end gap-4">
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Submitting..." : "Submit Profile for Verification"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
