
import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { alumni } from "@/data/mockData";
import { MapPin, Users, Globe, MessageCircle, Search, User, Briefcase } from "lucide-react";
import { Loader } from "@googlemaps/js-api-loader";

const GlobalMap = () => {
  const [selectedAlumni, setSelectedAlumni] = useState<typeof alumni[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey: "AIzaSyBQZGTfN8QtXNON5BzP6z5TxZNP5k5Ck8o", // You'll need to get your own API key
        version: "weekly",
        libraries: ["places"]
      });

      const { Map } = await loader.importLibrary("maps");
      const { AdvancedMarkerElement } = await loader.importLibrary("marker");

      if (mapRef.current) {
        const mapInstance = new Map(mapRef.current, {
          center: { lat: 30.7333, lng: 76.7794 }, // Chandigarh coordinates
          zoom: 6,
          mapId: "DEMO_MAP_ID",
        });

        setMap(mapInstance);

        // Add markers for each alumni
        const newMarkers: google.maps.Marker[] = [];
        
        for (const person of alumni) {
          // Create custom marker content
          const markerContent = document.createElement('div');
          markerContent.className = 'custom-marker';
          markerContent.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: transform 0.2s;
            ">
              ${person.name.split(' ').map(n => n[0]).join('')}
            </div>
          `;

          // Add hover effect
          markerContent.addEventListener('mouseenter', () => {
            markerContent.style.transform = 'scale(1.1)';
          });
          markerContent.addEventListener('mouseleave', () => {
            markerContent.style.transform = 'scale(1)';
          });

          const marker = new AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: person.latitude, lng: person.longitude },
            content: markerContent,
            title: person.name
          });

          // Create info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 300px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                  <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 10px;
                  ">
                    ${person.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 style="margin: 0; font-weight: 600; color: #1f2937;">${person.name}</h4>
                    <p style="margin: 0; font-size: 12px; color: #6b7280;">${person.department} • ${person.batchYear}</p>
                  </div>
                </div>
                <p style="margin: 4px 0; font-size: 14px; color: #374151;">${person.profession}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #6b7280; display: flex; align-items: center;">
                  <span style="margin-right: 4px;">📍</span>${person.location}
                </p>
                <div style="margin: 8px 0;">
                  ${person.skills.slice(0, 3).map(skill => 
                    `<span style="
                      display: inline-block;
                      background: #dbeafe;
                      color: #1e40af;
                      padding: 2px 8px;
                      border-radius: 12px;
                      font-size: 10px;
                      margin: 2px 2px 2px 0;
                    ">${skill}</span>`
                  ).join('')}
                </div>
                <button 
                  onclick="selectAlumni(${person.id})"
                  style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 8px;
                  "
                >
                  View Profile
                </button>
              </div>
            `
          });

          // Add click listener to marker
          marker.addListener("click", () => {
            // Close any open info windows
            markers.forEach(m => {
              if ((m as any).infoWindow) {
                (m as any).infoWindow.close();
              }
            });
            
            infoWindow.open(mapInstance, marker);
            setSelectedAlumni(person);
          });

          // Store info window reference
          (marker as any).infoWindow = infoWindow;
          newMarkers.push(marker as any);
        }

        setMarkers(newMarkers);

        // Make selectAlumni function globally available
        (window as any).selectAlumni = (id: number) => {
          const alumni_member = alumni.find(a => a.id === id);
          if (alumni_member) {
            setSelectedAlumni(alumni_member);
          }
        };
      }
    };

    initializeMap().catch(console.error);
  }, []);

  // Filter functionality
  const filteredAlumni = alumni.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Update marker visibility based on search
  useEffect(() => {
    if (map && markers.length > 0) {
      markers.forEach((marker, index) => {
        const person = alumni[index];
        const isVisible = filteredAlumni.some(filtered => filtered.id === person.id);
        marker.setMap(isVisible ? map : null);
      });
    }
  }, [searchTerm, map, markers, filteredAlumni]);

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
            Explore our worldwide community of {totalAlumni} alumni across the globe on real map locations.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Google Maps Container */}
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
                        placeholder="Search alumni, skills, or locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Google Maps Container */}
                <div 
                  ref={mapRef}
                  className="w-full h-[600px] bg-gray-100"
                  style={{ minHeight: '600px' }}
                />
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
                      {selectedAlumni.skills.slice(0, 4).map((skill, i) => (
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
                    <div className="text-2xl font-bold text-primary">{filteredAlumni.length}</div>
                    <div className="text-sm text-muted-foreground">Filtered</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Search Results:</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredAlumni.slice(0, 5).map((person) => (
                      <div 
                        key={person.id} 
                        className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => setSelectedAlumni(person)}
                      >
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-hero rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-xs text-muted-foreground">{person.location}</div>
                          </div>
                        </span>
                      </div>
                    ))}
                    {filteredAlumni.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        +{filteredAlumni.length - 5} more results
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Map Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    if (map) {
                      map.setCenter({ lat: 30.7333, lng: 76.7794 });
                      map.setZoom(6);
                    }
                  }}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => {
                    if (map && selectedAlumni) {
                      map.setCenter({ lat: selectedAlumni.latitude, lng: selectedAlumni.longitude });
                      map.setZoom(12);
                    }
                  }}
                  disabled={!selectedAlumni}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Focus Selected
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
