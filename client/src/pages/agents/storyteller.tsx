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
import { Separator } from "@/components/ui/separator";
import { Gamepad2, Loader2, CheckCircle, BookOpen, Users, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { offlineStorage } from "@/lib/offline-storage";
import type { Language } from "@shared/schema";
import { getTranslation } from "@/lib/language-utils";

interface StorytellerProps {
  language: Language;
}

interface StoryChapter {
  content: string;
  choices: Array<{
    option: string;
    consequence: string;
  }>;
}

interface StoryResult {
  title: string;
  introduction: string;
  chapters: StoryChapter[];
  moral: string;
  culturalElements: string;
}

export default function Storyteller({ language }: StorytellerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    theme: '',
    grades: [] as number[],
    language: language,
    moral: '',
    characters: [] as string[],
  });
  const [result, setResult] = useState<StoryResult | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [storyPath, setStoryPath] = useState<string[]>([]);

  const commonThemes = [
    { id: 'friendship', name: 'दोस्ती', nameEn: 'Friendship' },
    { id: 'honesty', name: 'ईमानदारी', nameEn: 'Honesty' },
    { id: 'courage', name: 'साहस', nameEn: 'Courage' },
    { id: 'kindness', name: 'दया', nameEn: 'Kindness' },
    { id: 'perseverance', name: 'धैर्य', nameEn: 'Perseverance' },
    { id: 'wisdom', name: 'बुद्धिमता', nameEn: 'Wisdom' },
  ];

  const commonCharacters = [
    { id: 'animals', name: 'जानवर', nameEn: 'Animals' },
    { id: 'children', name: 'बच्चे', nameEn: 'Children' },
    { id: 'teachers', name: 'शिक्षक', nameEn: 'Teachers' },
    { id: 'parents', name: 'माता-पिता', nameEn: 'Parents' },
    { id: 'mythical', name: 'पौराणिक पात्र', nameEn: 'Mythical beings' },
    { id: 'villagers', name: 'गांव के लोग', nameEn: 'Villagers' },
  ];

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/agents/storyteller/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setCurrentChapter(0);
      setStoryPath([]);
      toast({
        title: getTranslation("success", language),
        description: getTranslation("story-success", language),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
    },
    onError: (error) => {
      toast({
        title: getTranslation("error", language),
        description: getTranslation("story-error", language),
        variant: "destructive",
      });
      
      if (offlineStorage.isOffline()) {
        offlineStorage.addToOfflineQueue({
          id: Date.now().toString(),
          type: 'storyteller-generate',
          endpoint: '/api/agents/storyteller/generate',
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
    
    if (!formData.theme || formData.grades.length === 0 || !formData.moral || formData.characters.length === 0) {
      toast({
        title: "त्रुटि",
        description: "कृपया सभी आवश्यक फील्ड भरें।",
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

  const handleCharacterChange = (character: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      characters: checked 
        ? [...prev.characters, character]
        : prev.characters.filter(c => c !== character)
    }));
  };

  const makeChoice = (choiceIndex: number) => {
    if (!result) return;
    
    const choice = result.chapters[currentChapter].choices[choiceIndex];
    const newPath = [...storyPath, choice.option];
    setStoryPath(newPath);
    
    if (currentChapter < result.chapters.length - 1) {
      setCurrentChapter(prev => prev + 1);
    } else {
      toast({
        title: "कहानी समाप्त",
        description: "आपने कहानी पूरी कर ली!",
      });
    }
  };

  const restartStory = () => {
    setCurrentChapter(0);
    setStoryPath([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-pink-500 text-white p-3 rounded-lg">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Gamified Storyteller</h1>
            <p className="text-gray-600">🎮 खेल-आधारित कहानीकार</p>
          </div>
        </div>
        <p className="text-gray-700">
          इंटरैक्टिव कहानियां बनाएं जो मल्टी-ग्रेड छात्रों को मोरल values सिखाएं।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Story Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle>कहानी बनाएं</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="theme">थीम/विषय *</Label>
                <Select value={formData.theme} onValueChange={(value) => setFormData(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="कहानी का विषय चुनें" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonThemes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.name} ({theme.nameEn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>कक्षाएं * (Multi-grade)</Label>
                <p className="text-sm text-gray-600 mb-3">कहानी के लिए उम्र समूह:</p>
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
                <Label htmlFor="moral">मोरल/संदेश *</Label>
                <Input
                  id="moral"
                  value={formData.moral}
                  onChange={(e) => setFormData(prev => ({ ...prev, moral: e.target.value }))}
                  placeholder="जैसे: सच्चाई हमेशा जीतती है"
                  required
                />
              </div>

              <div>
                <Label className="text-base font-medium">पात्र *</Label>
                <p className="text-sm text-gray-600 mb-3">कहानी में शामिल करने वाले पात्र:</p>
                <div className="grid grid-cols-2 gap-3">
                  {commonCharacters.map(character => (
                    <div key={character.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={character.id}
                        checked={formData.characters.includes(character.id)}
                        onCheckedChange={(checked) => handleCharacterChange(character.id, checked as boolean)}
                      />
                      <Label htmlFor={character.id} className="text-sm">
                        {character.name}
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
                {generateMutation.isPending ? 'बनाई जा रही है...' : 'कहानी बनाएं'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Interactive Story */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>इंटरैक्टिव कहानी</span>
            </CardTitle>
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
                    कहानी तैयार है! अपना रास्ता चुनें।
                  </AlertDescription>
                </Alert>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{result.title}</h3>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>कक्षा {formData.grades.join(', ')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Sparkles className="h-4 w-4" />
                      <span>अध्याय {currentChapter + 1}/{result.chapters.length}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {currentChapter === 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2">कहानी की शुरुआत</h4>
                    <p className="text-sm">{result.introduction}</p>
                  </div>
                )}

                {result.chapters[currentChapter] && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        {result.chapters[currentChapter].content}
                      </p>
                    </div>

                    {result.chapters[currentChapter].choices.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">आप क्या करना चाहेंगे?</h4>
                        {result.chapters[currentChapter].choices.map((choice, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full text-left justify-start h-auto p-3"
                            onClick={() => makeChoice(index)}
                          >
                            <div className="text-sm">{choice.option}</div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {storyPath.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-sm mb-2">आपकी चुनी गई राह:</h4>
                    <div className="text-xs space-y-1">
                      {storyPath.map((choice, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="w-4 h-4 bg-yellow-400 rounded-full text-xs flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </span>
                          <span>{choice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentChapter === result.chapters.length - 1 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>कहानी का संदेश</span>
                    </h4>
                    <p className="text-sm mb-2">{result.moral}</p>
                    <p className="text-xs text-gray-600">
                      <strong>सांस्कृतिक संदर्भ:</strong> {result.culturalElements}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={restartStory} className="flex-1">
                    फिर से शुरू करें
                  </Button>
                  <Button onClick={() => window.print()} className="flex-1">
                    प्रिंट करें
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Gamepad2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>कहानी बनाने के लिए फॉर्म भरें</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
