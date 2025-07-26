import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  ClipboardList, 
  CheckSquare, 
  Languages, 
  UserCog, 
  Gamepad2,
  Heart,
  Check
} from "lucide-react";
import { getTranslation, type Language } from "@/lib/language-utils";

interface AgentCardsProps {
  language: Language;
}

export function AgentCards({ language }: AgentCardsProps) {
  const agents = [
    {
      id: "teaching-aids",
      title: getTranslation('teaching-aids', language),
      description: getTranslation('teaching-aids-desc', language),
      icon: Briefcase,
      color: "bg-primary",
      status: getTranslation('active', language),
      statusColor: "bg-accent",
      emoji: "🎒",
      route: "/agents/teaching-aids",
    },
    {
      id: "lesson-plan",
      title: getTranslation('lesson-plan', language),
      description: getTranslation('lesson-plan-desc', language),
      icon: ClipboardList,
      color: "bg-secondary",
      status: getTranslation('available', language),
      statusColor: "bg-accent",
      emoji: "🧩",
      route: "/agents/lesson-plan",
    },
    {
      id: "assessment",
      title: getTranslation('assessment', language),
      description: getTranslation('assessment-desc', language),
      icon: CheckSquare,
      color: "bg-accent",
      status: getTranslation('ready', language),
      statusColor: "bg-accent",
      emoji: "📊",
      route: "/agents/assessment",
    },
    {
      id: "multilingual",
      title: getTranslation('multilingual', language),
      description: getTranslation('multilingual-desc', language),
      icon: Languages,
      color: "bg-purple-500",
      status: getTranslation('active', language),
      statusColor: "bg-accent",
      emoji: "🗣️",
      route: "/agents/multilingual",
    },
    {
      id: "admin",
      title: getTranslation('admin', language),
      description: getTranslation('admin-desc', language),
      icon: UserCog,
      color: "bg-indigo-500",
      status: getTranslation('running', language),
      statusColor: "bg-accent",
      emoji: "📑",
      route: "/agents/admin",
    },
    {
      id: "storyteller",
      title: getTranslation('storyteller', language),
      description: getTranslation('storyteller-desc', language),
      icon: Gamepad2,
      color: "bg-pink-500",
      status: getTranslation('ready', language),
      statusColor: "bg-accent",
      emoji: "🎮",
      route: "/agents/storyteller",
    },
    {
      id: "accessibility",
      title: getTranslation('accessibility', language),
      description: getTranslation('accessibility-desc', language),
      icon: Heart,
      color: "bg-orange-500",
      status: getTranslation('active', language),
      statusColor: "bg-accent",
      emoji: "♿",
      route: "/agents/accessibility",
    },
    {
      id: "evaluation",
      title: getTranslation('evaluation-assistant', language),
      description: getTranslation('evaluation-desc', language),
      icon: Check,
      color: "bg-purple-600",
      status: getTranslation('ready', language),
      statusColor: "bg-accent",
      emoji: "✅",
      route: "/agents/evaluation",
    },

  ];

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold text-neutral-900 mb-6">{getTranslation('ai-assistant-agents', language)}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="agent-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`${agent.color} text-white p-3 rounded-lg`}>
                  <agent.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">{agent.title}</h4>
                  <p className="text-sm text-gray-600">{agent.emoji} {agent.title}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 text-sm">{agent.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {agent.status}
                </Badge>
                <Link href={agent.route}>
                  <Button size="sm" className={`${agent.color} hover:opacity-90`}>
                    {getTranslation('use-now', language)}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
