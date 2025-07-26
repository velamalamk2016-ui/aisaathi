import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Volume2, 
  Eye, 
  Ear, 
  Brain, 
  Heart, 
  Play, 
  Download, 
  Settings,
  User,
  Users,
  BookOpen,
  FileText
} from "lucide-react";

interface StudentProfile {
  id: number;
  name: string;
  dateOfBirth: string;
  gender: string;
  photo?: string;
  examSkills: string[];
  languages: string[];
  bloodGroup?: string;
  emergencyContactName: string;
  emergencyContactMobile: string;
  emergencyContactRelation: string;
  height?: number;
  weight?: number;
  attendancePercentage?: number;
  class: string;
  specialStatus: "Blind" | "Deaf" | "Dyslexia" | "Down Syndrome" | "ADHD" | "Autism" | "None";
  createdAt: string;
  updatedAt: string;
}

interface AccessibilityContent {
  type: string;
  title: string;
  content: string;
  instructions: string;
  duration?: string;
  accessibility: string;
  audioUrl?: string;
  videoUrl?: string;
  transcription?: string;
  signLanguage?: string;
  activities?: string[];
  features?: string[];
}

const accessibilityIcons = {
  "Blind": Eye,
  "Deaf": Ear,
  "Dyslexia": Brain,
  "Down Syndrome": Heart,
  "ADHD": Settings,
  "Autism": User
};

const accessibilityColors = {
  "Blind": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Deaf": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "Dyslexia": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Down Syndrome": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "ADHD": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Autism": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
};

export default function AccessibilityPage() {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [generatedContent, setGeneratedContent] = useState<AccessibilityContent | null>(null);
  const [contentType, setContentType] = useState("AudioBook");
  const [sortBy, setSortBy] = useState<"name" | "specialStatus" | "class">("specialStatus");
  
  const { toast } = useToast();

  // Query for student profiles with accessibility needs
  const { data: allStudents = [], isLoading } = useQuery({
    queryKey: ["/api/student-profiles"],
    queryFn: async () => {
      const response = await fetch("/api/student-profiles");
      if (!response.ok) throw new Error("Failed to fetch student profiles");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Filter students who need accessibility support
  const accessibilityStudents = allStudents
    .filter((student: StudentProfile) => student.specialStatus !== "None");

  // Group students by disability type
  const groupedStudents = accessibilityStudents.reduce((groups: Record<string, StudentProfile[]>, student: StudentProfile) => {
    const disability = student.specialStatus;
    if (!groups[disability]) {
      groups[disability] = [];
    }
    groups[disability].push(student);
    return groups;
  }, {});

  // Sort students within each group
  Object.keys(groupedStudents).forEach(disability => {
    groupedStudents[disability].sort((a: StudentProfile, b: StudentProfile) => {
      if (sortBy === "class") {
        if (a.class !== b.class) {
          return a.class.localeCompare(b.class);
        }
        return a.name.localeCompare(b.name);
      } else {
        return a.name.localeCompare(b.name);
      }
    });
  });

  const generateContentMutation = useMutation({
    mutationFn: async (student: StudentProfile) => {
      const response = await apiRequest(`/api/accessibility/content/${student.id}`, "POST", {
        studentId: student.id,
        name: student.name,
        specialStatus: student.specialStatus,
        class: student.class,
        languages: student.languages,
        contentType: contentType
      });
      return response;
    },
    onSuccess: (content: AccessibilityContent) => {
      setGeneratedContent(content);
      toast({
        title: "Content Generated Successfully",
        description: "Specialized accessibility content has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Could not generate accessibility content. Please try again.",
        variant: "destructive",
      });
    },
  });



  const getContentTypeByAccessibility = (specialStatus: string) => {
    switch (specialStatus) {
      case "Blind": return "AudioBook";
      case "Deaf": return "SignLanguageVideo";
      case "Dyslexia": return "PracticalVideo";
      case "Down Syndrome": return "SimplifiedMedia";
      case "ADHD": return "InteractiveContent";
      case "Autism": return "StructuredContent";
      default: return "General";
    }
  };

  const handleGenerateContent = (student: StudentProfile) => {
    setSelectedStudent(student);
    setContentType(getContentTypeByAccessibility(student.specialStatus));
    generateContentMutation.mutate(student);
  };



  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="text-lg">Loading accessibility companion...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Accessibility Companion
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Specialized content delivery for students with diverse learning needs
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="sort-by" className="text-sm text-gray-600 dark:text-gray-300">
              Sort by:
            </Label>
            <Select value={sortBy} onValueChange={(value: "name" | "specialStatus" | "class") => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specialStatus">Special Needs</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="class">Class</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {accessibilityStudents.length} students with accessibility needs across {Object.keys(groupedStudents).length} categories
          </p>
        </div>
      </div>

      {/* Students Grouped by Disability Type */}
      <div className="space-y-8">
        {Object.entries(groupedStudents).map(([disability, students]) => {
          const IconComponent = accessibilityIcons[disability as keyof typeof accessibilityIcons];
          const colorClass = accessibilityColors[disability as keyof typeof accessibilityColors];
          const studentsArray = students as StudentProfile[];
          
          return (
            <div key={disability} className="space-y-4">
              {/* Disability Category Header */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                <IconComponent className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {disability} Students
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {studentsArray.length} student{studentsArray.length !== 1 ? 's' : ''} • Content Type: {getContentTypeByAccessibility(disability)}
                  </p>
                </div>
                <Badge className={colorClass}>
                  {studentsArray.length}
                </Badge>
              </div>

              {/* Students in this Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pl-4">
                {studentsArray.map((student: StudentProfile) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          Class {student.class}
                        </Badge>
                      </div>
                      <CardDescription>
                        {student.languages.join(", ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Specialized for {disability}
                      </div>
                      <Button 
                        onClick={() => handleGenerateContent(student)}
                        disabled={generateContentMutation.isPending}
                        className="w-full"
                        variant="outline"
                      >
                        {generateContentMutation.isPending && selectedStudent?.id === student.id ? (
                          "Generating..."
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(groupedStudents).length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Students with Special Needs
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Students with accessibility needs will appear here grouped by disability type.
            </p>
          </CardContent>
        </Card>
      )}



      {/* Generated Content Display */}
      {generatedContent && selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {generatedContent.title}
            </CardTitle>
            <CardDescription>
              Specialized content for {selectedStudent.name} ({selectedStudent.specialStatus})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Instructions
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                {generatedContent.instructions}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Content Description</h3>
              <p className="text-gray-700 dark:text-gray-300">
                {generatedContent.content}
              </p>
            </div>

            {generatedContent.duration && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Settings className="h-4 w-4" />
                Duration: {generatedContent.duration}
              </div>
            )}

            {generatedContent.activities && (
              <div>
                <h3 className="font-semibold mb-2">Activities Included</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {generatedContent.activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedContent.features && (
              <div>
                <h3 className="font-semibold mb-2">Special Features</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                  {generatedContent.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Accessibility Information
              </h3>
              <p className="text-green-800 dark:text-green-200">
                {generatedContent.accessibility}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {generatedContent.audioUrl && (
                <Button variant="outline" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Play Audio
                </Button>
              )}
              {generatedContent.videoUrl && (
                <Button variant="outline" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Watch Video
                </Button>
              )}
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Content
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {accessibilityStudents.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Content Types
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  4
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {generatedContent ? 1 : 0}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}