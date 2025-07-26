import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UserCog, Users, TrendingUp, FileText, CheckCircle, XCircle, Plus, UserPlus, Trash2, Calendar, Download, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { offlineStorage } from "@/lib/offline-storage";
import type { Language, Student } from "@shared/schema";
import { getTranslation } from "@/lib/language-utils";

interface AdminProps {
  language: Language;
}

interface AttendanceRecord {
  studentId: number;
  name: string;
  present: boolean;
  date: string;
  class: string;
  attendancePercentage: number;
}

interface ProgressRecord {
  studentId: number;
  name: string;
  grade: number;
  class: string;
  completedLessons: number;
  averageScore: number;
  examSkills: string[];
  attendancePercentage: number;
}

const addStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  class: z.string().min(1, "Class is required"),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  examSkills: z.array(z.string()).min(1, "At least one exam skill is required"),
  bloodGroup: z.string().optional(),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactMobile: z.string().min(10, "Emergency contact mobile is required"),
  emergencyContactRelation: z.string().min(1, "Emergency contact relation is required"),
  height: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  specialStatus: z.enum(["None", "Dyslexia", "ADHD", "Blind", "Deaf", "Other"]).default("None"),
});

type AddStudentForm = z.infer<typeof addStudentSchema>;

export default function Admin({ language }: AdminProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceChanges, setAttendanceChanges] = useState<Record<number, boolean>>({});
  const [reportFromDate, setReportFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().split('T')[0];
  });
  const [reportToDate, setReportToDate] = useState(new Date().toISOString().split('T')[0]);

  // Clear local changes when date changes to load saved attendance for new date
  useEffect(() => {
    setAttendanceChanges({});
  }, [attendanceDate]);

  const form = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: "Male",
      class: "",
      languages: [],
      examSkills: [],
      bloodGroup: "",
      emergencyContactName: "",
      emergencyContactMobile: "",
      emergencyContactRelation: "",
      height: undefined,
      weight: undefined,
      specialStatus: "None",
    },
  });

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/student-profiles'],
    staleTime: 10 * 60 * 1000, // 10 minutes
    queryFn: async () => {
      const response = await fetch('/api/student-profiles');
      if (!response.ok) throw new Error('Failed to fetch student profiles');
      return response.json();
    },
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/admin/attendance', attendanceDate],
    queryFn: async () => {
      const response = await fetch(`/api/admin/attendance?date=${attendanceDate}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: progress, isLoading: progressLoading } = useQuery<ProgressRecord[]>({
    queryKey: ['/api/admin/progress'],
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  // Attendance report data
  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ['/api/admin/attendance-report', reportFromDate, reportToDate],
    queryFn: async () => {
      const response = await fetch(`/api/admin/attendance-report?fromDate=${reportFromDate}&toDate=${reportToDate}`);
      if (!response.ok) throw new Error('Failed to fetch attendance report');
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: AddStudentForm) => {
      const response = await apiRequest('/api/student-profiles', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          attendancePercentage: 100, // New students start with 100% attendance
          photo: "", // Default empty photo
        }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/progress'] });
      setIsAddStudentOpen(false);
      form.reset();
      toast({
        title: "Student Added Successfully",
        description: "The new student profile has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await fetch(`/api/student-profiles/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete student: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/progress'] });
      toast({
        title: "Student Deleted Successfully",
        description: "The student profile has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const attendanceSubmitMutation = useMutation({
    mutationFn: async () => {
      const attendanceData = students.map((student: any) => ({
        studentId: student.id,
        date: attendanceDate,
        present: attendanceChanges[student.id] !== undefined ? attendanceChanges[student.id] : true,
        studentName: student.name,
        class: student.class
      }));
      
      const response = await fetch('/api/admin/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: attendanceDate,
          attendanceRecords: attendanceData
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setAttendanceChanges({}); // Clear local changes after successful save
      toast({
        title: "Success",
        description: `Attendance for ${attendanceDate} saved successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save attendance data",
        variant: "destructive",
      });
    },
  });

  const submitAttendance = () => {
    attendanceSubmitMutation.mutate();
  };

  const filteredStudents = students?.filter(student => {
    if (selectedGrade === 'all') return true;
    // Extract grade number from class string (e.g., "Class 5" -> "5")
    const gradeNumber = student.class.replace(/\D/g, '');
    return gradeNumber === selectedGrade;
  }) || [];

  const filteredProgress = progress?.filter(record => 
    selectedGrade === 'all' || record.grade.toString() === selectedGrade
  ) || [];

  const getAttendanceStats = () => {
    if (!attendance) return { present: 0, absent: 0, total: 0 };
    
    const present = attendance.filter(record => record.present).length;
    const total = attendance.length;
    const absent = total - present;
    
    return { present, absent, total };
  };

  const getProgressStats = () => {
    if (!progress) return { avgScore: 0, avgLessons: 0 };
    
    const avgScore = progress.reduce((sum, record) => sum + record.averageScore, 0) / progress.length;
    const avgLessons = progress.reduce((sum, record) => sum + record.completedLessons, 0) / progress.length;
    
    return { avgScore: Math.round(avgScore), avgLessons: Math.round(avgLessons) };
  };

  const stats = getAttendanceStats();
  const progressStats = getProgressStats();

  const generateReport = () => {
    const reportData = {
      date: selectedDate,
      grade: selectedGrade,
      attendance: stats,
      progress: progressStats,
      students: filteredStudents.length,
    };

    const reportText = `
AI Saathi - ${getTranslation("daily-report", language)}
${getTranslation("date", language)}: ${selectedDate}
${getTranslation("grade", language)}: ${selectedGrade === 'all' ? getTranslation("all", language) : selectedGrade}

${getTranslation("attendance-statistics", language)}:
- ${getTranslation("total-students", language)}: ${stats.total}
- ${getTranslation("present", language)}: ${stats.present}
- ${getTranslation("absent", language)}: ${stats.absent}
- ${getTranslation("attendance-rate", language)}: ${stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%

${getTranslation("progress-statistics", language)}:
- ${getTranslation("average-score", language)}: ${progressStats.avgScore}%
- ${getTranslation("average-completed-lessons", language)}: ${progressStats.avgLessons}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-saathi-report-${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: getTranslation("report-generated", language),
      description: getTranslation("daily-report-downloaded", language),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-indigo-500 text-white p-3 rounded-lg">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{getTranslation("admin-agent", language)}</h1>
            <p className="text-gray-600">📑 {getTranslation("admin-description", language)}</p>
          </div>
        </div>
        <p className="text-gray-700">
          {getTranslation("admin-full-description", language)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getTranslation("total-students", language)}</p>
                <p className="text-2xl font-bold">{filteredStudents.length}</p>
              </div>
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getTranslation("present-today", language)}</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getTranslation("average-score", language)}</p>
                <p className="text-2xl font-bold text-blue-600">{progressStats.avgScore}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getTranslation("average-lessons", language)}</p>
                <p className="text-2xl font-bold text-purple-600">{progressStats.avgLessons}</p>
              </div>
              <FileText className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">👥 Student Profiles</TabsTrigger>
          <TabsTrigger value="attendance">{getTranslation("attendance", language)}</TabsTrigger>
          <TabsTrigger value="reports">📊 Attendance Reports</TabsTrigger>
          <TabsTrigger value="progress">{getTranslation("progress", language)}</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>{getTranslation("todays-attendance", language)}</CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="attendance-date" className="text-sm">
                    {getTranslation("date", language)}:
                  </Label>
                  <Input
                    id="attendance-date"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : students && students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{getTranslation("student-name", language)}</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>{getTranslation("status", language)}</TableHead>
                      <TableHead>Overall Attendance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: any) => {
                      // Check if there's a saved attendance record for this student on the selected date
                      const savedAttendanceRecord = attendance?.find(record => record.studentId === student.id);
                      
                      // Determine the current status:
                      // 1. If user made local changes, use those
                      // 2. If there's saved data for this date, use that
                      // 3. Otherwise default to present
                      const isPresent = attendanceChanges[student.id] !== undefined 
                        ? attendanceChanges[student.id] 
                        : savedAttendanceRecord 
                        ? savedAttendanceRecord.present 
                        : true;
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {student.class}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-medium ${isPresent ? 'text-green-600' : 'text-red-600'}`}>
                                {isPresent ? getTranslation("present", language) : getTranslation("absent", language)}
                              </span>
                              <Switch
                                checked={isPresent}
                                onCheckedChange={(checked) => {
                                  setAttendanceChanges(prev => ({
                                    ...prev,
                                    [student.id]: checked
                                  }));
                                }}
                                className="data-[state=checked]:bg-green-500"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {student.attendancePercentage || 100}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertDescription>
                    {getTranslation("attendance-info-unavailable", language)}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Submit Button */}
              {students && students.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={submitAttendance}
                    disabled={attendanceSubmitMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                  >
                    {attendanceSubmitMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving Attendance...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Attendance for {attendanceDate}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Attendance Analytics Report
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="from-date" className="text-sm">From:</Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={reportFromDate}
                    onChange={(e) => setReportFromDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="to-date" className="text-sm">To:</Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={reportToDate}
                    onChange={(e) => setReportToDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button
                  onClick={() => {
                    // Generate and download comprehensive report
                    const reportText = `
AI Saathi - Attendance Analytics Report
Period: ${reportFromDate} to ${reportToDate}

=== SUMMARY STATISTICS ===
Total Students: ${reportData?.summary?.totalStudents || 0}
Total School Days: ${reportData?.summary?.totalDays || 0}
Overall Attendance Rate: ${reportData?.summary?.overallRate || 0}%

=== GENDER-WISE BREAKDOWN ===
${reportData?.genderWise?.map(item => `${item.name}: ${item.value} students (${item.percentage}%)`).join('\n') || 'No data available'}

=== SPECIAL NEEDS SUPPORT ===
${reportData?.specialNeeds?.map(item => `${item.name}: ${item.value} students (${item.percentage}%)`).join('\n') || 'No data available'}

=== CLASS-WISE ATTENDANCE ===
${reportData?.classWise?.map(item => `${item.class}: ${item.attendanceRate}% (${item.present}/${item.total})`).join('\n') || 'No data available'}

=== DAILY TRENDS ===
${reportData?.dailyTrends?.map(item => `${item.date}: ${item.attendanceRate}% (${item.present}/${item.total})`).join('\n') || 'No data available'}

Generated on: ${new Date().toLocaleString()}
                    `;
                    
                    const blob = new Blob([reportText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `attendance-report-${reportFromDate}-to-${reportToDate}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Report Downloaded",
                      description: "Attendance analytics report has been downloaded successfully.",
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
              ) : reportData ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{reportData.summary?.totalStudents || 0}</p>
                          <p className="text-sm text-gray-600">Total Students</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{reportData.summary?.overallRate || 0}%</p>
                          <p className="text-sm text-gray-600">Overall Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{reportData.summary?.totalDays || 0}</p>
                          <p className="text-sm text-gray-600">School Days</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{reportData.summary?.avgDaily || 0}%</p>
                          <p className="text-sm text-gray-600">Daily Average</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gender-wise Attendance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Gender-wise Attendance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={reportData.genderWise || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(reportData.genderWise || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28'][index % 3]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Special Needs Students */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Special Needs Students</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={reportData.specialNeeds || []}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {(reportData.specialNeeds || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={['#FF8042', '#8884D8', '#82CA9D'][index % 3]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Class-wise Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Class-wise Attendance Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={reportData.classWise || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="class" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attendanceRate" fill="#8884d8" name="Attendance %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Daily Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Daily Attendance Trends</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={reportData.dailyTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attendanceRate" fill="#82ca9d" name="Attendance %" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Class Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Class</TableHead>
                            <TableHead>Total Students</TableHead>
                            <TableHead>Present</TableHead>
                            <TableHead>Absent</TableHead>
                            <TableHead>Attendance Rate</TableHead>
                            <TableHead>Performance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(reportData.classWise || []).map((classData) => (
                            <TableRow key={classData.class}>
                              <TableCell className="font-medium">{classData.class}</TableCell>
                              <TableCell>{classData.total}</TableCell>
                              <TableCell className="text-green-600">{classData.present}</TableCell>
                              <TableCell className="text-red-600">{classData.absent}</TableCell>
                              <TableCell>
                                <Badge variant={classData.attendanceRate >= 90 ? "default" : classData.attendanceRate >= 75 ? "secondary" : "destructive"}>
                                  {classData.attendanceRate}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className={`text-sm ${classData.attendanceRate >= 90 ? 'text-green-600' : classData.attendanceRate >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {classData.attendanceRate >= 90 ? 'Excellent' : classData.attendanceRate >= 75 ? 'Good' : 'Needs Attention'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No attendance data available for the selected date range. Please select a different period.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{getTranslation("student-progress", language)}</CardTitle>
            </CardHeader>
            <CardContent>
              {progressLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{getTranslation("student-name", language)}</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>{getTranslation("completed-lessons", language)}</TableHead>
                      <TableHead>{getTranslation("average-score", language)}</TableHead>
                      <TableHead>Exam Skills</TableHead>
                      <TableHead>{getTranslation("performance", language)}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProgress.map((record) => (
                      <TableRow key={record.studentId}>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {record.class}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.completedLessons}</TableCell>
                        <TableCell className="text-blue-600 font-medium">{record.averageScore}%</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {record.examSkills.slice(0, 2).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                            {record.examSkills.length > 2 && (
                              <Badge variant="outline" className="text-xs">+{record.examSkills.length - 2}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={record.averageScore >= 80 ? "default" : 
                                   record.averageScore >= 60 ? "secondary" : "destructive"}
                          >
                            {record.averageScore >= 80 ? getTranslation("excellent", language) : 
                             record.averageScore >= 60 ? getTranslation("good", language) : getTranslation("needs-improvement", language)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>👥 Student Profiles Management</CardTitle>
                  <p className="text-gray-600">Complete student information from Student Profile Dashboard</p>
                </div>
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Create a comprehensive student profile with all necessary information.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => addStudentMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter student's full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="class"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Class 5" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bloodGroup"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Blood Group</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="specialStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Special Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select special status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="Dyslexia">Dyslexia</SelectItem>
                                    <SelectItem value="ADHD">ADHD</SelectItem>
                                    <SelectItem value="Blind">Blind</SelectItem>
                                    <SelectItem value="Deaf">Deaf</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Contact person name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContactMobile"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Emergency Contact Mobile</FormLabel>
                                <FormControl>
                                  <Input placeholder="Contact phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="emergencyContactRelation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contact Relation</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Father, Mother" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label>Languages (Select multiple)</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {["Hindi", "English", "Telugu", "Tamil", "Bengali", "Punjabi", "Gujarati", "Marathi", "Kannada", "Malayalam", "Odia", "Assamese"].map((lang) => (
                                <Button
                                  key={lang}
                                  type="button"
                                  variant={form.watch("languages").includes(lang) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues("languages");
                                    if (current.includes(lang)) {
                                      form.setValue("languages", current.filter(l => l !== lang));
                                    } else {
                                      form.setValue("languages", [...current, lang]);
                                    }
                                  }}
                                >
                                  {lang}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <Label>Exam Skills (Select multiple)</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {["Mathematics", "Science", "English", "Hindi", "Social Studies", "Art", "Music", "Physical Education", "Computer Science", "Geography", "History"].map((skill) => (
                                <Button
                                  key={skill}
                                  type="button"
                                  variant={form.watch("examSkills").includes(skill) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues("examSkills");
                                    if (current.includes(skill)) {
                                      form.setValue("examSkills", current.filter(s => s !== skill));
                                    } else {
                                      form.setValue("examSkills", [...current, skill]);
                                    }
                                  }}
                                >
                                  {skill}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={addStudentMutation.isPending}>
                            {addStudentMutation.isPending ? "Adding..." : "Add Student"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredStudents && filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <Card key={student.id} className="border-l-4 border-l-blue-500 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${student.name}'s profile? This action cannot be undone.`)) {
                            deleteStudentMutation.mutate(student.id);
                          }
                        }}
                        disabled={deleteStudentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <div>
                            <h3 className="font-semibold text-lg">{student.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {student.class} • {student.gender}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Born: {new Date(student.dateOfBirth).toLocaleDateString()}</p>
                            <Badge variant={student.specialStatus === "None" ? "outline" : "destructive"} className="text-xs">
                              {student.specialStatus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Attendance:</span>
                            <span className="font-medium text-green-600">{student.attendancePercentage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Blood Group:</span>
                            <span className="font-medium">{student.bloodGroup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Emergency Contact:</span>
                            <span className="font-medium">{student.emergencyContactName}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Languages:</p>
                          <div className="flex flex-wrap gap-1">
                            {student.languages.map((lang, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{lang}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Exam Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {student.examSkills.map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No student profiles found for the selected grade.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
