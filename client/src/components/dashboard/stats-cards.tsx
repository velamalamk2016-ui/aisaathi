import { Users, Book, Globe, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslation, type Language } from "@/lib/language-utils";
import type { DashboardStats } from "@shared/schema";

interface StatsCardsProps {
  stats: DashboardStats;
  language: Language;
}

export function StatsCards({ stats, language }: StatsCardsProps) {
  const statsData = [
    {
      title: getTranslation("todays-students", language),
      value: stats.studentsToday,
      icon: Users,
      color: "text-primary",
    },
    {
      title: getTranslation("completed-lessons", language),
      value: stats.completedLessons,
      icon: Book,
      color: "text-accent",
    },
    {
      title: getTranslation("active-languages", language),
      value: stats.activeLanguages,
      icon: Globe,
      color: "text-secondary",
    },
    {
      title: getTranslation("resource-usage", language),
      value: `${stats.resourceUsage}%`,
      icon: TrendingUp,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="stat-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
