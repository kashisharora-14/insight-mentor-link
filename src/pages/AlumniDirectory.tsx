import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { alumni, departments } from "@/data/mockData";
import { MapPin, Briefcase, MessageCircle, Filter } from "lucide-react";

const AlumniDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const filteredAlumni = alumni.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.profession.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || person.department === selectedDepartment;
    const matchesLocation = selectedLocation === "all" || person.location.includes(selectedLocation);
    
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const locations = [...new Set(alumni.map(a => a.location.split(', ')[1]))];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Alumni Directory
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with our global network of successful alumni across all industries and departments.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Filter Alumni</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name or profession..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:col-span-2"
              />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredAlumni.length} of {alumni.length} alumni
          </p>
        </div>

        {/* Alumni Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((person) => (
            <Card key={person.id} className="shadow-elegant hover:shadow-glow transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {person.name}
                    </h3>
                    <Badge variant="secondary" className="mb-2">
                      {person.department} • {person.batchYear}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 mr-2 text-primary" />
                    <span>{person.profession}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    <span>{person.location}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {person.bio}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {person.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {person.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{person.skills.length - 3} more
                    </Badge>
                  )}
                </div>

                <Link to="/student-dashboard">
                  <Button className="w-full bg-gradient-hero hover:opacity-90 transition-opacity">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Request Mentorship
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No alumni found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDirectory;