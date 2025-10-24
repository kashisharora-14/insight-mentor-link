import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/apiClient";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Filter,
  Users,
  UserPlus,
  CheckCircle,
  Plus,
  Search,
  Tag,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "An unexpected error occurred.";
  }
};

interface ParticipantLink {
  user_id: string;
  program?: string;
  department?: string;
  approval_status: string;
  notes?: string;
  registered_at?: string;
}

interface OrganizerInfo {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface ParticipantSummary {
  total: number;
  by_department: { department: string | null; count: number }[];
}

interface EventRecord {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  event_type?: string;
  organized_by?: string;
  club?: string;
  department?: string;
  target_audience?: string[] | null;
  visibility?: string;
  start_date?: string;
  end_date?: string;
  venue?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  registration_required?: boolean;
  registration_deadline?: string;
  registration_link?: string;
  max_participants?: number | null;
  waitlist_enabled?: boolean;
  is_paid?: boolean;
  fee_amount?: number | null;
  fee_currency?: string;
  guest_speakers?: unknown;
  agenda?: unknown;
  resources?: unknown;
  poster_url?: string;
  banner_url?: string;
  image_gallery?: unknown;
  livestream_link?: string;
  status?: string;
  approval_notes?: string | null;
  organizer?: OrganizerInfo | null;
  created_by_id?: string;
  created_by_role?: string;
  approved_by_id?: string | null;
  approved_at?: string | null;
  primary_contact?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  tags?: string[] | null;
  metadata?: unknown;
  participant_requests?: ParticipantLink[];
  participant_summary?: ParticipantSummary;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ParticipationStatus {
  event_id: string;
  approval_status: string;
  attendance_status: string;
  program?: string;
  department?: string;
}

type NewEventForm = {
  id?: string;
  title: string;
  summary: string;
  description: string;
  event_type: string;
  organized_by: string;
  club: string;
  department: string;
  start_date: string;
  end_date: string;
  venue: string;
  location: string;
  city: string;
  state: string;
  is_virtual: boolean;
  livestream_link: string;
  registration_required: boolean;
  registration_deadline: string;
  registration_link: string;
  max_participants: string;
  min_participants: string;
  waitlist_enabled: boolean;
  is_paid: boolean;
  fee_amount: string;
  fee_currency: string;
  tags: string;
  guest_speakers: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  banner_url: string;
};

const TARGET_BANNER_BYTES = 70 * 1024;
const IMAGE_MAX_WIDTH = 1200;
const IMAGE_MAX_HEIGHT = 675;
const INITIAL_IMAGE_QUALITY = 0.65;

const Events = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [participation, setParticipation] = useState<Record<string, ParticipationStatus>>({});
  const [loading, setLoading] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isBannerDragActive, setIsBannerDragActive] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [eventPendingDelete, setEventPendingDelete] = useState<EventRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const emptyEventForm: NewEventForm = {
    id: undefined,
    title: "",
    summary: "",
    description: "",
    event_type: "",
    organized_by: "",
    club: "",
    department: "",
    start_date: "",
    end_date: "",
    venue: "",
    location: "",
    city: "",
    state: "",
    is_virtual: false,
    livestream_link: "",
    registration_required: true,
    registration_deadline: "",
    registration_link: "",
    max_participants: "",
    min_participants: "",
    waitlist_enabled: false,
    is_paid: false,
    fee_amount: "",
    fee_currency: "INR",
    tags: "",
    guest_speakers: "",
    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",
    banner_url: "",
  };

  const [newEvent, setNewEvent] = useState<NewEventForm>(emptyEventForm);
  const { toast } = useToast();
  const { user } = useAuth();

  const compressImage = useCallback(async (file: File): Promise<string> => {
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;
    let quality = INITIAL_IMAGE_QUALITY;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const ratio = Math.min(IMAGE_MAX_WIDTH / width, IMAGE_MAX_HEIGHT / height, 1);
      const targetWidth = Math.max(1, Math.round(width * ratio));
      const targetHeight = Math.max(1, Math.round(height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }

      ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), "image/jpeg", quality)
      );

