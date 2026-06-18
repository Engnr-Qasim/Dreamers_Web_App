import React, { useState, useEffect } from 'react';
import { Flag, FileText, Trophy, Users } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import CampaignProgress from '@/components/dashboard/CampaignProgress';
import CampaignCard from '@/components/dashboard/CampaignCard';
import ActivityCard from '@/components/dashboard/ActivityCard';
import { useAuth } from '@/contexts/AuthContext';
import { CAMPAIGNS, ACTIVITIES } from '@/lib/campaigns';
import { getUserCampaigns, getUserReports } from '@/lib/storage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Home: React.FC = () => {
  const { user, profile } = useAuth();
  const [selectedActivity, setSelectedActivity] = React.useState<typeof ACTIVITIES[0] | null>(null);
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  const [joinedCampaignsCount, setJoinedCampaignsCount] = useState(0);
  const [submittedReportsCount, setSubmittedReportsCount] = useState(0);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const campaigns = await getUserCampaigns(user.id);
        setJoinedCampaignsCount(campaigns.length);
        const reports = await getUserReports(user.id);
        setSubmittedReportsCount(reports.length);
      }
    };
    loadUserData();
  }, [user]);

  const handleJoinChange = () => {
    forceUpdate();
    // Reload data
    if (user) {
      getUserCampaigns(user.id).then(campaigns => setJoinedCampaignsCount(campaigns.length));
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold">
            Welcome back, <span className="text-primary">{profile?.name?.split(' ')[0] || 'User'}</span>! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening with your environmental initiatives.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Joined Campaigns"
            value={joinedCampaignsCount}
            icon={Flag}
            description="Active participations"
          />
          <StatsCard
            title="Reports Submitted"
            value={submittedReportsCount}
            icon={FileText}
            description="Issues reported"
          />
          <StatsCard
            title="Impact Score"
            value={joinedCampaignsCount * 10 + submittedReportsCount * 5}
            icon={Trophy}
            description="Your contribution"
          />
          <StatsCard
            title="Community"
            value="500+"
            icon={Users}
            description="Active members"
          />
        </div>

        {/* Campaign Progress */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CampaignProgress campaigns={CAMPAIGNS} />
        </div>

        {/* Campaigns Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🌍</span> Active Campaigns
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAMPAIGNS.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign}
                onJoinChange={handleJoinChange}
              />
            ))}
          </div>
        </div>

        {/* Activities Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>⚡</span> Upcoming Activities
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACTIVITIES.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onClick={() => setSelectedActivity(activity)}
              />
            ))}
          </div>
        </div>

        {/* Activity Detail Modal */}
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedActivity?.icon}</span>
                {selectedActivity?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedActivity?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Event Date</p>
                <p className="font-semibold">
                  {selectedActivity && new Date(selectedActivity.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {selectedActivity?.isPremium && (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium text-warning">
                    ⭐ This is a premium activity
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Home;
