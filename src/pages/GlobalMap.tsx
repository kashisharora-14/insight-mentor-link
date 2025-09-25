
import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { alumni } from "@/data/mockData";
import { MapPin, Users, Globe, MessageCircle, Search, User, Briefcase } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GlobalMap = () => {
  const [selectedAlumni, setSelectedAlumni] = useState<typeof alumni[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [map, setMap] = useState<L.Map | null>(null);
  const [markers, setMarkers] = useState<L.Marker[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (mapRef.current && !map) {
      // Create map centered on India (since many alumni are there)
      const mapInstance = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance);

      setMap(mapInstance);

      // Add markers for each alumni
      const newMarkers: L.Marker[] = [];
      
      alumni.forEach((person) => {
        // Create custom icon with initials
        const customIcon = L.divIcon({
          html: `
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
              font-family: system-ui, -apple-system, sans-serif;
            ">
              ${person.name.split(' ').map(n => n[0]).join('')}
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40]
        });

        const marker = L.marker([person.latitude, person.longitude], {
          icon: customIcon
        }).addTo(mapInstance);

        // Create popup content
        const popupContent = `
          <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
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
                <h4 style="margin: 0; font-weight: 600; color: #1f2937; font-size: 14px;">${person.name}</h4>
                <p style="margin: 0; font-size: 11px; color: #6b7280;">${person.department} • ${person.batchYear}</p>
              </div>
            </div>
            <p style="margin: 4px 0; font-size: 12px; color: #374151; font-weight: 500;">${person.profession}</p>
            <p style="margin: 4px 0; font-size: 11px; color: #6b7280; display: flex; align-items: center;">
              <span style="margin-right: 4px;">📍</span>${person.location}
            </p>
            <div style="margin: 8px 0; display: flex; flex-wrap: gap: 2px;">
              ${person.skills.slice(0, 3).map(skill => 
                `<span style="
                  display: inline-block;
                  background: #dbeafe;
                  color: #1e40af;
                  padding: 2px 6px;
                  border-radius: 10px;
                  font-size: 9px;
                  font-weight: 500;
                ">${skill}</span>`
              ).join('')}
            </div>
            <p style="margin: 8px 0 12px 0; font-size: 11px; color: #4b5563; line-height: 1.4;">
              ${person.bio.substring(0, 100)}${person.bio.length > 100 ? '...' : ''}
            </p>
            <button 
              onclick="window.selectAlumni(${person.id})"
              style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 11px;
                cursor: pointer;
                width: 100%;
                font-weight: 600;
                transition: opacity 0.2s;
              "
              onmouseover="this.style.opacity='0.9'"
              onmouseout="this.style.opacity='1'"
            >
              View Profile
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        // Add click event
        marker.on('click', () => {
          setSelectedAlumni(person);
        });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);

      // Make selectAlumni function globally available
      (window as any).selectAlumni = (id: number) => {
        const alumni_member = alumni.find(a => a.id === id);
        if (alumni_member) {
          setSelectedAlumni(alumni_member);
          // Center map on selected alumni
          if (mapInstance) {
            mapInstance.setView([alumni_member.latitude, alumni_member.longitude], 10);
          }
        }
      };
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [mapRef.current]);

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
        
        if (isVisible) {
          marker.addTo(map);
        } else {
          map.removeLayer(marker);
        }
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
            Explore our worldwide community of {totalAlumni} alumni across the globe on interactive map.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Container */}
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
                {/* Leaflet Map Container */}
                <div 
                  ref={mapRef}
                  className="w-full h-[600px] bg-gray-100 z-0"
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
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
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

                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90" size="sm">
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
                  <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{totalAlumni}</div>
                    <div className="text-sm text-muted-foreground">Total Alumni</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
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
                        onClick={() => {
                          setSelectedAlumni(person);
                          if (map) {
                            map.setView([person.latitude, person.longitude], 12);
                          }
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                      map.setView([20.5937, 78.9629], 5);
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
                      map.setView([selectedAlumni.latitude, selectedAlumni.longitude], 12);
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

      {/* Custom CSS for leaflet popup */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-div-icon:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default GlobalMap;
