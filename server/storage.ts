import { 
  users, students, lessons, assessments, activities, resources, accessibilityStudents, studentProfiles, attendanceRecords,
  type User, type InsertUser, type Student, type InsertStudent,
  type Lesson, type InsertLesson, type Assessment, type InsertAssessment,
  type Activity, type InsertActivity, type Resource, type InsertResource,
  type AccessibilityStudent, type InsertAccessibilityStudent,
  type StudentProfile, type InsertStudentProfile, type UpdateStudentProfile,
  type AttendanceRecord, type InsertAttendanceRecord,
  type DashboardStats, type Language, type AgentType
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Lesson methods
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLessonsByGrade(grade: number): Promise<Lesson[]>;
  
  // Assessment methods
  getAssessments(): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessmentsByStudent(studentId: number): Promise<Assessment[]>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  
  // Resource methods
  getResources(): Promise<Resource[]>;
  getAvailableResources(): Promise<Resource[]>;
  
  // Dashboard methods
  getDashboardStats(): Promise<DashboardStats>;
  
  // Accessibility Student methods
  getAccessibilityStudents(): Promise<AccessibilityStudent[]>;
  getAccessibilityStudent(id: number): Promise<AccessibilityStudent | undefined>;
  createAccessibilityStudent(student: InsertAccessibilityStudent): Promise<AccessibilityStudent>;
  
  // Student Profile methods
  getStudentProfiles(): Promise<StudentProfile[]>;
  getStudentProfile(id: number): Promise<StudentProfile | undefined>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(id: number, profile: UpdateStudentProfile): Promise<StudentProfile | undefined>;
  deleteStudentProfile(id: number): Promise<void>;
  
  // Attendance methods
  saveAttendanceRecords(date: string, attendanceRecords: any[]): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private lessons: Map<number, Lesson>;
  private assessments: Map<number, Assessment>;
  private activities: Map<number, Activity>;
  private resources: Map<number, Resource>;
  private accessibilityStudents: Map<number, AccessibilityStudent>;
  private studentProfiles: Map<number, StudentProfile>;
  private attendanceRecords: Map<string, any[]>; // key: date, value: attendance records
  private currentUserId: number;
  private currentStudentId: number;
  private currentLessonId: number;
  private currentAssessmentId: number;
  private currentActivityId: number;
  private currentResourceId: number;
  private currentAccessibilityStudentId: number;
  private currentStudentProfileId: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.lessons = new Map();
    this.assessments = new Map();
    this.activities = new Map();
    this.resources = new Map();
    this.accessibilityStudents = new Map();
    this.studentProfiles = new Map();
    this.attendanceRecords = new Map();
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentLessonId = 1;
    this.currentAssessmentId = 1;
    this.currentActivityId = 1;
    this.currentResourceId = 1;
    this.currentAccessibilityStudentId = 1;
    this.currentStudentProfileId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    const sampleUser: User = {
      id: 1,
      username: "teacher1",
      password: "password123",
      name: "priya-sharma", // Use key for transliteration
      role: "teacher",
      preferredLanguage: "hindi",
      createdAt: new Date(),
    };
    this.users.set(1, sampleUser);
    this.currentUserId = 2;

    // Sample students
    const sampleStudents: Student[] = [
      { id: 1, name: "rahul", grade: 3, age: 8, language: "hindi", createdAt: new Date() },
      { id: 2, name: "priya", grade: 4, age: 9, language: "hindi", createdAt: new Date() },
      { id: 3, name: "arjun", grade: 5, age: 10, language: "hindi", createdAt: new Date() },
    ];
    sampleStudents.forEach(student => this.students.set(student.id, student));
    this.currentStudentId = 4;

    // Sample resources
    const sampleResources: Resource[] = [
      { id: 1, name: "leaves", type: "leaves", description: "counting-shapes-learning", availability: true },
      { id: 2, name: "clay", type: "clay", description: "letter-shape-making", availability: true },
      { id: 3, name: "cardboard", type: "cardboard", description: "3d-model-making", availability: true },
      { id: 4, name: "plastic-bottles", type: "plastic", description: "science-experiments", availability: true },
    ];
    sampleResources.forEach(resource => this.resources.set(resource.id, resource));
    this.currentResourceId = 5;

    // Sample activities
    const sampleActivities: Activity[] = [
      { id: 1, type: "worksheet", title: "math-worksheet-created", description: "grade-3-5", agentType: "teaching-aids", createdAt: new Date(Date.now() - 10 * 60 * 1000) },
      { id: 2, type: "translation", title: "story-hindi-translation", description: "from-tamil", agentType: "multilingual", createdAt: new Date(Date.now() - 25 * 60 * 1000) },
      { id: 3, type: "report", title: "weekly-progress-report", description: "42-students", agentType: "admin", createdAt: new Date(Date.now() - 60 * 60 * 1000) },
    ];
    sampleActivities.forEach(activity => this.activities.set(activity.id, activity));
    this.currentActivityId = 4;

    // Sample accessibility students
    const sampleAccessibilityStudents: AccessibilityStudent[] = [
      { id: 1, name: "Aarav", disability: "Visual", contentType: "AudioBook", grade: 3, language: "hindi", createdAt: new Date() },
      { id: 2, name: "Sara", disability: "Hearing", contentType: "SignLanguageVideo", grade: 4, language: "english", createdAt: new Date() },
      { id: 3, name: "Riya", disability: "Dyslexia", contentType: "PracticalVideo", grade: 2, language: "hindi", createdAt: new Date() },
      { id: 4, name: "Kunal", disability: "Down Syndrome", contentType: "SimplifiedMedia", grade: 1, language: "english", createdAt: new Date() },
    ];
    sampleAccessibilityStudents.forEach(student => this.accessibilityStudents.set(student.id, student));
    this.currentAccessibilityStudentId = 5;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "teacher",
      preferredLanguage: insertUser.preferredLanguage || "hindi",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = {
      ...insertStudent,
      id,
      language: insertStudent.language || "hindi",
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values());
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const lesson: Lesson = {
      ...insertLesson,
      id,
      language: insertLesson.language || "hindi",
      materials: insertLesson.materials || null,
      createdAt: new Date(),
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async getLessonsByGrade(grade: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).filter(lesson => lesson.grade === grade);
  }

  async getAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values());
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentAssessmentId++;
    const assessment: Assessment = {
      ...insertAssessment,
      id,
      studentId: insertAssessment.studentId || null,
      lessonId: insertAssessment.lessonId || null,
      feedback: insertAssessment.feedback || null,
      completedAt: new Date(),
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async getAssessmentsByStudent(studentId: number): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(assessment => assessment.studentId === studentId);
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = {
      ...insertActivity,
      id,
      description: insertActivity.description || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getAvailableResources(): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(resource => resource.availability);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const students = await this.getStudents();
    const lessons = await this.getLessons();
    const activities = await this.getActivities();
    
    return {
      studentsToday: students.length,
      completedLessons: lessons.length,
      activeLanguages: 3,
      resourceUsage: 89,
    };
  }

  async getAccessibilityStudents(): Promise<AccessibilityStudent[]> {
    return Array.from(this.accessibilityStudents.values());
  }

  async getAccessibilityStudent(id: number): Promise<AccessibilityStudent | undefined> {
    return this.accessibilityStudents.get(id);
  }

  async createAccessibilityStudent(insertStudent: InsertAccessibilityStudent): Promise<AccessibilityStudent> {
    const id = this.currentAccessibilityStudentId++;
    const student: AccessibilityStudent = {
      ...insertStudent,
      id,
      createdAt: new Date(),
    };
    this.accessibilityStudents.set(id, student);
    return student;
  }
}