      if (!blob) {
        throw new Error("Failed to compress image");
      }

      if (blob.size <= TARGET_BANNER_BYTES) {
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(new Error("Failed to read compressed image"));
          reader.readAsDataURL(blob);
        });
      }

      width = Math.round(targetWidth * 0.9);
      height = Math.round(targetHeight * 0.9);
      quality = Math.max(0.35, quality * 0.8);
    }

    throw new Error("Banner image is still too large after compression. Try a smaller image.");
  }, []);

  const handleBannerFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Unsupported file",
          description: "Please upload an image file for the banner.",
          variant: "destructive",
        });
        return;
      }

      const processFile = async () => {
        try {
          setBannerError(null);
          const dataUrl = await compressImage(file);
          const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
          const approxBytes = Math.floor((base64.length * 3) / 4) - (base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0);

          if (approxBytes > TARGET_BANNER_BYTES) {
            setBannerError("Banner image is still above the upload limit. Please choose a smaller file.");
            return;
          }

          setNewEvent((prev) => ({ ...prev, banner_url: dataUrl }));
          setBannerError(null);
        } catch (error) {
          console.error("Banner processing failed", error);
          toast({
            title: "Banner processing failed",
            description: error instanceof Error ? error.message : "Could not prepare the banner image.",
            variant: "destructive",
          });
          setBannerError("We couldn't process that banner. Try a smaller JPG/PNG under 1200×675.");
        }
      };

      processFile();
    },
    [compressImage, toast]
  );

  const handleBannerInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handleBannerFile(event.target.files);
    },
    [handleBannerFile]
  );

  const handleBannerDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsBannerDragActive(false);
      handleBannerFile(event.dataTransfer.files);
    },
    [handleBannerFile]
  );

  const handleBannerDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsBannerDragActive(true);
  }, []);

  const handleBannerDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsBannerDragActive(false);
  }, []);
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (user?.role === "admin") {
        params.set("status", "all");
      }
      const query = params.toString() ? `?${params}` : "";
      const data = await apiClient.get<EventRecord[]>(`/dcsa/events${query}`);
      console.log("Loaded events:", data);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to load events.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user?.role]);

  const loadParticipation = useCallback(async () => {
    try {
      const data = await apiClient.get<ParticipationStatus[]>("/dcsa/events/my-participation");
      const map = (data || []).reduce<Record<string, ParticipationStatus>>((acc, entry) => {
        acc[entry.event_id] = entry;
        return acc;
      }, {});
      setParticipation(map);
    } catch (error) {
      console.error("Failed to load participation", error);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    if (user?.role === "student") {
      loadParticipation();
    } else {
      setParticipation({});
    }
  }, [loadEvents, loadParticipation, user?.role]);

  const resetForm = useCallback(() => {
    setNewEvent({ ...emptyEventForm });
    setBannerError(null);
  }, [emptyEventForm]);

  const handleEditEvent = useCallback(
    (event: EventRecord) => {
      setNewEvent({
        id: event.id,
        title: event.title || "",
        summary: event.summary || "",
        description: event.description || "",
        event_type: event.event_type || "",
        organized_by: event.organized_by || "",
        club: event.club || "",
        department: event.department || "",
        start_date: event.start_date ? event.start_date.slice(0, 16) : "",
        end_date: event.end_date ? event.end_date.slice(0, 16) : "",
        venue: event.venue || "",
        location: event.location || "",
        city: event.city || "",
        state: event.state || "",
        is_virtual: Boolean(event.livestream_link),
        livestream_link: event.livestream_link || "",
        registration_required: event.registration_required ?? true,
        registration_deadline: event.registration_deadline ? event.registration_deadline.slice(0, 16) : "",
        registration_link: event.registration_link || "",
        max_participants: event.max_participants?.toString() || "",
        min_participants: "",
        waitlist_enabled: event.waitlist_enabled ?? false,
        is_paid: event.is_paid ?? false,
        fee_amount: event.fee_amount?.toString() || "",
        fee_currency: event.fee_currency || "INR",
        tags: event.tags?.join(", ") || "",
        guest_speakers: Array.isArray(event.guest_speakers)
          ? event.guest_speakers.join(", ")
          : typeof event.guest_speakers === "string"
          ? event.guest_speakers
          : "",
        primary_contact_name: event.primary_contact?.name || "",
        primary_contact_email: event.primary_contact?.email || "",
        primary_contact_phone: event.primary_contact?.phone || "",
        banner_url: event.banner_url || "",
      });
      setIsPostDialogOpen(true);
    },
    []
  );

  const handleDeleteEvent = useCallback((event: EventRecord) => {
    setEventPendingDelete(event);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDeleteEvent = useCallback(async () => {
    if (!eventPendingDelete) return;
    try {
      await apiClient.delete(`/dcsa/events/${eventPendingDelete.id}`);
      toast({
        title: "Event removed",
        description: `"${eventPendingDelete.title}" has been deleted.`,
      });
      setIsDeleteModalOpen(false);
      setEventPendingDelete(null);
      loadEvents();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getErrorMessage(error) || "Unable to delete this event.",
        variant: "destructive",
      });
    }
  }, [eventPendingDelete, loadEvents, toast]);

  const handleParticipationRequest = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to request participation.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiClient.post(`/dcsa/events/${eventId}/participation`, {});
      toast({
        title: "Request sent",
        description: "Your participation request is pending approval.",
      });
      loadParticipation();
    } catch (error) {
      toast({
        title: "Request failed",
        description: getErrorMessage(error) || "Unable to submit participation request.",
        variant: "destructive",
      });
    }
  };

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to post an event.",
        variant: "destructive",
      });
      return;
    }

    try {
      const startDate = newEvent.start_date ? new Date(newEvent.start_date) : null;
      const endDate = newEvent.end_date ? new Date(newEvent.end_date) : null;
      const registrationDeadline = newEvent.registration_deadline
        ? new Date(newEvent.registration_deadline)
        : null;

      const payload = {
        title: newEvent.title,
        summary: newEvent.summary || undefined,
        description: newEvent.description || undefined,
        event_type: newEvent.event_type || undefined,
        organized_by: newEvent.organized_by || undefined,
        club: newEvent.club || undefined,
        department: newEvent.department || undefined,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined,
        venue: newEvent.venue || undefined,
        location: newEvent.location || undefined,
        city: newEvent.city || undefined,
        state: newEvent.state || undefined,
        is_virtual: newEvent.is_virtual,
        livestream_link: newEvent.livestream_link || undefined,
        registration_required: newEvent.registration_required,
        registration_deadline: registrationDeadline ? registrationDeadline.toISOString() : undefined,
        registration_link: newEvent.registration_link || undefined,
        max_participants: newEvent.max_participants ? Number(newEvent.max_participants) : undefined,
        min_participants: newEvent.min_participants ? Number(newEvent.min_participants) : undefined,
        waitlist_enabled: newEvent.waitlist_enabled,
        is_paid: newEvent.is_paid,
        fee_amount: newEvent.fee_amount ? Number(newEvent.fee_amount) : undefined,
        fee_currency: newEvent.fee_currency || undefined,
        tags: newEvent.tags
          ? newEvent.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : undefined,
        guest_speakers: newEvent.guest_speakers
          ? newEvent.guest_speakers.split(",").map((speaker) => speaker.trim()).filter(Boolean)
          : undefined,
        primary_contact: newEvent.primary_contact_name || newEvent.primary_contact_email || newEvent.primary_contact_phone
          ? {
              name: newEvent.primary_contact_name || undefined,
              email: newEvent.primary_contact_email || undefined,
              phone: newEvent.primary_contact_phone || undefined,
            }
          : undefined,
        banner_url: newEvent.banner_url || undefined,
      };

      let response: { message: string; event: EventRecord };

      if (newEvent.id) {
        response = await apiClient.put<{ message: string; event: EventRecord }>(`/dcsa/events/${newEvent.id}`, payload);
      } else {
        response = await apiClient.post<{ message: string; event: EventRecord }>("/dcsa/events", payload);
      }

      toast({
        title: response?.message || (newEvent.id ? "Event updated!" : "Event submitted!"),
        description:
          user.role === "admin"
            ? "Your event is live for students."
            : "Your event has been submitted for admin approval.",
      });

      setIsPostDialogOpen(false);
      resetForm();

      // Force reload events to ensure new event appears
      await loadEvents();
    } catch (error) {
      console.error("Error posting event:", error);
      toast({
        title: "Error posting event",
        description: getErrorMessage(error) || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const departmentOptions = useMemo(() => {
    const values = events.map(evt => evt.department).filter((val): val is string => Boolean(val));
    return Array.from(new Set(values)).sort();
  }, [events]);

  const eventTypeOptions = useMemo(() => {
    const values = events.map(evt => evt.event_type).filter((val): val is string => Boolean(val));
    return Array.from(new Set(values)).sort();
  }, [events]);

  const filteredEvents = events.filter(event => {
    const matchesDepartment = selectedDepartment === "all" || event.department === selectedDepartment;
    const matchesType = selectedType === "all" || event.event_type === selectedType;
    const matchesSearch = searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDepartment && matchesType && matchesSearch;
  });

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (startDate?: string, endDate?: string) => {
    const now = new Date();
    if (!startDate) return { label: "TBD", variant: "secondary" as const };

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    if (now < start) {
      return { label: "Upcoming", variant: "default" as const };
    } else if (now >= start && now <= end) {
      return { label: "Ongoing", variant: "destructive" as const };
    } else {
      return { label: "Ended", variant: "secondary" as const };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              University Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {user?.role === 'alumni' 
                ? 'Discover and post events for the university community' 
                : 'Discover upcoming events, workshops, and networking opportunities across all departments.'
              }
            </p>
          </div>
          {(user?.role === "alumni" || user?.role === "admin") && (
            <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl md:max-w-5xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{user?.role === "admin" ? "Create Event" : "Post a New Event"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePostEvent} className="grid gap-8 md:grid-cols-2">
                  <section className="md:col-span-2 grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventType">Event Type</Label>
                      <Input
                        id="eventType"
                        value={newEvent.event_type}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, event_type: e.target.value }))}
                        placeholder="Workshop, Talk, Meetup..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="organizedBy">Organized By</Label>
                      <Input
                        id="organizedBy"
                        value={newEvent.organized_by}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, organized_by: e.target.value }))}
                        placeholder="e.g., Department of CS"
                      />
                    </div>
                    <div>
                      <Label htmlFor="club">Club / Cell</Label>
                      <Input
                        id="club"
                        value={newEvent.club}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, club: e.target.value }))}
                        placeholder="TPC, Cultural Club, Green Club..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newEvent.department}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, department: e.target.value }))}
                        placeholder="Department, School, or Cell"
                      />
                    </div>
                    <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="summary">Short Summary</Label>
                        <Input
                          id="summary"
                          value={newEvent.summary}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, summary: e.target.value }))}
                          placeholder="One line highlight"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                          id="tags"
                          value={newEvent.tags}
                          onChange={(e) => setNewEvent((prev) => ({ ...prev, tags: e.target.value }))}
                          placeholder="Hackathon, Placement, Guest Lecture"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent((prev) => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        required
                      />
                    </div>
                  </section>

                  <div className="space-y-6">
                    <section className="space-y-4 rounded-lg border border-border/60 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Schedule</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="startDate">Start Date & Time</Label>
                          <Input
                            id="startDate"
                            type="datetime-local"
                            value={newEvent.start_date}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, start_date: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">End Date & Time</Label>
                          <Input
                            id="endDate"
                            type="datetime-local"
                            value={newEvent.end_date}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, end_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                          <Input
                            id="registrationDeadline"
                            type="datetime-local"
                            value={newEvent.registration_deadline}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, registration_deadline: e.target.value }))}
                            disabled={!newEvent.registration_required}
                          />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 rounded-lg border border-border/60 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Location</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="isVirtual"
                            checked={newEvent.is_virtual}
                            onCheckedChange={(checked) =>
                              setNewEvent((prev) => ({ ...prev, is_virtual: checked === true }))
                            }
                          />
                          <Label htmlFor="isVirtual" className="font-normal">Virtual event</Label>
                        </div>
                        <div>
                          <Label htmlFor="venue">Venue</Label>
                          <Input
                            id="venue"
                            value={newEvent.venue}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, venue: e.target.value }))}
                            placeholder="Main Auditorium"
                            disabled={newEvent.is_virtual}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location Details</Label>
                          <Input
                            id="location"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, location: e.target.value }))}
                            placeholder="Campus, Building, etc."
                            disabled={newEvent.is_virtual}
                          />
                        </div>
                        {newEvent.is_virtual && (
                          <div>
                            <Label htmlFor="livestreamLink">Virtual / Livestream Link</Label>
                            <Input
                              id="livestreamLink"
                              type="url"
                              value={newEvent.livestream_link}
                              onChange={(e) => setNewEvent((prev) => ({ ...prev, livestream_link: e.target.value }))}
                              placeholder="https://meet..."
                            />
                          </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={newEvent.city}
                              onChange={(e) => setNewEvent((prev) => ({ ...prev, city: e.target.value }))}
                              disabled={newEvent.is_virtual}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={newEvent.state}
                              onChange={(e) => setNewEvent((prev) => ({ ...prev, state: e.target.value }))}
                              disabled={newEvent.is_virtual}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-6">
                    <section className="space-y-4 rounded-lg border border-border/60 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Registration</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="registrationLink">Registration Link</Label>
                          <Input
                            id="registrationLink"
                            type="url"
                            value={newEvent.registration_link}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, registration_link: e.target.value }))}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label htmlFor="minParticipants">Min Participants</Label>
                            <Input
                              id="minParticipants"
                              type="number"
                              min={0}
                              value={newEvent.min_participants}
                              onChange={(e) => setNewEvent((prev) => ({ ...prev, min_participants: e.target.value }))}
                              placeholder="e.g., 10"
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxParticipants">Max Participants</Label>
                            <Input
                              id="maxParticipants"
                              type="number"
                              min={0}
                              value={newEvent.max_participants}
                              onChange={(e) => setNewEvent((prev) => ({ ...prev, max_participants: e.target.value }))}
                              placeholder="e.g., 100"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="registrationRequired"
                              checked={newEvent.registration_required}
                              onCheckedChange={(checked) =>
                                setNewEvent((prev) => ({ ...prev, registration_required: checked === true }))
                              }
                            />
                            <Label htmlFor="registrationRequired">Registration required</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="waitlistEnabled"
                              checked={newEvent.waitlist_enabled}
                              onCheckedChange={(checked) =>
                                setNewEvent((prev) => ({ ...prev, waitlist_enabled: checked === true }))
                              }
                            />
                            <Label htmlFor="waitlistEnabled">Enable waitlist</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Pricing</Label>
                          <RadioGroup
                            value={newEvent.is_paid ? "paid" : "free"}
                            onValueChange={(value) =>
                              setNewEvent((prev) => ({
                                ...prev,
                                is_paid: value === "paid",
                                fee_amount: value === "paid" ? prev.fee_amount : "",
                              }))
                            }
                            className="grid grid-cols-2 gap-2"
                          >
                            <div className="flex items-center space-x-2 rounded-md border border-border/60 p-2">
                              <RadioGroupItem value="free" id="eventFree" />
                              <Label htmlFor="eventFree" className="font-normal">Free</Label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border border-border/60 p-2">
                              <RadioGroupItem value="paid" id="eventPaid" />
                              <Label htmlFor="eventPaid" className="font-normal">Paid</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        {newEvent.is_paid && (
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <Label htmlFor="feeAmount">Fee Amount</Label>
                              <Input
                                id="feeAmount"
                                type="number"
                                min={0}
                                value={newEvent.fee_amount}
                                onChange={(e) => setNewEvent((prev) => ({ ...prev, fee_amount: e.target.value }))}
                                placeholder="e.g., 500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="feeCurrency">Currency</Label>
                              <Input
                                id="feeCurrency"
                                value={newEvent.fee_currency}
                                onChange={(e) => setNewEvent((prev) => ({ ...prev, fee_currency: e.target.value }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="space-y-4 rounded-lg border border-border/60 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contacts</h4>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label htmlFor="guestSpeakers">Guest Speakers (comma separated)</Label>
                          <Input
                            id="guestSpeakers"
                            value={newEvent.guest_speakers}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, guest_speakers: e.target.value }))}
                            placeholder="Dr. A, Ms. B"
                          />
                        </div>
                        <div>
                          <Label htmlFor="primaryContactName">Primary Contact Name</Label>
                          <Input
                            id="primaryContactName"
                            value={newEvent.primary_contact_name}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, primary_contact_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
                          <Input
                            id="primaryContactEmail"
                            type="email"
                            value={newEvent.primary_contact_email}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, primary_contact_email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
                          <Input
                            id="primaryContactPhone"
                            value={newEvent.primary_contact_phone}
                            onChange={(e) => setNewEvent((prev) => ({ ...prev, primary_contact_phone: e.target.value }))}
                          />
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4 rounded-lg border border-border/60 p-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Media</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Banner Image</Label>
                          <div
                            onDragOver={handleBannerDragOver}
                            onDragLeave={handleBannerDragLeave}
                            onDrop={handleBannerDrop}
                            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                              isBannerDragActive ? "border-primary bg-primary/5" : "border-border/60"
                            }`}
                          >
                            {newEvent.banner_url ? (
                              <div className="space-y-3">
                                <img
                                  src={newEvent.banner_url}
                                  alt="Banner preview"
                                  className="max-h-40 w-full rounded-md object-cover"
                                />
                                <div className="flex items-center justify-center gap-3">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => bannerFileInputRef.current?.click()}
                                  >
                                    Replace image
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                      setNewEvent((prev) => ({ ...prev, banner_url: "" }));
                                      setBannerError(null);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                  Drag & drop a banner image here, or
                                </p>
                                <Button type="button" variant="secondary" onClick={() => bannerFileInputRef.current?.click()}>
                                  Browse files
                                </Button>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">
                                    JPG or PNG, recommended 1200×675px.
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    We compress images to stay under 100 KB for faster uploads.
                                  </p>
                                </div>
                              </div>
                            )}
                            {bannerError && (
                              <p className="mt-3 text-sm text-destructive">{bannerError}</p>
                            )}
                            <input
                              ref={bannerFileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleBannerInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="md:col-span-2 bg-muted p-4 rounded-lg text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Note:</strong> {user?.role === "admin"
                        ? "Your event will be published immediately after saving."
                        : "Your event will be submitted for admin approval before being published."}
                    </p>
                    <p>Provide as much detail as possible to help students and alumni decide quickly.</p>
                  </section>

                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit">
                      {user?.role === "admin" ? "Publish Event" : "Submit Event for Approval"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filter */}
        <Card className="mb-8 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Filter & Search Events</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Events</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Event Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {eventTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedDepartment !== "all" || selectedType !== "all" || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedDepartment !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedDepartment}
                    <button onClick={() => setSelectedDepartment("all")} className="ml-1 hover:bg-muted rounded-full">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedType !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {selectedType}
                    <button onClick={() => setSelectedType("all")} className="ml-1 hover:bg-muted rounded-full">
                      ×
                    </button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-muted rounded-full">
                      ×
                    </button>
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedDepartment("all");
                    setSelectedType("all");
                    setSearchQuery("");
                  }}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </p>
          {filteredEvents.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {filteredEvents.length === events.length ? "All events" : "Filtered results"}
            </p>
          )}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event.start_date, event.end_date);
            return (
            <Card key={event.id} className="shadow-elegant hover:shadow-glow transition-all duration-300 group overflow-hidden">
              <div className="aspect-video relative">
                {event.banner_url ? (
                  <img
                    src={event.banner_url}
                    alt={`${event.title} banner`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-card" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"></div>
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge className={`${eventStatus.variant === "destructive" 
                      ? "bg-red-500/90" 
                      : eventStatus.variant === "default"
                      ? "bg-green-500/90"
                      : "bg-gray-500/90"
                  } text-white border-white/30 font-semibold`}>
                    {eventStatus.label}
                  </Badge>
                  {event.club && (
                    <Badge className="bg-blue-600 text-white border-white/30 font-semibold">
                      {event.club}
                    </Badge>
                  )}
                </div>
                {user?.role === "admin" && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEditEvent(event)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event)}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <CardContent className="p-6">

                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                {event.summary && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {event.summary}
                  </p>
                )}

                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="bg-primary/5 p-3 rounded-md space-y-2">
                    <div className="flex items-start text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-primary mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground">Start Date</p>
                        <p className="text-muted-foreground">{formatDate(event.start_date)}</p>
                        <p className="text-muted-foreground">{formatTime(event.start_date)}</p>
                      </div>
                    </div>
                    {event.end_date && (
                      <div className="flex items-start text-sm border-t border-border/50 pt-2">
                        <Clock className="w-4 h-4 mr-2 text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">End Date</p>
                          <p className="text-muted-foreground">{formatDate(event.end_date)}</p>
                          <p className="text-muted-foreground">{formatTime(event.end_date)}</p>
                        </div>
                      </div>
                    )}
                    {event.registration_deadline && (
                      <div className="flex items-start text-sm border-t border-border/50 pt-2">
                        <Clock className="w-4 h-4 mr-2 text-destructive mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground">Registration Deadline</p>
                          <p className="text-muted-foreground">{formatDate(event.registration_deadline)}</p>
                          <p className="text-muted-foreground">{formatTime(event.registration_deadline)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {event.venue && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span>{event.venue}</span>
                    </div>
                  )}
                  {typeof event.max_participants === "number" && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      <span>Max {event.max_participants} attendees</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <UserPlus className="w-4 h-4 mr-2 text-primary" />
                    <span>{event.participant_summary?.total ?? 0} registered</span>
                  </div>
                  {event.participant_summary?.by_department?.length ? (
                    <div className="text-xs text-muted-foreground space-y-1 pl-1">
                      <p className="font-semibold">Departments:</p>
                      <div className="flex flex-wrap gap-1">
                        {event.participant_summary.by_department.map((item, index) => (
                          <Badge key={`${event.id}-dept-${index}`} variant="outline" className="text-xs">
                            {(item.department && item.department.trim()) || "General"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={event.is_paid ? "destructive" : "outline"} className="uppercase tracking-wide">
                      {event.is_paid ? "Paid" : "Free"}
                      {event.is_paid && event.fee_amount ? ` • ₹${event.fee_amount}` : ""}
                    </Badge>
                    {event.visibility && (
                      <Badge variant="secondary" className="uppercase tracking-wide">
                        {event.visibility}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">Status: {event.status}</Badge>
                  {event.approval_notes && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      Admin notes: {event.approval_notes}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 mb-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {event.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{event.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <EventActions
                    event={event}
                    userRole={user?.role}
                    participationStatus={participation[event.id]}
                    onRequestParticipation={handleParticipationRequest}
                    onRefresh={loadEvents}
                  />

                  {event.organizer && (event.organizer.name || event.created_by_role) && (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded">
                      <p className="font-semibold mb-1">Organized by</p>
                      <p>{event.organizer.name || (event.created_by_role ? event.created_by_role.charAt(0).toUpperCase() + event.created_by_role.slice(1) : "Unknown organizer")}</p>
                      {event.organizer.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {event.organizer.email}
                        </p>
                      )}
                    </div>
                  )}

                  {event.primary_contact && (event.primary_contact.email || event.primary_contact.phone) && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
                      <p className="font-semibold mb-1">Primary contact</p>
                      {event.primary_contact.name && <p>{event.primary_contact.name}</p>}
                      {event.primary_contact.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {event.primary_contact.email}
                        </p>
                      )}
                      {event.primary_contact.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {event.primary_contact.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {event.registration_link && (
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(event.registration_link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      External Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No events found for the selected department.
            </p>
          </div>
        )}

        {/* Upcoming Events Banner */}
        <Card className="mt-12 bg-gradient-card border-0 shadow-elegant">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Don't Miss Out!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Stay updated with the latest events and opportunities. Join our mailing list to receive notifications about upcoming workshops, seminars, and networking events.
            </p>
            <Button className="bg-primary hover:bg-primary/90">
              Subscribe to Updates
            </Button>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. {eventPendingDelete?.title ? `“${eventPendingDelete.title}” will be removed.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setEventPendingDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmDeleteEvent();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

