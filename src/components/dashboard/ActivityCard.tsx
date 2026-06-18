import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Crown } from 'lucide-react';

interface Activity {
  id: string;
  name: string;
  description: string;
  icon: string;
  date: string;
  isPremium: boolean;
}

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card 
      className="hover-lift gradient-card border-0 shadow-card overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
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
          <span>{formattedDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
