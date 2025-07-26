import { useQuery } from "@tanstack/react-query";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AgentCards } from "@/components/dashboard/agent-cards";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { offlineStorage } from "@/lib/offline-storage";
import { getTranslation } from "@/lib/language-utils";
import type { DashboardStats, Activity, Language } from "@shared/schema";

interface DashboardProps {
  language: Language;
}

export default function Dashboard({ language }: DashboardProps) {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    select: (data) => {
      // Cache for offline use
      if (data) {
        offlineStorage.saveDashboardStats(data);
      }
      return data;
    },
    placeholderData: () => {
      // Use cached data if available
      const cached = offlineStorage.getDashboardStats();
      return cached || undefined;
    },
  });

  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useQuery<Activity[]>({
    queryKey: ['/api/dashboard/activities'],
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    select: (data) => {
      // Cache for offline use
      if (data) {
        offlineStorage.saveActivities(data);
      }
      return data;
    },
    placeholderData: () => {
      // Use cached data if available
      const cached = offlineStorage.getActivities();
      return cached || undefined;
    },
  });

  if (statsError || activitiesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {getTranslation('error-loading-data', language)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {getTranslation('hero-title', language)}
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
              {getTranslation('hero-subtitle', language)}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>{getTranslation('offline-first', language)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>{getTranslation('multi-lingual', language)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>{getTranslation('multi-grade', language)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : stats ? (
          <StatsCards stats={stats} language={language} />
        ) : null}

        {/* Agent Cards */}
        <AgentCards language={language} />

        {/* Activity Feed */}
        <div className="max-w-4xl mx-auto">
          {activitiesLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <ActivityFeed activities={activities || []} language={language} />
          )}
        </div>
      </main>
    </>
  );
}