interface EventActionsProps {
  event: EventRecord;
  userRole?: string;
  participationStatus?: ParticipationStatus;
  onRequestParticipation: (eventId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const EventActions = ({ event, userRole, participationStatus, onRequestParticipation, onRefresh }: EventActionsProps) => {
  const { toast } = useToast();
  const [moderating, setModerating] = useState(false);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const handleModeration = async (status: "approved" | "rejected") => {
    setModerating(true);
    try {
      await apiClient.put(`/dcsa/events/${event.id}/status`, { status });
      toast({
        title: `Event ${status}`,
        description: status === "approved" ? "Event is now visible to students." : "Event has been rejected.",
      });
      await onRefresh();
    } catch (error) {
      toast({
        title: "Moderation failed",
        description: getErrorMessage(error) || "Unable to update event status.",
        variant: "destructive",
      });
    } finally {
      setModerating(false);
    }
  };

  const handleReview = async (userId: string, status: "approved" | "rejected") => {
    setReviewing(userId);
    try {
      await apiClient.post(`/dcsa/events/${event.id}/participation/${userId}`, { status });
      toast({
        title: `Participation ${status}`,
        description: "Student has been notified of the decision.",
      });
      await onRefresh();
    } catch (error) {
      toast({
        title: "Update failed",
        description: getErrorMessage(error) || "Unable to update participation request.",
        variant: "destructive",
      });
    } finally {
      setReviewing(null);
    }
  };

  if (userRole === "student") {
    if (participationStatus) {
      const { approval_status } = participationStatus;
      return (
        <Button className="w-full" disabled>
          {approval_status === "approved" ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" /> Approved
            </>
          ) : approval_status === "rejected" ? (
            <>
              <ShieldAlert className="w-4 h-4 mr-2" /> Rejected
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Pending approval
            </>
          )}
        </Button>
      );
    }

    if (event.status !== "approved") {
      return (
        <Button className="w-full" variant="outline" disabled>
          Awaiting approval
        </Button>
      );
    }

    return (
      <Button className="w-full" onClick={() => onRequestParticipation(event.id)}>
        <Users className="w-4 h-4 mr-2" /> Request to participate
      </Button>
    );
  }

  if (userRole === "admin") {
    return (
      <div className="space-y-3">
        {event.status === "pending" && (
          <div className="flex gap-2">
            <Button className="w-1/2" disabled={moderating} onClick={() => handleModeration("approved")}>Approve</Button>
            <Button className="w-1/2" variant="destructive" disabled={moderating} onClick={() => handleModeration("rejected")}>
              Reject
            </Button>
          </div>
        )}

        {event.participant_requests && event.participant_requests.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Participation requests</p>
            {event.participant_requests.map((request) => (
              <div key={request.user_id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{request.program || "Program unknown"}</span>
                  <Badge variant={request.approval_status === "approved" ? "default" : request.approval_status === "rejected" ? "destructive" : "outline"}>
                    {request.approval_status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" disabled={reviewing === request.user_id}
                    onClick={() => handleReview(request.user_id, "approved")}>
                    <ShieldCheck className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" disabled={reviewing === request.user_id}
                    onClick={() => handleReview(request.user_id, "rejected")}>
                    <ShieldAlert className="w-3 h-3 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Events;