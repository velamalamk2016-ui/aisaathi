import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Package, Box } from "lucide-react";
import { getTranslation, getDynamicTranslation, type Language } from "@/lib/language-utils";
import type { Resource } from "@shared/schema";

interface ResourceSuggestionsProps {
  resources: Resource[];
  language: Language;
}

export function ResourceSuggestions({ resources, language }: ResourceSuggestionsProps) {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'leaves':
        return Leaf;
      case 'clay':
        return Package;
      case 'cardboard':
      case 'plastic':
        return Box;
      default:
        return Package;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'leaves':
        return 'bg-green-50 border-green-200';
      case 'clay':
        return 'bg-orange-50 border-orange-200';
      case 'cardboard':
        return 'bg-blue-50 border-blue-200';
      case 'plastic':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'leaves':
        return 'bg-green-500';
      case 'clay':
        return 'bg-orange-500';
      case 'cardboard':
        return 'bg-blue-500';
      case 'plastic':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{getTranslation('local-resource-suggestions', language)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{getTranslation('no-resources-available', language)}</p>
          ) : (
            resources.slice(0, 3).map((resource) => {
              const Icon = getResourceIcon(resource.type);
              return (
                <div key={resource.id} className={`resource-item ${getResourceColor(resource.type)}`}>
                  <div className={`${getIconColor(resource.type)} text-white p-2 rounded-full`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{getDynamicTranslation(resource.name, language)}</p>
                    <p className="text-xs text-gray-600">{getDynamicTranslation(resource.description, language)}</p>
                  </div>
                  {resource.availability && (
                    <Badge variant="secondary" className="text-xs">
                      {getTranslation('available', language)}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
        <Button className="w-full mt-4 bg-primary hover:bg-primary/90">
          {getTranslation('view-more-resources', language)}
        </Button>
      </CardContent>
    </Card>
  );
}
