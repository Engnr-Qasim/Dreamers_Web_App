import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getUserCampaigns, getUserReports } from "@/lib/storage";
import StatsCard from "@/components/dashboard/StatsCard";
import CampaignProgress from "@/components/dashboard/CampaignProgress";
import ActivityCard from "@/components/dashboard/ActivityCard";
import { Leaf, Users, TreePine, Award, Loader2 } from "lucide-react";

const Home: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [joinedCampaignIds, setJoinedCampaignIds] = useState<string[]>([]);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Use Clerk user ID - but note this might not work with Supabase if it expects UUID
        // For now, let's try to load data
        const campaigns = await getUserCampaigns(user.id);
        setJoinedCampaignIds(campaigns || []);

        const reports = await getUserReports(user.id);
        setReportCount(reports?.length || 0);
      } catch (error) {
        console.error("Error loading user data:", error);
        // Don't show toast here as it might be a Supabase UUID issue
        // We'll handle this gracefully
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Get user's name
  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "User";

  // Calculate stats
  const joinedCampaigns = CAMPAIGNS.filter((c) =>
    joinedCampaignIds.includes(c.id),
  );
  const totalCampaigns = CAMPAIGNS.length;
  const totalParticipants = CAMPAIGNS.reduce(
    (sum, c) => sum + c.participants,
    0,
  );
  const impactScore = Math.min(Math.round((reportCount / 10) * 100), 100);

  // Sample activities (fallback data)
  const sampleActivities = [
    {
      id: "1",
      type: "report" as const,
      title: "Welcome to Dreamers!",
      description: "Start by submitting your first environmental report",
      date: new Date().toISOString(),
      icon: "🌱",
    },
    {
      id: "2",
      type: "campaign" as const,
      title: "Explore Campaigns",
      description: "Join a campaign to make a difference",
      date: new Date().toISOString(),
      icon: "🏆",
    },
  ];

  if (loading || !isLoaded) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <div className="text-muted-foreground">
                Loading your dashboard...
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {userName.split(" ")[0]}! 🌱
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your environmental impact and join campaigns
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Campaigns Joined"
            value={joinedCampaignIds.length}
            icon={Users}
            description={`${joinedCampaignIds.length} active campaigns`}
          />
          <StatsCard
            title="Reports Submitted"
            value={reportCount}
            icon={Leaf}
            description="Environmental reports"
          />
          <StatsCard
            title="Impact Score"
            value={`${impactScore}%`}
            icon={TreePine}
            description="Your environmental impact"
          />
          <StatsCard
            title="Carbon Offset"
            value="0.5t"
            icon={Award}
            description="CO₂ offset estimated"
          />
        </div>

        {/* Campaign Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="gradient-card border-0 shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🌍</span>
                Campaign Progress
              </CardTitle>
              <CardDescription>
                Your active campaign contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {joinedCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {joinedCampaigns.slice(0, 3).map((campaign) => (
                    <CampaignProgress
                      key={campaign.id}
                      name={campaign.name}
                      icon={campaign.icon}
                      progress={Math.min(
                        Math.round((campaign.participants / 1000) * 100),
                        100,
                      )}
                      participants={campaign.participants}
                    />
                  ))}
                  {joinedCampaigns.length > 3 && (
                    <Button
                      variant="link"
                      className="w-full"
                      onClick={() => navigate("/campaigns")}
                    >
                      View all {joinedCampaigns.length} campaigns →
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-4">You haven't joined any campaigns yet.</p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/campaigns")}
                  >
                    Explore Campaigns
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card
            className="gradient-card border-0 shadow-card animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest environmental actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityCard activities={sampleActivities} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            className="h-20 flex flex-col gap-1 bg-primary hover:bg-primary/90"
            onClick={() => navigate("/reports")}
          >
            <span className="text-lg">📝</span>
            <span>Submit Report</span>
          </Button>
          <Button
            className="h-20 flex flex-col gap-1 bg-secondary hover:bg-secondary/90"
            onClick={() => navigate("/campaigns")}
          >
            <span className="text-lg">🏆</span>
            <span>Join Campaign</span>
          </Button>
          <Button
            className="h-20 flex flex-col gap-1 bg-accent hover:bg-accent/90"
            onClick={() => navigate("/profile")}
          >
            <span className="text-lg">👤</span>
            <span>Update Profile</span>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
