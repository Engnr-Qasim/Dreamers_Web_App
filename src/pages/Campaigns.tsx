import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CampaignCard from '@/components/dashboard/CampaignCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CAMPAIGNS, ACTIVITIES } from '@/lib/campaigns';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCampaigns } from '@/lib/storage';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Crown } from 'lucide-react';

const Campaigns: React.FC = () => {
  const { user } = useAuth();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  const [selectedActivity, setSelectedActivity] = useState<typeof ACTIVITIES[0] | null>(null);
  const [joinedCampaignIds, setJoinedCampaignIds] = useState<string[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      if (user) {
        const campaigns = await getUserCampaigns(user.id);
        setJoinedCampaignIds(campaigns);
      }
    };
    loadCampaigns();
  }, [user]);

  const handleJoinChange = () => {
    forceUpdate();
    // Reload campaigns
    if (user) {
      getUserCampaigns(user.id).then(setJoinedCampaignIds);
    }
  };

  const joinedCampaigns = CAMPAIGNS.filter(c => joinedCampaignIds.includes(c.id));

  const categoryCounts = {
    all: CAMPAIGNS.length,
    environment: CAMPAIGNS.filter(c => c.category === 'environment').length,
    community: CAMPAIGNS.filter(c => c.category === 'community').length,
    awareness: CAMPAIGNS.filter(c => c.category === 'awareness').length,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>🚀</span> Campaigns & Activities
          </h1>
          <p className="text-muted-foreground mt-2">
            Join campaigns and participate in activities to make a difference
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
          <Card className="gradient-card border-0 shadow-card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{categoryCounts.all}</p>
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
          </Card>
          <Card className="gradient-card border-0 shadow-card p-4 text-center">
            <p className="text-3xl font-bold text-success">{joinedCampaigns.length}</p>
            <p className="text-sm text-muted-foreground">Your Campaigns</p>
          </Card>
          <Card className="gradient-card border-0 shadow-card p-4 text-center">
            <p className="text-3xl font-bold text-info">{ACTIVITIES.length}</p>
            <p className="text-sm text-muted-foreground">Activities</p>
          </Card>
          <Card className="gradient-card border-0 shadow-card p-4 text-center">
            <p className="text-3xl font-bold text-warning">
              {CAMPAIGNS.reduce((acc, c) => acc + c.participants, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Total Participants</p>
          </Card>
        </div>

        {/* Campaigns Tabs */}
        <Tabs defaultValue="all" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
            <TabsTrigger value="all">All ({categoryCounts.all})</TabsTrigger>
            <TabsTrigger value="environment">🌳 Environment</TabsTrigger>
            <TabsTrigger value="community">🏘️ Community</TabsTrigger>
            <TabsTrigger value="awareness">📢 Awareness</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CAMPAIGNS.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign}
                  onJoinChange={handleJoinChange}
                />
              ))}
            </div>
          </TabsContent>
          
          {['environment', 'community', 'awareness'].map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {CAMPAIGNS.filter(c => c.category === category).map((campaign) => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onJoinChange={handleJoinChange}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Activities Section */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>⚡</span> Upcoming Activities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACTIVITIES.map((activity) => (
              <Card 
                key={activity.id}
                className="hover-lift gradient-card border-0 shadow-card overflow-hidden cursor-pointer group"
                onClick={() => setSelectedActivity(activity)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      {activity.icon}
                    </span>
                    {activity.isPremium && (
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <h3 className="font-semibold">{activity.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Your Joined Campaigns */}
        {joinedCampaigns.length > 0 && (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span>🏆</span> Your Campaigns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {joinedCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign}
                  onJoinChange={handleJoinChange}
                />
              ))}
            </div>
          </div>
        )}

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
                  <p className="text-sm font-medium text-warning flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    This is a premium activity
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Premium activities offer exclusive experiences and benefits.
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

export default Campaigns;
