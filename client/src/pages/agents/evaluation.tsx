import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  Upload, 
  FileImage, 
  Brain, 
  Target,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Camera,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getTranslation } from "@/lib/language-utils";
import type { Language } from "@shared/schema";

interface EvaluationProps {
  language: Language;
}

interface EvaluationResult {
  overall_score: number;
  grade_level: string;
  questions_analyzed: Array<{
    question_number: number;
    question_text: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    marks_awarded: number;
    marks_total: number;
    feedback: string;
    explanation: string;
  }>;
  strengths: string[];
  areas_for_improvement: string[];
  detailed_feedback: string;
  recommendations: string[];
  cultural_notes: string;
  next_steps: string[];
  student_name?: string;
  subject?: string;
  topic?: string;
  evaluation_date?: string;
}

export default function Evaluation({ language }: EvaluationProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [worksheetContext, setWorksheetContext] = useState({
    subject: "",
    grade: "",
    topic: "",
    studentName: "",
  });
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const evaluationMutation = useMutation({
    mutationFn: async (data: { imageData: string; context: any }) => {
      const response = await apiRequest('/api/agents/evaluation/analyze', {
        method: 'POST',
        body: JSON.stringify({
          imageData: data.imageData,
          subject: data.context.subject,
          grade: data.context.grade,
          topic: data.context.topic,
          studentName: data.context.studentName,
          language: language,
          timestamp: new Date().toISOString()
        }),
      });
      return response.json();
    },
    onSuccess: (result) => {
      setEvaluationResult(result);
      toast({
        title: "Worksheet Evaluated Successfully",
        description: `Score: ${result.overall_score}% - ${result.grade_level}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Evaluation Failed",
        description: "Failed to analyze worksheet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
    }
  };

  const handleEvaluate = async () => {
    if (!selectedImage) {
      toast({
        title: "No Image Selected",
        description: "Please upload a worksheet image first.",
        variant: "destructive",
      });
      return;
    }

    if (!worksheetContext.subject || !worksheetContext.grade) {
      toast({
        title: "Missing Information",
        description: "Please fill in subject and grade information.",
        variant: "destructive",
      });
      return;
    }

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = (e.target?.result as string).split(',')[1];
      evaluationMutation.mutate({
        imageData: base64Data,
        context: worksheetContext
      });
    };
    reader.readAsDataURL(selectedImage);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade.toLowerCase()) {
      case "excellent": return "default";
      case "good": return "secondary";
      case "needs improvement": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-500 text-white p-3 rounded-lg">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              {getTranslation('evaluation-assistant', language)}
            </h1>
            <p className="text-gray-600">
              Upload student worksheets for AI-powered evaluation and feedback
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload and Context Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Worksheet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="worksheet-upload">Select Worksheet Image</Label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img 
                        src={imagePreview} 
                        alt="Worksheet preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileImage className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-gray-600">Click to upload worksheet image</p>
                      <p className="text-sm text-gray-500">Supports JPG, PNG, WebP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Select onValueChange={(value) => setWorksheetContext(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      <SelectItem value="Social Studies">Social Studies</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="grade">Grade *</Label>
                  <Select onValueChange={(value) => setWorksheetContext(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Class 1</SelectItem>
                      <SelectItem value="2">Class 2</SelectItem>
                      <SelectItem value="3">Class 3</SelectItem>
                      <SelectItem value="4">Class 4</SelectItem>
                      <SelectItem value="5">Class 5</SelectItem>
                      <SelectItem value="6">Class 6</SelectItem>
                      <SelectItem value="7">Class 7</SelectItem>
                      <SelectItem value="8">Class 8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  placeholder="e.g., Addition & Subtraction, Photosynthesis"
                  value={worksheetContext.topic}
                  onChange={(e) => setWorksheetContext(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  placeholder="Enter student name"
                  value={worksheetContext.studentName}
                  onChange={(e) => setWorksheetContext(prev => ({ ...prev, studentName: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleEvaluate}
                disabled={evaluationMutation.isPending || !selectedImage}
                className="w-full"
              >
                {evaluationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Worksheet...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Evaluate Worksheet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {evaluationResult ? (
            <>
              {/* Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Evaluation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {evaluationResult.overall_score}%
                    </div>
                    <Badge variant={getGradeBadgeVariant(evaluationResult.grade_level)}>
                      {evaluationResult.grade_level}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={evaluationResult.overall_score} 
                    className="w-full"
                  />
                  
                  {evaluationResult.student_name && (
                    <p className="text-center text-gray-600">
                      Student: {evaluationResult.student_name}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="questions" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="strengths">Strengths</TabsTrigger>
                      <TabsTrigger value="improvements">Areas to Improve</TabsTrigger>
                      <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="questions" className="space-y-4">
                      {evaluationResult.questions_analyzed?.map((question, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Question {question.question_number}</h4>
                            <div className="flex items-center gap-2">
                              {question.is_correct ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <span className="text-sm">
                                {question.marks_awarded}/{question.marks_total} marks
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p><strong>Question:</strong> {question.question_text}</p>
                            <p><strong>Student Answer:</strong> {question.student_answer}</p>
                            {!question.is_correct && (
                              <p><strong>Correct Answer:</strong> {question.correct_answer}</p>
                            )}
                            <p><strong>Feedback:</strong> {question.feedback}</p>
                            {question.explanation && (
                              <p><strong>Explanation:</strong> {question.explanation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="strengths">
                      <div className="space-y-2">
                        {evaluationResult.strengths?.map((strength, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="improvements">
                      <div className="space-y-2">
                        {evaluationResult.areas_for_improvement?.map((area, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <span>{area}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="recommendations">
                      <div className="space-y-2">
                        {evaluationResult.recommendations?.map((recommendation, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Detailed Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Teacher's Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={evaluationResult.detailed_feedback}
                    readOnly
                    className="min-h-32"
                  />
                  
                  {evaluationResult.cultural_notes && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Cultural Context:</strong> {evaluationResult.cultural_notes}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Upload a worksheet to get started</p>
                <p className="text-sm text-gray-500">
                  Our AI will analyze the worksheet and provide detailed feedback
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}