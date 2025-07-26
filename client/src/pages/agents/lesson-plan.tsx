import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardList, Loader2, CheckCircle, Clock, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { offlineStorage } from "@/lib/offline-storage";
import type { Language } from "@shared/schema";
import { getTranslation } from "@/lib/language-utils";

interface LessonPlanProps {
  language: Language;
}

export default function LessonPlan({ language }: LessonPlanProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject: '',
    grades: [] as number[],
    timeLimit: 45,
    topic: '',
    language: language,
    materials: [] as string[],
  });
  const [result, setResult] = useState<any>(null);

  const availableMaterials = [
    { id: 'cardboard', name: getTranslation('cardboard', language) },
    { id: 'clay', name: getTranslation('clay', language) },
    { id: 'leaves', name: getTranslation('leaves', language) },
    { id: 'plastic', name: getTranslation('plastic', language) },
    { id: 'stones', name: getTranslation('stones', language) },
    { id: 'fabric', name: getTranslation('fabric', language) },
  ];

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/agents/lesson-plan/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: getTranslation("success", language),
        description: getTranslation("lesson-plan-success", language),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
    },
    onError: (error) => {
      toast({
        title: getTranslation("error", language),
        description: getTranslation("lesson-plan-error", language),
        variant: "destructive",
      });
      
      if (offlineStorage.isOffline()) {
        offlineStorage.addToOfflineQueue({
          id: Date.now().toString(),
          type: 'lesson-plan-generate',
          endpoint: '/api/agents/lesson-plan/generate',
          data: formData,
          timestamp: new Date(),
        });
        
        toast({
          title: getTranslation("offline-mode", language),
          description: getTranslation("request-will-process-online", language),
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || formData.grades.length === 0 || !formData.topic) {
      toast({
        title: getTranslation("error", language),
        description: getTranslation("fill-all-required-fields", language),
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate(formData);
  };

  const handleGradeChange = (grade: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      grades: checked 
        ? [...prev.grades, grade].sort((a, b) => a - b)
        : prev.grades.filter(g => g !== grade)
    }));
  };

  const handleMaterialChange = (materialId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      materials: checked 
        ? [...prev.materials, materialId]
        : prev.materials.filter(id => id !== materialId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-secondary text-white p-3 rounded-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{getTranslation('lesson-plan-assistant', language)}</h1>
            <p className="text-gray-600">🧩 {getTranslation('lesson-plan-tagline', language)}</p>
          </div>
        </div>
        <p className="text-gray-700">
          {getTranslation('lesson-plan-description', language)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('create-lesson-plan', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">{getTranslation('subject', language)} *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder={getTranslation('subject-placeholder', language)}
                  required
                />
              </div>

              <div>
                <Label>{getTranslation('grades-multigrade', language)} *</Label>
                <p className="text-sm text-gray-600 mb-3">{getTranslation('select-grades-include', language)}</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(grade => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={formData.grades.includes(grade)}
                        onCheckedChange={(checked) => handleGradeChange(grade, checked as boolean)}
                      />
                      <Label htmlFor={`grade-${grade}`} className="text-sm">
                        {grade}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="topic">{getTranslation('topic', language)} *</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder={getTranslation('topic-placeholder', language)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="timeLimit">{getTranslation('time-limit-minutes', language)}</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    id="timeLimit"
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    min="30"
                    max="90"
                    placeholder="45"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">{getTranslation('available-materials', language)}</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {availableMaterials.map(material => (
                    <div key={material.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={material.id}
                        checked={formData.materials.includes(material.id)}
                        onCheckedChange={(checked) => handleMaterialChange(material.id, checked as boolean)}
                      />
                      <Label htmlFor={material.id} className="text-sm">
                        {material.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {generateMutation.isPending ? getTranslation('generating', language) : getTranslation('create-lesson-plan', language)}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('lesson-plan', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            {generateMutation.isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : result ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {getTranslation('lesson-plan-success', language)}
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h3 className="font-semibold mb-2">{getTranslation('title', language)}:</h3>
                  <p className="text-gray-700">{result.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{getTranslation('objective', language)}:</h3>
                  <p className="text-gray-700">{result.objective}</p>
                </div>

                {result.timeBreakdown && (
                  <div>
                    <h3 className="font-semibold mb-2">{getTranslation('time-breakdown', language)}:</h3>
                    <div className="space-y-2">
                      {result.timeBreakdown.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{item.activity}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{getTranslation('grade', language)} {item.grades?.join(', ')}</span>
                            <span className="text-sm font-medium">{item.duration} {getTranslation('minutes', language)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">{getTranslation('detailed-instructions', language)}:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{result.instructions}</pre>
                  </div>
                </div>

                {result.adaptations && (
                  <div>
                    <h3 className="font-semibold mb-2">कक्षा अनुकूलन:</h3>
                    <p className="text-gray-700">{result.adaptations}</p>
                  </div>
                )}

                {result.materials && (
                  <div>
                    <h3 className="font-semibold mb-2">आवश्यक सामग्री:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.materials.map((material: string, index: number) => (
                        <li key={index} className="text-gray-700">{material}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full" onClick={() => window.print()}>
                  प्रिंट करें
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>पाठ योजना बनाने के लिए फॉर्म भरें</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
