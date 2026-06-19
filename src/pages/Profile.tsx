import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getUserCampaigns, getUserReports } from "@/lib/storage";
import { profileSchema } from "@/lib/validation";

const Profile: React.FC = () => {
  const { user } = useUser();
  const { updateUser } = useClerk();
  const { toast } = useToast();

  // Get user data from Clerk
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [joinedCampaignIds, setJoinedCampaignIds] = useState<string[]>([]);
  const [reportCount, setReportCount] = useState(0);

  // Load user data from Clerk
  useEffect(() => {
    if (user) {
      // Get full name from Clerk
      const fullName =
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
        "User";

      setName(fullName);
      setEmail(user.emailAddresses?.[0]?.emailAddress || "");

      // Get custom metadata if you've stored phone, location, description there
      // This assumes you've stored these in Clerk's public/private metadata
      const metadata = user.publicMetadata as any;
      setPhone(metadata?.phone || "");
      setLocation(metadata?.location || "");
      setDescription(metadata?.description || "");
    }
  }, [user]);

  // Load user's campaigns and reports from local storage
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const campaigns = await getUserCampaigns(user.id);
        setJoinedCampaignIds(campaigns);
        const reports = await getUserReports(user.id);
        setReportCount(reports.length);
      }
    };
    loadUserData();
  }, [user]);

  const handleSave = async () => {
    setErrors({});

    // Validate with Zod
    const result = profileSchema.safeParse({
      name,
      email,
      phone,
      location,
      description,
    });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Update Clerk user with new data
      await updateUser({
        firstName: name.split(" ")[0] || "",
        lastName: name.split(" ").slice(1).join(" ") || "",
        publicMetadata: {
          phone,
          location,
          description,
        },
      });

      // Update local state
      toast({
        title: "Profile Updated! ✨",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinedCampaigns = CAMPAIGNS.filter((c) =>
    joinedCampaignIds.includes(c.id),
  );
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-fade-in">
            <Avatar className="w-24 h-24 text-2xl gradient-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-muted-foreground">{email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary">
                  <MapPin className="w-3 h-3 mr-1" />
                  {location || "No location"}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  {joinedCampaignIds.length} Campaigns
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-success/10 text-success"
                >
                  {reportCount} Reports
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Edit Profile Form */}
            <Card className="lg:col-span-2 gradient-card border-0 shadow-card animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Edit Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        maxLength={100}
                        required
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        maxLength={20}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-10"
                        maxLength={500}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-destructive">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">About Me</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="pl-10 min-h-[100px]"
                      placeholder="Tell us about yourself and your environmental interests..."
                      maxLength={1000}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Joined Campaigns */}
            <Card
              className="gradient-card border-0 shadow-card animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏆</span>
                  My Campaigns
                </CardTitle>
                <CardDescription>Campaigns you've joined</CardDescription>
              </CardHeader>
              <CardContent>
                {joinedCampaigns.length > 0 ? (
                  <div className="space-y-3">
                    {joinedCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <span className="text-2xl">{campaign.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {campaign.participants} participants
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You haven't joined any campaigns yet.</p>
                    <p className="text-sm mt-1">
                      Visit the Campaigns page to get started!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
