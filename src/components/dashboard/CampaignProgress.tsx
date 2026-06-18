import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Campaign } from '@/lib/storage';
import { getProgressPercentage } from '@/lib/campaigns';

interface CampaignProgressProps {
  campaigns: Campaign[];
}

const CampaignProgress: React.FC<CampaignProgressProps> = ({ campaigns }) => {
  return (
    <Card className="hover-lift gradient-card border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          Campaign Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {campaigns.map((campaign) => {
          const percentage = getProgressPercentage(campaign);
          return (
            <div key={campaign.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{campaign.icon}</span>
                  <span className="font-medium text-sm">{campaign.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {campaign.progress}/{campaign.target}
                </span>
              </div>
              <div className="relative">
                <Progress value={percentage} className="h-2" />
                <span className="absolute right-0 -top-5 text-xs text-muted-foreground">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CampaignProgress;
