import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  id: string;
  type: "report" | "campaign" | "achievement";
  title: string;
  description?: string;
  date: string;
  icon: string;
}

interface ActivityCardProps {
  activities: Activity[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activities }) => {
  // If no activities or empty array, show a message
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent activities yet.</p>
        <p className="text-sm mt-1">Start making an impact today!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
        >
          <span className="text-2xl">{activity.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{activity.title}</p>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
            </div>
            {activity.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {activity.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(activity.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityCard;
