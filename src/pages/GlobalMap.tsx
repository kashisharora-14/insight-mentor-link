import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { alumni } from "@/data/mockData";
import { MapPin, Users, Globe, MessageCircle, Search, Layers, Navigation as NavigationIcon, Minus, Plus, User, Briefcase } from "lucide-react";

const GlobalMap = () => {
  const [selectedAlumni, setSelectedAlumni] = useState<typeof alumni[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zoomLevel, setZoomLevel] = useState(2);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); // Added for country selection

  // Group alumni by location with coordinates
  const alumniLocations = [
    {
      city: "San Francisco",
      country: "USA",
      coordinates: { lat: 37.7749, lng: -122.4194 },
      mapPosition: { x: 15, y: 38 },
      alumni: alumni.filter(a => a.location.includes("San Francisco"))
    },
    {
      city: "New York",
      country: "USA",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      mapPosition: { x: 22, y: 35 },
      alumni: alumni.filter(a => a.location.includes("New York"))
    },
    {
      city: "London",
      country: "UK",
      coordinates: { lat: 51.5074, lng: -0.1278 },
      mapPosition: { x: 48, y: 28 },
      alumni: alumni.filter(a => a.location.includes("London"))
    },
    {
      city: "Bangalore",
      country: "India",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      mapPosition: { x: 72, y: 48 },
      alumni: alumni.filter(a => a.location.includes("Bangalore"))
    },
    {
      city: "Toronto",
      country: "Canada",
      coordinates: { lat: 43.6532, lng: -79.3832 },
      mapPosition: { x: 20, y: 32 },
      alumni: alumni.filter(a => a.location.includes("Toronto"))
    }
  ];

  // Simplified mapLocations for cluster markers
  const mapLocations = [
    { name: "USA", x: 20, y: 35, count: alumni.filter(a => a.location.includes("USA")).length },
    { name: "UK", x: 48, y: 28, count: alumni.filter(a => a.location.includes("UK")).length },
    { name: "India", x: 72, y: 48, count: alumni.filter(a => a.location.includes("India")).length },
    { name: "Canada", x: 20, y: 32, count: alumni.filter(a => a.location.includes("Canada")).length },
  ];

  const filteredLocations = alumniLocations.filter(location =>
    location.alumni.some(person =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalAlumni = alumni.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Global Alumni Network
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our worldwide community of {totalAlumni} alumni across the globe.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Google Maps-like Interface */}
          <div className="lg:col-span-3">
            <Card className="shadow-elegant overflow-hidden">
              <CardHeader className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="w-5 h-5 text-primary" />
                    Alumni World Map
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search alumni or locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    {/* Map Controls */}
                    <div className="flex flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-t-md rounded-b-none border-b-0"
                        onClick={() => setZoomLevel(Math.min(5, zoomLevel + 1))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-b-md rounded-t-none"
                        onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Enhanced Map Container */}
                <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 overflow-hidden">
                  {/* Map Grid Background */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full"
                         style={{
                           backgroundImage: `
                             linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                           `,
                           backgroundSize: '20px 20px'
                         }}>
                    </div>
                  </div>

                  {/* Continent Shapes */}
                  <div className="absolute inset-0">
                    {/* North America */}
                    <div className="absolute top-8 left-4 w-32 h-24 bg-green-200/60 rounded-xl transform rotate-12"></div>
                    <div className="absolute top-16 left-12 w-20 h-16 bg-green-300/60 rounded-lg transform -rotate-6"></div>

                    {/* Europe */}
                    <div className="absolute top-12 left-[45%] w-16 h-12 bg-orange-200/60 rounded-lg"></div>

                    {/* Asia */}
                    <div className="absolute top-16 right-16 w-28 h-20 bg-purple-200/60 rounded-2xl transform rotate-3"></div>

                    {/* South America */}
                    <div className="absolute top-32 left-16 w-12 h-20 bg-yellow-200/60 rounded-xl transform rotate-12"></div>

                    {/* Africa */}
                    <div className="absolute top-24 left-[42%] w-14 h-18 bg-red-200/60 rounded-lg"></div>

                    {/* Australia */}
                    <div className="absolute bottom-16 right-20 w-12 h-8 bg-teal-200/60 rounded-lg"></div>
                  </div>

                  {/* Individual Alumni Markers */}
                  {alumni.map((person, index) => {
                    // Simplified longitude/latitude to map position, fallback to random
                    const longitude = person.location.includes("San Francisco") ? -122.4194 : person.location.includes("New York") ? -74.0060 : person.location.includes("London") ? -0.1278 : person.location.includes("Bangalore") ? 77.5946 : person.location.includes("Toronto") ? -79.3832 : null;
                    const latitude = person.location.includes("San Francisco") ? 37.7749 : person.location.includes("New York") ? 40.7128 : person.location.includes("London") ? 51.5074 : person.location.includes("Bangalore") ? 12.9716 : person.location.includes("Toronto") ? 43.6532 : null;

                    const x = longitude ? ((longitude + 180) / 360) * 100 : Math.random() * 80 + 10;
                    const y = latitude ? ((90 - latitude) / 180) * 100 : Math.random() * 60 + 20;

                    return (
                      <div
                        key={person.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                        style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%, -50%) scale(${0.8 + (zoomLevel - 1) * 0.1})` }}
                        onClick={() => setSelectedAlumni(person)}
                      >
                        {/* Pulse animation */}
                        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20 w-12 h-12"></div>

                        {/* Alumni Photo Marker */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-hero">
                          <div className="w-full h-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>

                        {/* Detailed Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-900">{person.name}</h4>
                                <p className="text-xs text-gray-600">{person.department} • {person.batchYear}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{person.profession}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                              <MapPin className="w-3 h-3" />
                              {person.location}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {person.skills.slice(0, 2).map((skill, i) => (
                                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {skill}
                                </span>
                              ))}
                              {person.skills.length > 2 && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                  +{person.skills.length - 2}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Country cluster markers for dense areas */}
                  {mapLocations.map((location, index) => (
                    <div
                      key={`cluster-${index}`}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${
                        selectedCountry === location.name ? 'z-30' : 'z-20'
                      }`}
                      style={{ left: `${location.x + 5}%`, top: `${location.y - 5}%` }}
                      onClick={() => setSelectedCountry(selectedCountry === location.name ? null : location.name)}
                    >
                      {/* Cluster count indicator */}
                      <div className={`relative w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform group-hover:scale-110 ${
                        selectedCountry === location.name ? 'scale-125 bg-red-600' : ''
                      }`}>
                        {location.count}
                      </div>

                      {/* Cluster tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          {location.name}: {location.count} alumni
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Map Legend */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="w-4 h-4 text-primary" />
                        Alumni Locations
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="w-3 h-3 bg-gradient-hero rounded-full"></div>
                        Click markers to view alumni
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Zoom: {zoomLevel}x
                      </div>
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                    <Button variant="ghost" size="sm" className="p-2">
                      <NavigationIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Alumni Profile */}
            {selectedAlumni && (
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5 text-primary" />
                    Alumni Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold">
                        {selectedAlumni.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold">{selectedAlumni.name}</div>
                        <Badge variant="secondary" className="text-xs">
                          {selectedAlumni.department} • {selectedAlumni.batchYear}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span>{selectedAlumni.profession}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{selectedAlumni.location}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {selectedAlumni.bio}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {selectedAlumni.skills.slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Button className="w-full bg-gradient-hero hover:opacity-90" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Network Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gradient-card rounded-lg">
                    <div className="text-2xl font-bold text-primary">{totalAlumni}</div>
                    <div className="text-sm text-muted-foreground">Total Alumni</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-card rounded-lg">
                    <div className="text-2xl font-bold text-primary">{alumniLocations.length}</div>
                    <div className="text-sm text-muted-foreground">Cities</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Top Locations:</h4>
                  {alumniLocations
                    .sort((a, b) => b.alumni.length - a.alumni.length)
                    .slice(0, 3)
                    .map((location) => (
                      <div key={location.city} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {location.city}
                        </span>
                        <Badge variant="secondary">{location.alumni.length}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Map Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" size="sm">
                  <Layers className="w-4 h-4 mr-2" />
                  Toggle Layers
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search Locations
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact All
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalMap;