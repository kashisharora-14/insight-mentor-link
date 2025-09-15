import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, MapPin, Clock, DollarSign, Plus, ExternalLink, Search, Filter } from 'lucide-react';
import Navigation from '@/components/ui/navigation';

interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  job_type: string;
  salary_range: string;
  requirements: string[];
  application_link: string;
  expires_at: string;
  created_at: string;
}

const JobBoard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    job_type: 'full-time',
    salary_range: '',
    requirements: '',
    application_link: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, selectedJobType]);

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
    } else {
      setJobs(data || []);
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
      filtered = filtered.filter(job => job.job_type === selectedJobType);
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
      const { error } = await supabase.from('jobs').insert({
        ...newJob,
        requirements: newJob.requirements.split(',').map(req => req.trim()),
        posted_by: '00000000-0000-0000-0000-000000000000', // placeholder for demo
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      });

      if (error) throw error;

      toast({
        title: "Job posted successfully!",
        description: "Your job posting is now live.",
      });

      setIsPostDialogOpen(false);
      setNewJob({
        title: '',
        description: '',
        company: '',
        location: '',
        job_type: 'full-time',
        salary_range: '',
        requirements: '',
        application_link: ''
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
                ? 'Post job opportunities for students' 
                : 'Discover career opportunities posted by alumni'
              }
            </p>
          </div>
          {user?.role === 'alumni' && (
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
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
                      rows={3}
                      required
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
                        value={newJob.job_type}
                        onValueChange={(value) => setNewJob(prev => ({ ...prev, job_type: value }))}
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
                        value={newJob.salary_range}
                        onChange={(e) => setNewJob(prev => ({ ...prev, salary_range: e.target.value }))}
                        placeholder="e.g., $50,000 - $70,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="applicationLink">Application Link</Label>
                      <Input
                        id="applicationLink"
                        type="url"
                        value={newJob.application_link}
                        onChange={(e) => setNewJob(prev => ({ ...prev, application_link: e.target.value }))}
                        required
                      />
                    </div>
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

                  <Button type="submit" className="w-full">
                    Post Job
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

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
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-foreground">
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge className={getJobTypeColor(job.job_type)}>
                    {job.job_type.replace('-', ' ')}
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
                  {job.salary_range && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary_range}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
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

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Expires: {new Date(job.expires_at).toLocaleDateString()}
                  </div>
                  <Button asChild>
                    <a href={job.application_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Apply Now
                    </a>
                  </Button>
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