import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getTranslation } from "@/lib/language-utils";
import { 
  Users,
  Plus,
  Heart,
  Calendar,
  Phone,
  Ruler,
  Weight,
  GraduationCap,
  Languages,
  Eye,
  Ear,
  Brain,
  Shield,
  Search,
  Filter,
  Edit,
  UserPlus
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
  attendancePercentage: number;
  class: string;
  specialStatus: string;
  createdAt: string;
}

const specialStatusIcons = {
  "Blind": Eye,
  "Deaf": Ear,
  "Dyslexia": Brain,
  "Down Syndrome": Heart,
  "None": Shield
};

const specialStatusColors = {
  "Blind": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "Deaf": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Dyslexia": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "Down Syndrome": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "None": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
};

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

interface StudentProfilesPageProps {
  language: string;
}

export default function StudentProfilesPage({ language }: StudentProfilesPageProps) {
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newStudent, setNewStudent] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    photo: "",
    languages: ["Hindi"],
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactMobile: "",
    emergencyContactRelation: "",
    height: "",
    weight: "",
    class: "",
    specialStatus: "None"
  });
  
  const { toast } = useToast();

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ["/api/student-profiles"],
    queryFn: () => fetch("/api/student-profiles").then(res => res.json())
  });

  const studentsArray = Array.isArray(students) ? students : [];

  const addStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch("/api/student-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...studentData,
          height: studentData.height ? parseFloat(studentData.height) : undefined,
          weight: studentData.weight ? parseFloat(studentData.weight) : undefined,
          attendancePercentage: 0, // Default value
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add student");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student-profiles"] });
      setShowAddStudent(false);
      setNewStudent({
        name: "",
        dateOfBirth: "",
        gender: "",
        photo: "",
        languages: ["Hindi"],
        bloodGroup: "",
        emergencyContactName: "",
        emergencyContactMobile: "",
        emergencyContactRelation: "",
        height: "",
        weight: "",
        class: "",
        specialStatus: "None"
      });
      toast({
        title: "Success",
        description: "Student profile added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add student profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudentMutation.mutate(newStudent);
  };

  // Filter students based on search and status
  const filteredStudents = studentsArray.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || student.specialStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="text-lg">Loading student profiles...</div>
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
            {getTranslation('student-profiles', language)}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comprehensive student information and profiles
          </p>
        </div>
        <Button 
          onClick={() => setShowAddStudent(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Student Profile
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="None">No Special Needs</SelectItem>
            <SelectItem value="Blind">Visual Impairment</SelectItem>
            <SelectItem value="Deaf">Hearing Impairment</SelectItem>
            <SelectItem value="Dyslexia">Dyslexia</SelectItem>
            <SelectItem value="Down Syndrome">Down Syndrome</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold">{studentsArray.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Special Needs</p>
              <p className="text-2xl font-bold">
                {studentsArray.filter(s => s.specialStatus !== "None").length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
              <p className="text-2xl font-bold">
                {studentsArray.length > 0 
                  ? Math.round(studentsArray.reduce((sum, s) => sum + s.attendancePercentage, 0) / studentsArray.length)
                  : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Languages className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Languages</p>
              <p className="text-2xl font-bold">
                {new Set(studentsArray.flatMap(s => s.languages)).size}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student) => {
          const age = calculateAge(student.dateOfBirth);
          const IconComponent = specialStatusIcons[student.specialStatus as keyof typeof specialStatusIcons];
          const statusColor = specialStatusColors[student.specialStatus as keyof typeof specialStatusColors];
          
          return (
            <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedStudent(student)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.photo} alt={student.name} />
                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>{student.class} • Age {age}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Attendance:</span>
                  <span className="font-medium">{student.attendancePercentage}%</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Languages:</span>
                  <span className="font-medium">{student.languages.join(", ")}</span>
                </div>

                {student.specialStatus !== "None" && (
                  <Badge className={statusColor}>
                    <IconComponent className="h-3 w-3 mr-1" />
                    {student.specialStatus}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Student Profile</DialogTitle>
            <DialogDescription>
              Enter comprehensive information for the new student
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="health">Health</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newStudent.dateOfBirth}
                      onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={newStudent.gender}
                      onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="photo">Photo URL</Label>
                    <Input
                      id="photo"
                      value={newStudent.photo}
                      onChange={(e) => setNewStudent({ ...newStudent, photo: e.target.value })}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContactName"
                      value={newStudent.emergencyContactName}
                      onChange={(e) => setNewStudent({ ...newStudent, emergencyContactName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactMobile">Mobile Number *</Label>
                    <Input
                      id="emergencyContactMobile"
                      value={newStudent.emergencyContactMobile}
                      onChange={(e) => setNewStudent({ ...newStudent, emergencyContactMobile: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelation">Relation *</Label>
                    <Select
                      value={newStudent.emergencyContactRelation}
                      onValueChange={(value) => setNewStudent({ ...newStudent, emergencyContactRelation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Uncle">Uncle</SelectItem>
                        <SelectItem value="Aunt">Aunt</SelectItem>
                        <SelectItem value="Grandparent">Grandparent</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="health" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select
                      value={newStudent.bloodGroup}
                      onValueChange={(value) => setNewStudent({ ...newStudent, bloodGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={newStudent.height}
                      onChange={(e) => setNewStudent({ ...newStudent, height: e.target.value })}
                      placeholder="145"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={newStudent.weight}
                      onChange={(e) => setNewStudent({ ...newStudent, weight: e.target.value })}
                      placeholder="42"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialStatus">Special Status</Label>
                    <Select
                      value={newStudent.specialStatus}
                      onValueChange={(value) => setNewStudent({ ...newStudent, specialStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Blind">Blind</SelectItem>
                        <SelectItem value="Deaf">Deaf</SelectItem>
                        <SelectItem value="Dyslexia">Dyslexia</SelectItem>
                        <SelectItem value="Down Syndrome">Down Syndrome</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="academic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="class">Class *</Label>
                    <Select
                      value={newStudent.class}
                      onValueChange={(value) => setNewStudent({ ...newStudent, class: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LKG">LKG</SelectItem>
                        <SelectItem value="UKG">UKG</SelectItem>
                        <SelectItem value="Class 1">Class 1</SelectItem>
                        <SelectItem value="Class 2">Class 2</SelectItem>
                        <SelectItem value="Class 3">Class 3</SelectItem>
                        <SelectItem value="Class 4">Class 4</SelectItem>
                        <SelectItem value="Class 5">Class 5</SelectItem>
                        <SelectItem value="Class 6">Class 6</SelectItem>
                        <SelectItem value="Class 7">Class 7</SelectItem>
                        <SelectItem value="Class 8">Class 8</SelectItem>
                        <SelectItem value="Class 9">Class 9</SelectItem>
                        <SelectItem value="Class 10">Class 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Languages Proficient In</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati"].map((lang) => (
                        <label key={lang} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newStudent.languages.includes(lang)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewStudent({
                                  ...newStudent,
                                  languages: [...newStudent.languages, lang]
                                });
                              } else {
                                setNewStudent({
                                  ...newStudent,
                                  languages: newStudent.languages.filter(l => l !== lang)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addStudentMutation.isPending}>
                {addStudentMutation.isPending ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Detail Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.photo} alt={selectedStudent.name} />
                  <AvatarFallback>{selectedStudent.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{selectedStudent.name}</DialogTitle>
                  <DialogDescription>
                    {selectedStudent.class} • Age {calculateAge(selectedStudent.dateOfBirth)} • {selectedStudent.gender}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Personal Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Date of Birth:</strong> {selectedStudent.dateOfBirth}</div>
                  <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                  <div><strong>Languages:</strong> {selectedStudent.languages.join(", ")}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {selectedStudent.emergencyContactName}</div>
                  <div><strong>Mobile:</strong> {selectedStudent.emergencyContactMobile}</div>
                  <div><strong>Relation:</strong> {selectedStudent.emergencyContactRelation}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Blood Group:</strong> {selectedStudent.bloodGroup || "Not specified"}</div>
                  <div><strong>Height:</strong> {selectedStudent.height ? `${selectedStudent.height} cm` : "Not specified"}</div>
                  <div><strong>Weight:</strong> {selectedStudent.weight ? `${selectedStudent.weight} kg` : "Not specified"}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Class:</strong> {selectedStudent.class}</div>
                  <div><strong>Attendance:</strong> {selectedStudent.attendancePercentage}%</div>
                  <div><strong>Exam Skills:</strong> {selectedStudent.examSkills.length > 0 ? selectedStudent.examSkills.join(", ") : "None recorded"}</div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Accessibility Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStudent.specialStatus !== "None" ? (
                    <Badge className={`${specialStatusColors[selectedStudent.specialStatus as keyof typeof specialStatusColors]} text-lg p-2`}>
                      {React.createElement(specialStatusIcons[selectedStudent.specialStatus as keyof typeof specialStatusIcons], { className: "h-4 w-4 mr-2" })}
                      {selectedStudent.specialStatus} Support Required
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 text-lg p-2">
                      <Shield className="h-4 w-4 mr-2" />
                      No Special Support Needed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}