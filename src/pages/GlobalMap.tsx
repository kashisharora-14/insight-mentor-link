import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alumni } from "@/data/mockData";
import { MapPin, Users, Globe, MessageCircle, Filter } from "lucide-react";

const GlobalMap = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Group alumni by country
  const alumniByCountry = alumni.reduce((acc, person) => {
    const country = person.location.split(', ')[1] || person.location;
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(person);
    return acc;
  }, {} as Record<string, typeof alumni>);

  const countries = Object.keys(alumniByCountry);
  const totalAlumni = alumni.length;

  // Mock world map visualization with key locations
  const mapLocations = [
    { name: "United States", count: 2, x: 25, y: 35, alumni: alumniByCountry["CA"] || [] },
    { name: "United Kingdom", count: 1, x: 50, y: 25, alumni: alumniByCountry["UK"] || [] },
    { name: "India", count: 1, x: 75, y: 45, alumni: alumniByCountry["India"] || [] },
    { name: "Others", count: 1, x: 85, y: 55, alumni: [] }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Global Alumni Network
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our worldwide community of {totalAlumni}+ alumni spread across {countries.length} countries.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Alumni Distribution Worldwide
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simplified world map visualization */}
                <div className="relative w-full h-96 bg-gradient-card rounded-lg overflow-hidden">
                  {/* Background map style */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
                  
                  {/* Continent shapes (simplified) */}
                  <div className="absolute top-8 left-8 w-16 h-12 bg-primary/20 rounded-lg"></div>
                  <div className="absolute top-12 left-32 w-20 h-16 bg-primary/20 rounded-xl"></div>
                  <div className="absolute top-20 right-20 w-12 h-8 bg-primary/20 rounded-lg"></div>
                  <div className="absolute bottom-16 left-24 w-8 h-12 bg-primary/20 rounded-lg"></div>
                  
                  {/* Alumni location markers */}
                  {mapLocations.map((location, index) => (
                    <div
                      key={index}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
                        selectedCountry === location.name ? 'z-20' : 'z-10'
                      }`}
                      style={{ left: `${location.x}%`, top: `${location.y}%` }}
                      onClick={() => setSelectedCountry(selectedCountry === location.name ? null : location.name)}
                    >
                      {/* Pulse animation */}
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-30"></div>
                      
                      {/* Main marker */}
                      <div className={`relative w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white text-xs font-bold shadow-glow transition-transform group-hover:scale-110 ${
                        selectedCountry === location.name ? 'scale-125' : ''
                      }`}>
                        {location.count}
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap">
                          {location.name}: {location.count} alumni
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-gradient-hero rounded-full"></div>
                      <span>Alumni Locations</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Details */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Network Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-card rounded-lg">
                    <div className="text-2xl font-bold text-primary">{totalAlumni}</div>
                    <div className="text-sm text-muted-foreground">Total Alumni</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-card rounded-lg">
                    <div className="text-2xl font-bold text-primary">{countries.length}</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Top Locations:</h4>
                  {Object.entries(alumniByCountry)
                    .sort(([,a], [,b]) => b.length - a.length)
                    .slice(0, 3)
                    .map(([country, alumni]) => (
                      <div key={country} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {country}
                        </span>
                        <Badge variant="secondary">{alumni.length}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Country Details */}
            {selectedCountry && alumniByCountry[selectedCountry] && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Alumni in {selectedCountry}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alumniByCountry[selectedCountry].map((person) => (
                      <div key={person.id} className="flex items-center gap-3 p-3 bg-gradient-card rounded-lg">
                        <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{person.name}</div>
                          <div className="text-xs text-muted-foreground">{person.profession}</div>
                          <div className="text-xs text-muted-foreground">{person.department} • {person.batchYear}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Connect Globally</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-hero hover:opacity-90" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  View All Alumni
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Alumni Groups
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="shadow-elegant">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Our alumni network spans across continents, providing worldwide opportunities.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Industry Leaders</h3>
              <p className="text-sm text-muted-foreground">
                Connect with alumni working at top companies and leading organizations.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Easy Connections</h3>
              <p className="text-sm text-muted-foreground">
                Find and connect with alumni in your target locations effortlessly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;