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
import { Briefcase, Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { offlineStorage } from "@/lib/offline-storage";
import { getTranslation, getDynamicTranslation, type Language } from "@/lib/language-utils";
import type { Language as LangType } from "@shared/schema";

interface TeachingAidsProps {
  language: LangType;
}

export default function TeachingAids({ language }: TeachingAidsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    language: language,
    type: 'worksheet' as 'worksheet' | 'flashcard' | 'story',
    materials: [] as string[],
  });
  const [result, setResult] = useState<any>(null);

  const availableMaterials = [
    { id: 'cardboard', name: 'कार्डबोर्ड', nameEn: 'Cardboard' },
    { id: 'clay', name: 'मिट्टी', nameEn: 'Clay' },
    { id: 'leaves', name: 'पत्तियां', nameEn: 'Leaves' },
    { id: 'plastic', name: 'प्लास्टिक', nameEn: 'Plastic bottles' },
    { id: 'stones', name: 'पत्थर', nameEn: 'Stones' },
    { id: 'fabric', name: 'कपड़ा', nameEn: 'Fabric' },
    { id: 'colors', name: 'रंग', nameEn: 'Colored pencils/crayons' },
    { id: 'paper', name: 'कागज़', nameEn: 'Chart paper' },
  ];

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/agents/teaching-aids/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: getTranslation('success', language),
        description: getTranslation('teaching-aids-created', language),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
    },
    onError: (error) => {
      toast({
        title: getTranslation('error', language),
        description: getTranslation('teaching-aids-failed', language),
        variant: "destructive",
      });
      
      // Handle offline scenario
      if (offlineStorage.isOffline()) {
        offlineStorage.addToOfflineQueue({
          id: Date.now().toString(),
          type: 'teaching-aids-generate',
          endpoint: '/api/agents/teaching-aids/generate',
          data: formData,
          timestamp: new Date(),
        });
        
        toast({
          title: getTranslation('offline-mode', language),
          description: getTranslation('offline-request-queued', language),
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.grade || !formData.topic) {
      toast({
        title: getTranslation('error', language),
        description: getTranslation('fill-required-fields', language),
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      ...formData,
      grade: parseInt(formData.grade),
    });
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
          <div className="bg-primary text-white p-3 rounded-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{getTranslation('teaching-aids-agent', language)}</h1>
            <p className="text-gray-600">🎒 {getDynamicTranslation('शिक्षण सामग्री जनरेटर', language)}</p>
          </div>
        </div>
        <p className="text-gray-700">
          {getTranslation('teaching-aids-description', language)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('create-teaching-aids', language)}</CardTitle>
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
                <Label htmlFor="grade">{getTranslation('grade', language)} *</Label>
                <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={getTranslation('select-grade', language)} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {getTranslation('grade', language)} {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label htmlFor="type">{getTranslation('type', language)}</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worksheet">📝 {getTranslation('worksheet', language)}</SelectItem>
                    <SelectItem value="flashcard">🎨 {getTranslation('flashcard', language)} (Visual & Image-Based)</SelectItem>
                    <SelectItem value="story">📚 {getTranslation('story', language)}</SelectItem>
                  </SelectContent>
                </Select>
                
                {formData.type === 'flashcard' && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🎨 <strong>Visual Flashcards:</strong> Creates image-based learning cards with drawing instructions, 
                      color coding, and visual elements perfect for hands-on learning with local materials.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-base font-medium">{getTranslation('available-materials', language)}</Label>
                <p className="text-sm text-gray-600 mb-3">{getTranslation('select-materials', language)}</p>
                <div className="grid grid-cols-2 gap-3">
                  {availableMaterials.map(material => (
                    <div key={material.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={material.id}
                        checked={formData.materials.includes(material.id)}
                        onCheckedChange={(checked) => handleMaterialChange(material.id, checked as boolean)}
                      />
                      <Label htmlFor={material.id} className="text-sm">
                        {getDynamicTranslation(material.name, language)}
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
                {generateMutation.isPending ? getTranslation('creating', language) : getTranslation('create-teaching-aids', language)}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('result', language)}</CardTitle>
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
                    {getTranslation('teaching-aids-success', language)}
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h3 className="font-semibold mb-2">{getTranslation('title', language)}:</h3>
                  <p className="text-gray-700">{result.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{getTranslation('content', language)}:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{result.content}</pre>
                  </div>
                </div>

                {/* Enhanced display for image-based flashcards */}
                {result.flashcards && (
                  <div>
                    <h3 className="font-semibold mb-4">📸 Image-Based Flashcards:</h3>
                    <div className="grid gap-6">
                      {result.flashcards.map((card: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Front side with image */}
                            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                              <h4 className="font-medium text-blue-800 mb-2">📷 Front Image:</h4>
                              <div className="bg-white p-3 rounded border mb-3 min-h-[100px] flex items-center justify-center">
                                {card.imageType === 'svg' ? (
                                  <div dangerouslySetInnerHTML={{ __html: card.frontImage }} />
                                ) : (
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">📸</div>
                                    <p className="text-xs text-gray-600 italic">{card.frontImage}</p>
                                  </div>
                                )}
                              </div>
                              {card.frontText && (
                                <div className="text-center">
                                  <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                                    {card.frontText}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Back side with image */}
                            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                              <h4 className="font-medium text-green-800 mb-2">📷 Back Image:</h4>
                              <div className="bg-white p-3 rounded border mb-3 min-h-[100px] flex items-center justify-center">
                                {card.imageType === 'svg' ? (
                                  <div dangerouslySetInnerHTML={{ __html: card.backImage }} />
                                ) : (
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">📸</div>
                                    <p className="text-xs text-gray-600 italic">{card.backImage}</p>
                                  </div>
                                )}
                              </div>
                              {card.backText && (
                                <div className="text-center">
                                  <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">
                                    {card.backText}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Image details */}
                          <div className="mt-4 grid md:grid-cols-2 gap-4">
                            {card.imageType && (
                              <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                <h5 className="font-medium text-purple-800 mb-1">📱 Image Type:</h5>
                                <p className="text-sm text-purple-700 capitalize">{card.imageType}</p>
                              </div>
                            )}
                            
                            {card.realWorldExample && (
                              <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                <h5 className="font-medium text-orange-800 mb-1">🌍 Real Examples:</h5>
                                <p className="text-sm text-orange-700">{card.realWorldExample}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image collection info */}
                {result.imageCollection && (
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-200">
                    <h3 className="font-semibold mb-2 text-cyan-800">📚 Image Collection Guide:</h3>
                    <p className="text-sm text-cyan-700">{result.imageCollection}</p>
                  </div>
                )}

                {/* Visual tips for flashcards */}
                {result.visualTips && (
                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-semibold mb-2 text-pink-800">💡 Visual Learning Tips:</h3>
                    <p className="text-sm text-pink-700">{result.visualTips}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">{getTranslation('instructions', language)}:</h3>
                  <p className="text-gray-700">{result.instructions}</p>
                </div>

                {result.materials && (
                  <div>
                    <h3 className="font-semibold mb-2">{getTranslation('required-materials', language)}:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.materials.map((material: string, index: number) => (
                        <li key={index} className="text-gray-700">{material}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.culturalContext && (
                  <div>
                    <h3 className="font-semibold mb-2">{getTranslation('cultural-context', language)}:</h3>
                    <p className="text-gray-700">{result.culturalContext}</p>
                  </div>
                )}

                <Button className="w-full" onClick={() => window.print()}>
                  {getTranslation('print', language)}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{getTranslation('fill-form-to-create', language)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
