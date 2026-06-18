import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Target } from 'lucide-react';
import { Campaign } from '@/lib/storage';
import { getProgressPercentage } from '@/lib/campaigns';
import { useAuth } from '@/contexts/AuthContext';
import { joinCampaign, leaveCampaign, isJoinedCampaign } from '@/lib/storage';
import { sendCampaignJoinNotification } from '@/lib/emailService';
import { useToast } from '@/hooks/use-toast';

interface CampaignCardProps {
  campaign: Campaign;
  onJoinChange?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onJoinChange }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkJoinStatus = async () => {
      if (user) {
        const joined = await isJoinedCampaign(user.id, campaign.id);
        setIsJoined(joined);
      }
    };
    checkJoinStatus();
  }, [user, campaign.id]);

  const percentage = getProgressPercentage(campaign);

  const handleJoinToggle = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      if (isJoined) {
        const success = await leaveCampaign(user.id, campaign.id);
        if (success) {
          setIsJoined(false);
          toast({
            title: 'Left Campaign',
            description: `You have left "${campaign.name}"`,
          });
        }
      } else {
        const success = await joinCampaign(user.id, campaign.id);
        if (success) {
          setIsJoined(true);
          
          // Send email notification
          await sendCampaignJoinNotification({
            from_name: profile?.name || 'User',
            from_email: profile?.email || user.email || 'anonymous@dreamers.app',
            phone: profile?.phone || undefined,
            action_type: 'Campaign',
            subject: `New Campaign Join: ${campaign.name}`,
            message: `${profile?.name || 'User'} has joined the "${campaign.name}" campaign!`,
            campaign_name: campaign.name,
            location: profile?.location || undefined,
          });
          
          toast({
            title: 'Joined Campaign! 🎉',
            description: `Welcome to "${campaign.name}"!`,
          });
        }
      }
      
      onJoinChange?.();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign membership',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    environment: 'bg-primary/10 text-primary',
    community: 'bg-info/10 text-info',
    awareness: 'bg-warning/10 text-warning',
  };

  return (
    <Card className="hover-lift gradient-card border-0 shadow-card overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
              {campaign.icon}
            </span>
            <div>
              <h3 className="font-semibold text-lg">{campaign.name}</h3>
              <Badge variant="secondary" className={categoryColors[campaign.category]}>
                {campaign.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {campaign.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{campaign.participants} joined</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{campaign.target} target</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          variant={isJoined ? 'outline' : 'default'}
          onClick={handleJoinToggle}
          disabled={loading}
        >
          {loading ? 'Processing...' : isJoined ? 'Leave Campaign' : 'Join Campaign'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
