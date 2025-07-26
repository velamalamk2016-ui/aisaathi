import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import { storage } from "./storage";
import { isAuthenticated } from "./simple-auth";
import session from "express-session";
import { 
  generateTeachingAid, 
  generateLessonPlan, 
  generateAssessment, 
  translateContent, 
  generateStory,
  type TeachingAidRequest,
  type LessonPlanRequest,
  type AssessmentRequest,
  type TranslationRequest,
  type StoryRequest
} from "./services/openai";
import { geminiBridge } from "./services/gemini-bridge";
import { loginSchema, insertActivitySchema, insertStudentSchema, insertLessonSchema, insertAssessmentSchema, insertAccessibilityStudentSchema, insertStudentProfileSchema, updateStudentProfileSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Session to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ai-saathi-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.validateLogin(loginData);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.session.userId = user.id;
      res.json({ message: "Login successful", user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(10);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.get("/api/dashboard/resources", async (req, res) => {
    try {
      const resources = await storage.getAvailableResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Student routes
  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  // Lesson routes
  app.get("/api/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lessons" });
    }
  });

  app.post("/api/lessons", async (req, res) => {
    try {
      const lessonData = insertLessonSchema.parse(req.body);
      const lesson = await storage.createLesson(lessonData);
      res.json(lesson);
    } catch (error) {
      res.status(400).json({ error: "Invalid lesson data" });
    }
  });

  // Assessment routes
  app.get("/api/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      res.status(400).json({ error: "Invalid assessment data" });
    }
  });

  // Teaching Aids Agent
  app.post("/api/agents/teaching-aids/generate", async (req, res) => {
    try {
      const requestSchema = z.object({
        subject: z.string(),
        grade: z.number(),
        topic: z.string(),
        language: z.string(),
        materials: z.array(z.string()),
        type: z.enum(["worksheet", "flashcard", "story"]),
      });

      const requestData = requestSchema.parse(req.body);
      console.log("Teaching Aid Request:", requestData);
      
      const result = await geminiBridge.generateTeachingAid(requestData);
      console.log("Teaching Aid Result:", result);
      
      // Log activity
      await storage.createActivity({
        type: requestData.type,
        title: `${result.title} बनाया गया`,
        description: `${requestData.subject} - कक्षा ${requestData.grade}`,
        agentType: "teaching-aids",
      });

      res.json(result);
    } catch (error) {
      console.error("Teaching Aid Generation Error:", error);
      res.status(400).json({ error: "Failed to generate teaching aid", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Lesson Plan Agent
  app.post("/api/agents/lesson-plan/generate", async (req, res) => {
    try {
      const requestSchema = z.object({
        subject: z.string(),
        grades: z.array(z.number()),
        timeLimit: z.number(),
        topic: z.string(),
        language: z.string(),
        materials: z.array(z.string()),
      });

      const requestData = requestSchema.parse(req.body);
      const result = await geminiBridge.generateLessonPlan(requestData);
      
      // Log activity
      await storage.createActivity({
        type: "lesson-plan",
        title: `पाठ योजना तैयार की गई`,
        description: `${requestData.subject} - कक्षा ${requestData.grades.join("-")}`,
        agentType: "lesson-plan",
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to generate lesson plan" });
    }
  });

  // Assessment Agent
  app.post("/api/agents/assessment/generate", async (req, res) => {
    try {
      const requestSchema = z.object({
        subject: z.string(),
        grade: z.number(),
        topic: z.string(),
        language: z.string(),
        questionCount: z.number(),
      });

      const requestData = requestSchema.parse(req.body);
      const result = await geminiBridge.generateAssessment(requestData);
      
      // Log activity
      await storage.createActivity({
        type: "quiz",
        title: `मूल्यांकन बनाया गया`,
        description: `${requestData.subject} - ${requestData.questionCount} प्रश्न`,
        agentType: "assessment",
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to generate assessment" });
    }
  });

  // Multilingual Agent
  app.post("/api/agents/multilingual/translate", async (req, res) => {
    try {
      const requestSchema = z.object({
        text: z.string(),
        fromLanguage: z.string(),
        toLanguage: z.string(),
      });

      const requestData = requestSchema.parse(req.body);
      const result = await geminiBridge.translateContent(requestData);
      
      // Log activity
      await storage.createActivity({
        type: "translation",
        title: `अनुवाद किया गया`,
        description: `${requestData.fromLanguage} से ${requestData.toLanguage}`,
        agentType: "multilingual",
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to translate content" });
    }
  });

  // Storyteller Agent
  app.post("/api/agents/storyteller/generate", async (req, res) => {
    try {
      const requestSchema = z.object({
        theme: z.string(),
        grades: z.array(z.number()),
        language: z.string(),
        moral: z.string(),
        characters: z.array(z.string()),
      });

      const requestData = requestSchema.parse(req.body);
      const result = await geminiBridge.generateStory(requestData);
      
      // Log activity
      await storage.createActivity({
        type: "story",
        title: `कहानी बनाई गई`,
        description: `${requestData.theme} - ${requestData.grades.join("-")} कक्षा`,
        agentType: "storyteller",
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to generate story" });
    }
  });

  // Admin routes
  app.get("/api/admin/attendance", async (req, res) => {
    try {
      const { date } = req.query;
      const selectedDate = date ? date.toString() : new Date().toISOString().split('T')[0];
      
      // Get all student profiles
      const studentProfiles = await storage.getStudentProfiles();
      
      // Get attendance records for the selected date
      const attendanceRecords = await storage.getAttendanceForDate(selectedDate);
      
      // Create attendance map for quick lookup
      const attendanceMap = new Map();
      attendanceRecords.forEach(record => {
        attendanceMap.set(record.studentId, record.present);
      });
      
      // Combine student data with attendance status
      const attendance = studentProfiles.map(student => ({
        studentId: student.id,
        name: student.name,
        present: attendanceMap.has(student.id) ? attendanceMap.get(student.id) : true, // Default to present if no record
        date: selectedDate,
        class: student.class,
        attendancePercentage: student.attendancePercentage || Math.floor(Math.random() * 20) + 80, // 80-100%
      }));
      
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/admin/attendance/submit", async (req, res) => {
    try {
      const { date, attendanceRecords } = req.body;

      if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
        return res.status(400).json({ error: "Invalid attendance data provided" });
      }

      // Save attendance records to storage
      const result = await storage.saveAttendanceRecords(date, attendanceRecords);

      res.json({ 
        success: true, 
        message: `Attendance for ${date} saved successfully`,
        recordsCount: attendanceRecords.length,
        date: date
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      res.status(500).json({ error: "Failed to save attendance data" });
    }
  });

  app.get("/api/admin/attendance-report", async (req, res) => {
    try {
      const { fromDate, toDate } = req.query;
      
      if (!fromDate || !toDate) {
        return res.status(400).json({ error: "fromDate and toDate are required" });
      }

      // Get all student profiles with their details
      const studentProfiles = await storage.getStudentProfiles();
      
      // Get attendance records for the date range
      const attendanceRecords = await storage.getAttendanceReportData(fromDate.toString(), toDate.toString());
      
      // Calculate summary statistics
      const totalStudents = studentProfiles.length;
      const uniqueDates = [...new Set(attendanceRecords.map((record: any) => record.date))];
      const totalDays = uniqueDates.length;
      
      // Calculate overall attendance rate
      const totalPossibleAttendance = totalStudents * totalDays;
      const totalActualAttendance = attendanceRecords.filter((record: any) => record.present).length;
      const overallRate = totalPossibleAttendance > 0 ? Math.round((totalActualAttendance / totalPossibleAttendance) * 100) : 0;
      
      // Separate pie charts for boys, girls, and special needs
      const boyStudents = studentProfiles.filter((student: any) => student.gender === 'Male');
      const girlStudents = studentProfiles.filter((student: any) => student.gender === 'Female');
      const specialNeedsStudents = studentProfiles.filter((student: any) => 
        student.specialStatus && student.specialStatus !== 'None'
      );

      // Boys present/absent pie chart
      const boysPresentCount = attendanceRecords.filter((record: any) => {
        const student = studentProfiles.find((s: any) => s.id === record.studentId);
        return student && student.gender === 'Male' && record.present;
      }).length;
      const boysTotalPossible = boyStudents.length * totalDays;
      const boysAbsentCount = boysTotalPossible - boysPresentCount;
      
      const boysPieData = [
        {
          name: 'Present',
          value: boysPresentCount,
          percentage: boysTotalPossible > 0 ? Math.round((boysPresentCount / boysTotalPossible) * 100) : 0,
          fill: '#22c55e'
        },
        {
          name: 'Absent',  
          value: boysAbsentCount,
          percentage: boysTotalPossible > 0 ? Math.round((boysAbsentCount / boysTotalPossible) * 100) : 0,
          fill: '#ef4444'
        }
      ];

      // Girls present/absent pie chart
      const girlsPresentCount = attendanceRecords.filter((record: any) => {
        const student = studentProfiles.find((s: any) => s.id === record.studentId);
        return student && student.gender === 'Female' && record.present;
      }).length;
      const girlsTotalPossible = girlStudents.length * totalDays;
      const girlsAbsentCount = girlsTotalPossible - girlsPresentCount;
      
      const girlsPieData = [
        {
          name: 'Present',
          value: girlsPresentCount,
          percentage: girlsTotalPossible > 0 ? Math.round((girlsPresentCount / girlsTotalPossible) * 100) : 0,
          fill: '#22c55e'
        },
        {
          name: 'Absent',
          value: girlsAbsentCount,
          percentage: girlsTotalPossible > 0 ? Math.round((girlsAbsentCount / girlsTotalPossible) * 100) : 0,
          fill: '#ef4444'
        }
      ];

      // Special needs present/absent pie chart
      const specialNeedsPresentCount = attendanceRecords.filter((record: any) => {
        const student = studentProfiles.find((s: any) => s.id === record.studentId);
        return student && student.specialStatus && student.specialStatus !== 'None' && record.present;
      }).length;
      const specialNeedsTotalPossible = specialNeedsStudents.length * totalDays;
      const specialNeedsAbsentCount = specialNeedsTotalPossible - specialNeedsPresentCount;
      
      const specialNeedsPieData = [
        {
          name: 'Present',
          value: specialNeedsPresentCount,
          percentage: specialNeedsTotalPossible > 0 ? Math.round((specialNeedsPresentCount / specialNeedsTotalPossible) * 100) : 0,
          fill: '#22c55e'
        },
        {
          name: 'Absent',
          value: specialNeedsAbsentCount,
          percentage: specialNeedsTotalPossible > 0 ? Math.round((specialNeedsAbsentCount / specialNeedsTotalPossible) * 100) : 0,
          fill: '#ef4444'
        }
      ];

      // Overall gender-wise summary for statistics
      const genderWise = [
        {
          gender: 'Male',
          total: boyStudents.length,
          present: Math.round(boysPresentCount / (totalDays || 1)),
          absent: Math.round(boysAbsentCount / (totalDays || 1)),
          attendanceRate: boysTotalPossible > 0 ? Math.round((boysPresentCount / boysTotalPossible) * 100) : 0
        },
        {
          gender: 'Female', 
          total: girlStudents.length,
          present: Math.round(girlsPresentCount / (totalDays || 1)),
          absent: Math.round(girlsAbsentCount / (totalDays || 1)),
          attendanceRate: girlsTotalPossible > 0 ? Math.round((girlsPresentCount / girlsTotalPossible) * 100) : 0
        }
      ];

      // Special needs summary
      const specialNeeds = [
        {
          name: 'Regular Students',
          value: totalStudents - specialNeedsStudents.length,
          percentage: totalStudents > 0 ? Math.round(((totalStudents - specialNeedsStudents.length) / totalStudents) * 100) : 0
        },
        {
          name: 'Special Needs',
          value: specialNeedsStudents.length,
          percentage: totalStudents > 0 ? Math.round((specialNeedsStudents.length / totalStudents) * 100) : 0,
          attendanceRate: specialNeedsTotalPossible > 0 ? Math.round((specialNeedsPresentCount / specialNeedsTotalPossible) * 100) : 0
        }
      ];

      // Class-wise analysis
      const classCounts: Record<string, number> = {};
      const classAttendance: Record<string, number> = {};
      
      studentProfiles.forEach((student: any) => {
        const className = student.class;
        classCounts[className] = (classCounts[className] || 0) + 1;
        classAttendance[className] = (classAttendance[className] || 0);
      });
      
      attendanceRecords.forEach((record: any) => {
        const student = studentProfiles.find((s: any) => s.id === record.studentId);
        if (student && record.present) {
          const className = student.class;
          classAttendance[className] = (classAttendance[className] || 0) + 1;
        }
      });
      
      const classWise = Object.keys(classCounts).map(className => {
        const total = classCounts[className] * totalDays;
        const present = classAttendance[className] || 0;
        const absent = total - present;
        const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
        
        return {
          class: className,
          total: classCounts[className],
          present: Math.round(present / totalDays),
          absent: Math.round(absent / totalDays),
          attendanceRate: attendanceRate
        };
      });

      // Daily trends
      const dailyStats: Record<string, any> = {};
      uniqueDates.forEach(date => {
        const dayRecords = attendanceRecords.filter((record: any) => record.date === date);
        const presentCount = dayRecords.filter((record: any) => record.present).length;
        const totalCount = dayRecords.length;
        const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        
        dailyStats[date] = {
          date: date,
          present: presentCount,
          total: totalCount,
          attendanceRate: attendanceRate
        };
      });
      
      const dailyTrends = Object.values(dailyStats).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate average daily attendance
      const avgDaily = dailyTrends.length > 0 
        ? Math.round(dailyTrends.reduce((sum: number, day: any) => sum + day.attendanceRate, 0) / dailyTrends.length)
        : 0;

      const reportData = {
        summary: {
          totalStudents,
          totalDays,
          overallRate,
          avgDaily
        },
        genderWise,
        specialNeeds,
        classWise,
        dailyTrends,
        // New pie chart data
        boysPieData,
        girlsPieData,
        specialNeedsPieData
      };

      res.json(reportData);
    } catch (error) {
      console.error("Error generating attendance report:", error);
      res.status(500).json({ error: "Failed to generate attendance report" });
    }
  });

  app.get("/api/admin/progress", async (req, res) => {
    try {
      const studentProfiles = await storage.getStudentProfiles();
      const progress = studentProfiles.map(student => {
        // Extract grade number from class string (e.g., "Class 5" -> 5)
        const gradeNumber = parseInt(student.class.replace(/\D/g, '')) || 1;
        return {
          studentId: student.id,
          name: student.name,
          grade: gradeNumber,
          class: student.class,
          completedLessons: Math.floor(Math.random() * 15) + 5, // 5-20 lessons
          averageScore: Math.floor(Math.random() * 25) + 75, // 75-100% scores
          examSkills: student.examSkills,
          attendancePercentage: student.attendancePercentage || Math.floor(Math.random() * 20) + 80,
        };
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // Accessibility routes
  app.get("/api/accessibility/students", async (req, res) => {
    try {
      const students = await storage.getAccessibilityStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch accessibility students" });
    }
  });

  app.post("/api/accessibility/students", async (req, res) => {
    try {
      const studentData = insertAccessibilityStudentSchema.parse(req.body);
      const student = await storage.createAccessibilityStudent(studentData);
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid accessibility student data" });
    }
  });

  app.get("/api/accessibility/content/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const student = await storage.getAccessibilityStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Generate content based on disability type
      const content = generateAccessibilityContent(student);
      
      // Store activity record
      await storage.createActivity({
        type: "accessibility",
        title: `${student.contentType} for ${student.name}`,
        description: `Specialized content for ${student.disability} disability`,
        agentType: "accessibility"
      });
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate accessibility content" });
    }
  });

  // Student Profile routes
  app.get("/api/student-profiles", async (req, res) => {
    try {
      const profiles = await storage.getStudentProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student profiles" });
    }
  });

  app.get("/api/student-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getStudentProfile(id);
      
      if (!profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student profile" });
    }
  });

  app.post("/api/student-profiles", async (req, res) => {
    try {
      const profileData = insertStudentProfileSchema.parse(req.body);
      const profile = await storage.createStudentProfile(profileData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid student profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create student profile" });
    }
  });

  app.patch("/api/student-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateStudentProfileSchema.parse(req.body);
      const profile = await storage.updateStudentProfile(id, updateData);
      
      if (!profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid update data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update student profile" });
    }
  });

  app.delete("/api/student-profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.getStudentProfile(id);
      
      if (!profile) {
        return res.status(404).json({ error: "Student profile not found" });
      }
      
      await storage.deleteStudentProfile(id);
      res.json({ message: "Student profile deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student profile" });
    }
  });

  // Accessibility content generation route for individual student
  app.post("/api/accessibility/content/:id", async (req, res) => {
    try {
      const { studentId, name, specialStatus, class: studentClass, languages, contentType } = req.body;
      
      // Generate accessibility content based on specialStatus
      const content = generateAccessibilityContent({
        specialStatus,
        contentType,
        name,
        class: studentClass,
        languages
      });
      
      res.json(content);
    } catch (error) {
      console.error("Accessibility content generation error:", error);
      res.status(500).json({ error: "Failed to generate accessibility content" });
    }
  });

  // Accessibility content generation route for category
  app.post("/api/accessibility/content/category", async (req, res) => {
    try {
      const { disability, students, contentType } = req.body;
      
      // Generate content for the entire category
      const content = generateCategoryAccessibilityContent({
        disability,
        students,
        contentType
      });
      
      // Store activity record for the category
      await storage.createActivity({
        type: "accessibility",
        title: `${contentType} for ${disability} Students`,
        description: `Specialized content for ${students.length} ${disability} students`,
        agentType: "accessibility"
      });
      
      res.json(content);
    } catch (error) {
      console.error("Category accessibility content generation error:", error);
      res.status(500).json({ error: "Failed to generate category accessibility content" });
    }
  });

  // Evaluation agent route
  app.post('/api/agents/evaluation/analyze', async (req, res) => {
    try {
      const { imageData, subject, grade, topic, studentName, language, timestamp } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required' });
      }

      if (!subject || !grade) {
        return res.status(400).json({ error: 'Subject and grade are required' });
      }

      const pythonProcess = spawn('python3', ['server/services/evaluation.py', JSON.stringify({
        imageData,
        subject,
        grade,
        topic: topic || 'General Topic',
        studentName: studentName || 'Student',
        language: language || 'english',
        timestamp: timestamp || new Date().toISOString()
      })]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data: any) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data: any) => {
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code: any) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            res.json(result);
          } catch (e) {
            console.error('Failed to parse evaluation result:', e);
            res.status(500).json({ 
              error: 'Failed to parse evaluation result',
              details: output.substring(0, 500) // Include first 500 chars for debugging
            });
          }
        } else {
          console.error('Python process error:', errorOutput);
          res.status(500).json({ 
            error: 'Evaluation service failed',
            details: errorOutput.substring(0, 500)
          });
        }
      });

      // Set a timeout for the evaluation process (2 minutes)
      setTimeout(() => {
        pythonProcess.kill();
        if (!res.headersSent) {
          res.status(408).json({ error: 'Evaluation timeout - please try again with a clearer image' });
        }
      }, 120000);

    } catch (error) {
      console.error('Evaluation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Generate specialized content for entire category
function generateCategoryAccessibilityContent(data: any) {
  const { disability, students, contentType } = data;
  const studentCount = students.length;
  const classes = [...new Set(students.map((s: any) => s.class))].join(", ");
  const studentNames = students.map((s: any) => s.name).join(", ");
  
  switch (disability) {
    case "Blind":
      return {
        type: "AudioBook",
        title: `Audio Learning for ${disability} Students`,
        content: `Welcome to the audio-based learning session designed for ${studentCount} ${disability} students from Class ${classes}. This comprehensive audio lesson uses sound narration, audio cues, and voice-guided navigation to deliver educational content effectively. Students: ${studentNames}`,
        audioUrl: "/audio/blind-category-lesson.mp3",
        instructions: "Distribute headphones to all students. Use audio controls and provide verbal instructions. Content includes tactile learning suggestions.",
        duration: "20-30 minutes",
        transcription: "Full text transcription available for teachers and assistants",
        accessibility: "Fully audio-optimized with voice navigation and tactile learning components",
        students: studentNames,
        features: ["Voice navigation", "Audio descriptions", "Tactile activities", "Sound-based interaction"]
      };
      
    case "Deaf":
      return {
        type: "SignLanguageVideo",
        title: `Sign Language Lesson for ${disability} Students`,
        content: `Visual learning content with Indian Sign Language (ISL) translation designed for ${studentCount} ${disability} students from Class ${classes}. This comprehensive visual lesson includes sign language interpretation, visual cues, and text-based instructions. Students: ${studentNames}`,
        videoUrl: "/videos/deaf-category-lesson.mp4",
        instructions: "Ensure clear sight lines for all students. Use visual indicators and written instructions. Sign language interpreter available throughout.",
        duration: "25-35 minutes",
        signLanguage: "Indian Sign Language (ISL)",
        accessibility: "Full visual experience with sign language support and text alternatives",
        students: studentNames,
        features: ["ISL interpretation", "Visual cues", "Text instructions", "Gesture-based activities"]
      };
      
    case "Dyslexia":
      return {
        type: "PracticalVideo",
        title: `Dyslexia-Friendly Learning for ${disability} Students`,
        content: `Interactive practical session designed for ${studentCount} students with ${disability} from Class ${classes}. Content uses dyslexia-friendly formatting, visual learning aids, and hands-on activities. Students: ${studentNames}`,
        videoUrl: "/videos/dyslexia-category-lesson.mp4",
        instructions: "Use large text displays, provide colored overlays, and encourage hands-on learning. Break content into manageable chunks.",
        duration: "30-40 minutes",
        features: ["Large text", "Color coding", "Visual cues", "Simplified language", "Hands-on activities"],
        accessibility: "Dyslexia-friendly formatting with enhanced visual and kinesthetic support",
        students: studentNames,
        activities: ["Color-coded worksheets", "Hands-on experiments", "Visual mapping", "Multi-sensory learning"]
      };
      
    case "Down Syndrome":
      return {
        type: "SimplifiedMedia",
        title: `Simplified Learning for ${disability} Students`,
        content: `Easy-to-follow content designed for ${studentCount} students with ${disability} from Class ${classes}. Content is presented in simple steps with repetition, visual aids, and patient pacing. Students: ${studentNames}`,
        videoUrl: "/videos/downsyndrome-category-lesson.mp4",
        instructions: "Use simple language, provide extra time, include repetition, and use visual aids. Encourage participation at individual pace.",
        duration: "25-35 minutes",
        features: ["Simple language", "Repetition", "Visual aids", "Slow pace", "Patient guidance"],
        accessibility: "Simplified content with enhanced visual support and patient instruction",
        students: studentNames,
        activities: ["Step-by-step guides", "Visual schedules", "Repetitive practice", "Encouraging feedback"]
      };
      
    case "ADHD":
      return {
        type: "InteractiveContent",
        title: `Interactive Session for ${disability} Students`,
        content: `Engaging, bite-sized interactive content designed for ${studentCount} students with ${disability} from Class ${classes}. Content includes movement breaks, focus timers, and interactive elements. Students: ${studentNames}`,
        videoUrl: "/videos/adhd-category-lesson.mp4",
        instructions: "Use short segments, include movement breaks, provide focus tools, and maintain high engagement through interactive elements.",
        duration: "Multiple 5-7 minute segments with breaks",
        activities: ["Quick quizzes", "Movement breaks", "Focus timers", "Interactive games", "Fidget-friendly tasks"],
        accessibility: "ADHD-friendly pacing with interactive elements and movement integration",
        students: studentNames,
        features: ["Short segments", "Movement breaks", "Interactive elements", "Focus tools", "High engagement"]
      };
      
    case "Autism":
      return {
        type: "StructuredContent",
        title: `Structured Learning for ${disability} Students`,
        content: `Predictable, well-structured content designed for ${studentCount} students with ${disability} from Class ${classes}. Content follows clear routines, includes visual schedules, and provides structured learning environment. Students: ${studentNames}`,
        videoUrl: "/videos/autism-category-lesson.mp4",
        instructions: "Follow clear structure, use visual schedules, maintain routine elements, and provide predictable learning environment.",
        duration: "35-45 minutes",
        features: ["Clear structure", "Predictable format", "Visual schedules", "Routine elements", "Structured activities"],
        accessibility: "Autism-friendly structured approach with visual supports and routine consistency",
        students: studentNames,
        activities: ["Visual schedules", "Structured tasks", "Routine-based learning", "Predictable activities"]
      };
      
    default:
      return {
        type: "General",
        title: `Learning Content for ${disability} Students`,
        content: `General learning content designed for ${studentCount} students from Class ${classes}.`,
        instructions: "Standard learning approach with inclusive practices.",
        duration: "25-35 minutes",
        accessibility: "Standard accessibility features with inclusive design",
        students: studentNames
      };
  }
}

// Generate specialized content based on specialStatus
function generateAccessibilityContent(student: any) {
  const { specialStatus, contentType, name, class: studentClass } = student;
  
  switch (specialStatus) {
    case "Blind":
      return {
        type: "AudioBook",
        title: `Audio Learning for ${name}`,
        content: `Welcome ${name}! This is an audio-based lesson for Class ${studentClass} students. Listen carefully as we explore today's topic through sound and narration.`,
        audioUrl: "/audio/sample-lesson.mp3",
        instructions: "Use headphones for better audio experience. Audio controls available.",
        duration: "15 minutes",
        transcription: "Full text transcription available for teachers",
        accessibility: "Fully audio-optimized with voice navigation"
      };
      
    case "Deaf":
      return {
        type: "SignLanguageVideo",
        title: `Sign Language Lesson for ${name}`,
        content: `Visual learning content with Indian Sign Language translation for Class ${studentClass}.`,
        videoUrl: "/videos/sign-language-lesson.mp4",
        instructions: "Watch the sign language interpreter. Subtitles and visual cues included.",
        duration: "20 minutes",
        signLanguage: "Indian Sign Language (ISL)",
        accessibility: "Full visual learning with sign language support"
      };
      
    case "Dyslexia":
      return {
        type: "PracticalVideo",
        title: `Interactive Learning for ${name}`,
        content: `Hands-on, practical demonstration videos designed for better concept understanding for Class ${studentClass}.`,
        videoUrl: "/videos/practical-lesson.mp4",
        instructions: "Follow along with practical activities. Visual and kinesthetic learning approach.",
        duration: "25 minutes",
        activities: ["Hands-on experiments", "Visual demonstrations", "Step-by-step practice"],
        accessibility: "Multi-sensory learning approach with visual and tactile elements"
      };
      
    case "Down Syndrome":
      return {
        type: "SimplifiedMedia",
        title: `Fun Learning for ${name}`,
        content: `Simplified, engaging multimedia content with animations and interactive elements for Class ${studentClass}.`,
        videoUrl: "/videos/simplified-animated-lesson.mp4",
        instructions: "Colorful, simplified content with animations. Interactive elements included.",
        duration: "12 minutes",
        features: ["Bright animations", "Simple language", "Interactive games", "Positive reinforcement"],
        accessibility: "Specially designed for cognitive accessibility with simplified interactions"
      };
      
    default:
      return {
        type: "General",
        title: `Adaptive Learning for ${name}`,
        content: `Adaptive learning content for Class ${studentClass} with multiple accessibility options.`,
        instructions: "Multiple formats available based on individual needs.",
        accessibility: "Multi-modal content with various accessibility options"
      };
  }
}
