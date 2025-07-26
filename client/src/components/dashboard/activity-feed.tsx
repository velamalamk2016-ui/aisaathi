import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Languages, BarChart3 } from "lucide-react";
import type { Activity } from "@shared/schema";
import { formatTime, getTranslation, getDynamicTranslation, type Language } from "@/lib/language-utils";

interface ActivityFeedProps {
  activities: Activity[];
  language: Language;
}

export function ActivityFeed({ activities, language }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'worksheet':
      case 'lesson-plan':
        return FileText;
      case 'translation':
        return Languages;
      case 'report':
      case 'quiz':
        return BarChart3;
      default:
        return FileText;
    }
  };

  const getActivityColor = (agentType: string) => {
    switch (agentType) {
      case 'teaching-aids':
        return 'bg-primary';
      case 'multilingual':
        return 'bg-secondary';
      case 'admin':
        return 'bg-accent';
      case 'assessment':
        return 'bg-purple-500';
      case 'lesson-plan':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${getTranslation('minutes-ago', language)}`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${getTranslation('hours-ago', language)}`;
    } else {
      const days = Math.floor(diffInMinutes / (24 * 60));
      return `${days} ${getTranslation('days-ago', language)}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{getTranslation('recent-activity', language)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{getTranslation('no-activities-found', language)}</p>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="activity-item">
                  <div className={`${getActivityColor(activity.agentType)} text-white p-2 rounded-full`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{getDynamicTranslation(activity.title, language)}</p>
                    <p className="text-xs text-gray-600">
                      {getDynamicTranslation(activity.description, language)} • {getTimeAgo(new Date(activity.createdAt))}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
