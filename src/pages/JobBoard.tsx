
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/apiClient';
import { Briefcase, MapPin, Clock, DollarSign, Plus, ExternalLink, Search, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Navigation from '@/components/ui/navigation';

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  companyLogo: string;
  location: string;
  jobType: string;
  salaryRange: string;
  requirements: string[];
  applicationLink: string;
  referralAvailable: boolean;
  experienceRequired: string;
  skills: string[];
  status: string;
  postedByRole: string;
  postedByName: string;
  postedByEmail: string;
  expiresAt: string;
  createdAt: string;
}

interface ReferralRequest {
  id: string;
  jobId: string;
  status: string;
  message: string;
  responseMessage: string;
  createdAt: string;
  jobTitle?: string;
  jobCompany?: string;
  studentName?: string;
  studentEmail?: string;
  studentProfile?: any;
  alumniName?: string;
  alumniEmail?: string;
}

const JobBoard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [referralRequests, setReferralRequests] = useState<ReferralRequest[]>([]);
  const [myApplications, setMyApplications] = useState<ReferralRequest[]>([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    companyLogo: '',
    location: '',
    jobType: 'full-time',
    salaryRange: '',
    requirements: '',
    applicationLink: '',
    referralAvailable: false,
    experienceRequired: '',
    skills: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'alumni') {
      fetchReferralRequests();
    }
    if (user?.role === 'student') {
      fetchMyApplications();
    }
  }, [user]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedJobType]);

  const fetchJobs = async () => {
    try {
      const data = await apiClient.get<Job[]>('/jobs');
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchReferralRequests = async () => {
    try {
      const data = await apiClient.get<ReferralRequest[]>('/jobs/referral-requests/my-requests');
      setReferralRequests(data || []);
    } catch (error) {
      console.error('Error fetching referral requests:', error);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const data = await apiClient.get<ReferralRequest[]>('/jobs/referral-requests/my-applications');
      setMyApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedJobType !== 'all') {
      filtered = filtered.filter(job => job.jobType === selectedJobType);
    }

    setFilteredJobs(filtered);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to post a job.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiClient.post('/jobs', {
        ...newJob,
        requirements: newJob.requirements.split(',').map(req => req.trim()).filter(Boolean),
        skills: newJob.skills.split(',').map(skill => skill.trim()).filter(Boolean),
      });

      toast({
        title: "Job posted successfully!",
        description: user.role === 'admin' 
          ? "Job is now live." 
          : "Job submitted for admin approval.",
      });

      setIsPostDialogOpen(false);
      setNewJob({
        title: '',
        description: '',
        company: '',
        companyLogo: '',
        location: '',
        jobType: 'full-time',
        salaryRange: '',
        requirements: '',
        applicationLink: '',
        referralAvailable: false,
        experienceRequired: '',
        skills: '',
      });
      fetchJobs();
    } catch (error) {
      toast({
        title: "Error posting job",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      await apiClient.post(`/jobs/${jobId}/approve`, {});
      toast({ title: "Job approved successfully" });
      fetchJobs();
    } catch (error) {
      toast({ title: "Error approving job", variant: "destructive" });
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      await apiClient.post(`/jobs/${jobId}/reject`, { reason: 'Does not meet requirements' });
      toast({ title: "Job rejected" });
      fetchJobs();
    } catch (error) {
      toast({ title: "Error rejecting job", variant: "destructive" });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiClient.delete(`/jobs/${jobId}`);
      toast({ title: "Job deleted successfully" });
      fetchJobs();
    } catch (error) {
      toast({ title: "Error deleting job", variant: "destructive" });
    }
  };

  const handleRequestReferral = async (jobId: string) => {
    try {
      await apiClient.post(`/jobs/${jobId}/referral-request`, {
        message: 'I am interested in this position and would appreciate a referral.',
      });
      toast({ title: "Referral request sent successfully" });
      fetchMyApplications();
    } catch (error: any) {
      toast({
        title: "Error sending referral request",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRespondToReferral = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiClient.put(`/jobs/referral-requests/${requestId}`, {
        status,
        responseMessage: status === 'accepted' 
          ? 'I will be happy to refer you for this position.' 
          : 'Unfortunately, I cannot provide a referral at this time.',
      });
      toast({ title: `Referral request ${status}` });
      fetchReferralRequests();
    } catch (error) {
      toast({ title: "Error responding to request", variant: "destructive" });
    }
  };

  const getJobTypeColor = (jobType: string) => {
    switch (jobType) {
      case 'full-time':
        return 'bg-primary text-primary-foreground';
      case 'part-time':
        return 'bg-warning text-warning-foreground';
      case 'internship':
        return 'bg-success text-success-foreground';
      case 'contract':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Approval</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const jobTypes = ['full-time', 'part-time', 'internship', 'contract'];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Job Board
            </h1>
            <p className="text-xl text-muted-foreground">
              {user?.role === 'alumni' 
                ? 'Post job opportunities and manage referral requests' 
                : user?.role === 'admin'
                ? 'Manage job postings and approvals'
                : 'Discover career opportunities and request referrals'
              }
            </p>
          </div>
          {(user?.role === 'alumni' || user?.role === 'admin') && (
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePostJob} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyLogo">Company Logo URL (optional)</Label>
                    <Input
                      id="companyLogo"
                      type="url"
                      value={newJob.companyLogo}
                      onChange={(e) => setNewJob(prev => ({ ...prev, companyLogo: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newJob.location}
                        onChange={(e) => setNewJob(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select
                        value={newJob.jobType}
                        onValueChange={(value) => setNewJob(prev => ({ ...prev, jobType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="salaryRange">Salary Range</Label>
                      <Input
                        id="salaryRange"
                        value={newJob.salaryRange}
                        onChange={(e) => setNewJob(prev => ({ ...prev, salaryRange: e.target.value }))}
                        placeholder="e.g., $50,000 - $70,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experienceRequired">Experience Required</Label>
                      <Input
                        id="experienceRequired"
                        value={newJob.experienceRequired}
                        onChange={(e) => setNewJob(prev => ({ ...prev, experienceRequired: e.target.value }))}
                        placeholder="e.g., 2-5 years"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="applicationLink">Application Link</Label>
                    <Input
                      id="applicationLink"
                      type="url"
                      value={newJob.applicationLink}
                      onChange={(e) => setNewJob(prev => ({ ...prev, applicationLink: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                    <Input
                      id="requirements"
                      value={newJob.requirements}
                      onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="e.g., Python, React, 2+ years experience"
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={newJob.skills}
                      onChange={(e) => setNewJob(prev => ({ ...prev, skills: e.target.value }))}
                      placeholder="e.g., JavaScript, Node.js, AWS"
                    />
                  </div>

                  {user?.role === 'alumni' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="referralAvailable"
                        checked={newJob.referralAvailable}
                        onCheckedChange={(checked) => 
                          setNewJob(prev => ({ ...prev, referralAvailable: checked === true }))
                        }
                      />
                      <Label htmlFor="referralAvailable" className="font-normal">
                        I can provide referrals for this position
                      </Label>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    {user?.role === 'admin' ? 'Post Job' : 'Submit for Approval'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Referral Requests Section (Alumni) */}
        {user?.role === 'alumni' && referralRequests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Referral Requests</CardTitle>
              <CardDescription>Students requesting referrals for your posted jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referralRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{request.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                        <p className="text-sm font-medium mt-1">{request.jobTitle} at {request.jobCompany}</p>
                      </div>
                      <Badge>{request.status}</Badge>
                    </div>
                    {request.message && (
                      <p className="text-sm mt-2 mb-3">{request.message}</p>
                    )}
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleRespondToReferral(request.id, 'accepted')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRespondToReferral(request.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Applications Section (Students) */}
        {user?.role === 'student' && myApplications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Referral Requests</CardTitle>
              <CardDescription>Track your referral request status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myApplications.map((app) => (
                  <div key={app.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{app.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground">{app.jobCompany}</p>
                        <p className="text-sm mt-1">Alumni: {app.alumniEmail}</p>
                      </div>
                      <Badge>{app.status}</Badge>
                    </div>
                    {app.responseMessage && (
                      <p className="text-sm mt-2 text-muted-foreground">
                        Response: {app.responseMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedJobType} onValueChange={setSelectedJobType}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {jobTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4 flex-1">
                    {job.companyLogo && (
                      <img 
                        src={job.companyLogo} 
                        alt={`${job.company} logo`}
                        className="w-16 h-16 object-contain rounded border"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {getStatusBadge(job.status)}
                      </div>
                      <CardDescription className="text-lg font-medium text-foreground">
                        {job.company}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        Posted by: {job.postedByRole === 'admin' ? 'Admin' : (job.postedByName || 'Alumni')}
                      </p>
                    </div>
                  </div>
                  <Badge className={getJobTypeColor(job.jobType)}>
                    {job.jobType.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{job.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                  )}
                  {job.salaryRange && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salaryRange}
                    </div>
                  )}
                  {job.experienceRequired && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {job.experienceRequired}
                    </div>
                  )}
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Requirements:</div>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, index) => (
                        <Badge key={index} variant="secondary">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.skills && job.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Required Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.referralAvailable && job.postedByRole === 'alumni' && (
                  <div className="mb-4">
                    <Badge className="bg-blue-500">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Referral Available
                    </Badge>
                  </div>
                )}

                <div className="flex gap-2">
                  {job.applicationLink && (
                    <Button asChild>
                      <a href={job.applicationLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Apply Now
                      </a>
                    </Button>
                  )}

                  {user?.role === 'student' && job.referralAvailable && job.postedByRole === 'alumni' && job.status === 'approved' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleRequestReferral(job.id)}
                      disabled={myApplications.some(app => app.jobId === job.id)}
                    >
                      {myApplications.some(app => app.jobId === job.id) 
                        ? 'Request Sent' 
                        : 'Request Referral'
                      }
                    </Button>
                  )}

                  {user?.role === 'admin' && job.status === 'pending' && (
                    <>
                      <Button onClick={() => handleApproveJob(job.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button variant="destructive" onClick={() => handleRejectJob(job.id)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      Delete Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoard;