import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "teacher",
        preferredLanguage: insertUser.preferredLanguage || "hindi"
      })
      .returning();
    return user;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values({
        ...insertStudent,
        language: insertStudent.language || "hindi"
      })
      .returning();
    return student;
  }

  async getLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values({
        ...insertLesson,
        language: insertLesson.language || "hindi",
        materials: insertLesson.materials || null
      })
      .returning();
    return lesson;
  }

  async getLessonsByGrade(grade: number): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.grade, grade));
  }

  async getAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments);
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values({
        ...insertAssessment,
        studentId: insertAssessment.studentId || null,
        lessonId: insertAssessment.lessonId || null,
        feedback: insertAssessment.feedback || null
      })
      .returning();
    return assessment;
  }

  async getAssessmentsByStudent(studentId: number): Promise<Assessment[]> {
    return await db.select().from(assessments).where(eq(assessments.studentId, studentId));
  }

  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({
        ...insertActivity,
        description: insertActivity.description || null
      })
      .returning();
    return activity;
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getAvailableResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const studentProfilesCount = await db.select({ count: sql<number>`count(*)` }).from(studentProfiles);
    const lessonsCount = await db.select({ count: sql<number>`count(*)` }).from(lessons);
    const activitiesCount = await db.select({ count: sql<number>`count(*)` }).from(activities);
    
    // Get today's attendance data
    const today = new Date().toISOString().split('T')[0];
    const todaysAttendance = await this.getTodaysAttendance();
    
    console.log(`Dashboard Stats - Today: ${today}, Attendance records: ${todaysAttendance.length}`);
    console.log('Attendance data:', todaysAttendance);
    
    // Calculate present students based on actual attendance if available
    let presentStudents = 0;
    if (todaysAttendance.length > 0) {
      // Count students marked as present in today's attendance
      presentStudents = todaysAttendance.filter(record => record.present).length;
      console.log(`Using actual attendance data: ${presentStudents} students present out of ${todaysAttendance.length}`);
    } else {
      // If no attendance data for today, use total student count * 85% as simulation
      const allStudents = await this.getStudentProfiles();
      presentStudents = Math.floor(allStudents.length * 0.85);
      console.log(`No attendance data found, using simulation: ${presentStudents} students (85% of ${allStudents.length})`);
    }
    
    return {
      studentsToday: presentStudents,
      completedLessons: lessonsCount[0]?.count || 0,
      activeLanguages: 12, // All supported Indian languages
      resourceUsage: activitiesCount[0]?.count || 0,
    };
  }

  async getAccessibilityStudents(): Promise<AccessibilityStudent[]> {
    return await db.select().from(accessibilityStudents);
  }

  async getAccessibilityStudent(id: number): Promise<AccessibilityStudent | undefined> {
    const [student] = await db.select().from(accessibilityStudents).where(eq(accessibilityStudents.id, id));
    return student || undefined;
  }

  async createAccessibilityStudent(insertStudent: InsertAccessibilityStudent): Promise<AccessibilityStudent> {
    const [student] = await db
      .insert(accessibilityStudents)
      .values(insertStudent)
      .returning();
    return student;
  }

  async getStudentProfiles(): Promise<StudentProfile[]> {
    return await db.select().from(studentProfiles);
  }

  async getStudentProfile(id: number): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, id));
    return profile || undefined;
  }

  async createStudentProfile(insertProfile: InsertStudentProfile): Promise<StudentProfile> {
    const [profile] = await db
      .insert(studentProfiles)
      .values(insertProfile)
      .returning();
    return profile;
  }

  async updateStudentProfile(id: number, updateProfile: UpdateStudentProfile): Promise<StudentProfile | undefined> {
    const [profile] = await db
      .update(studentProfiles)
      .set({ ...updateProfile, updatedAt: new Date() })
      .where(eq(studentProfiles.id, id))
      .returning();
    return profile || undefined;
  }

  async deleteStudentProfile(id: number): Promise<void> {
    await db.delete(studentProfiles).where(eq(studentProfiles.id, id));
  }

  async saveAttendanceRecords(date: string, attendanceData: any[]): Promise<any> {
    console.log(`Saving attendance for ${date}:`, attendanceData);
    
    // Delete existing attendance records for this date to avoid duplicates
    await db.delete(attendanceRecords).where(eq(attendanceRecords.date, date));
    
    // Insert new attendance records
    const attendanceInsertData = attendanceData.map(record => ({
      studentId: record.studentId,
      date: date,
      present: record.present
    }));
    
    if (attendanceInsertData.length > 0) {
      await db.insert(attendanceRecords).values(attendanceInsertData);
    }
    
    return {
      success: true,
      date,
      recordsCount: attendanceData.length,
      message: `Attendance for ${date} saved successfully`
    };
  }

  async getTodaysAttendance(): Promise<AttendanceRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select().from(attendanceRecords).where(eq(attendanceRecords.date, today));
  }

  async getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
    return await db.select().from(attendanceRecords).where(eq(attendanceRecords.date, date));
  }

  async getAttendanceWithStudentInfo(date: string): Promise<any[]> {
    const attendanceData = await db
      .select({
        studentId: attendanceRecords.studentId,
        present: attendanceRecords.present,
        studentName: studentProfiles.name,
        class: studentProfiles.class
      })
      .from(attendanceRecords)
      .innerJoin(studentProfiles, eq(attendanceRecords.studentId, studentProfiles.id))
      .where(eq(attendanceRecords.date, date));
    
    return attendanceData;
  }
}

// Use Database Storage for persistent data
export const storage = new DatabaseStorage();
