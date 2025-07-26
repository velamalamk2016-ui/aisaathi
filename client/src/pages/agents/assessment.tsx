import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckSquare, Loader2, CheckCircle, HelpCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { offlineStorage } from "@/lib/offline-storage";
import { getTranslation } from "@/lib/language-utils";
import type { Language } from "@shared/schema";

interface AssessmentProps {
  language: Language;
}

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface AssessmentResult {
  title: string;
  questions: Question[];
  instructions: string;
}

export default function Assessment({ language }: AssessmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    topic: '',
    language: language,
    questionCount: 5,
  });
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/agents/assessment/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setUserAnswers({});
      setShowResults(false);
      toast({
        title: getTranslation('success', language),
        description: getTranslation('assessment-success', language),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/activities'] });
    },
    onError: (error) => {
      toast({
        title: getTranslation('error', language),
        description: getTranslation('assessment-failed', language),
        variant: "destructive",
      });
      
      if (offlineStorage.isOffline()) {
        offlineStorage.addToOfflineQueue({
          id: Date.now().toString(),
          type: 'assessment-generate',
          endpoint: '/api/agents/assessment/generate',
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

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateScore = () => {
    if (!result) return 0;
    
    let correct = 0;
    result.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    
    return Math.round((correct / result.questions.length) * 100);
  };

  const submitAssessment = () => {
    setShowResults(true);
    const score = calculateScore();
    
    toast({
      title: getTranslation('assessment-complete', language),
      description: getTranslation('your-score', language) + `: ${score}%`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-accent text-white p-3 rounded-lg">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{getTranslation('assessment-agent', language)}</h1>
            <p className="text-gray-600">📊 {getTranslation('assessment-agent', language)}</p>
          </div>
        </div>
        <p className="text-gray-700">
          {getTranslation('assessment-description', language)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('create-assessment', language)}</CardTitle>
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
                <Label htmlFor="questionCount">{getTranslation('question-count', language)}</Label>
                <Select 
                  value={formData.questionCount.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, questionCount: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 {getTranslation('questions', language)}</SelectItem>
                    <SelectItem value="10">10 {getTranslation('questions', language)}</SelectItem>
                    <SelectItem value="15">15 {getTranslation('questions', language)}</SelectItem>
                    <SelectItem value="20">20 {getTranslation('questions', language)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {generateMutation.isPending ? getTranslation('creating', language) : getTranslation('create-assessment', language)}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Assessment Result */}
        <Card>
          <CardHeader>
            <CardTitle>{getTranslation('assessment-questions', language)}</CardTitle>
          </CardHeader>
          <CardContent>
            {generateMutation.isPending ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{result.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{result.instructions}</p>
                </div>

                {result.questions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">
                      {getTranslation('question', language)} {index + 1}: {question.question}
                    </h4>
                    
                    {question.type === 'multiple-choice' && question.options ? (
                      <RadioGroup 
                        value={userAnswers[index] || ""}
                        onValueChange={(value) => handleAnswerChange(index, value)}
                      >
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`q${index}-${optIndex}`} />
                            <Label htmlFor={`q${index}-${optIndex}`} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Input
                        value={userAnswers[index] || ""}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={getTranslation('your-answer', language)}
                        className="mt-2"
                      />
                    )}

                    {showResults && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2 mb-2">
                          {userAnswers[index] === question.correctAnswer ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <HelpCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">
                            {userAnswers[index] === question.correctAnswer ? getTranslation('correct', language) : getTranslation('incorrect', language)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>{getTranslation('correct-answer', language)}:</strong> {question.correctAnswer}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>{getTranslation('explanation', language)}:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {!showResults ? (
                  <Button 
                    onClick={submitAssessment}
                    className="w-full"
                    disabled={Object.keys(userAnswers).length !== result.questions.length}
                  >
                    {getTranslation('submit-assessment', language)}
                  </Button>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {getTranslation('assessment-complete', language)}! {getTranslation('your-score', language)}: {calculateScore()}%
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{getTranslation('fill-form-to-create-assessment', language)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
