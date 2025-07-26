import {
  users,
  students,
  lessons,
  assessments,
  activities,
  resources,
  accessibilityStudents,
  attendanceRecords,
  studentProfiles,
  type User,
  type InsertUser,
  type LoginData,
  type Student,
  type InsertStudent,
  type Lesson,
  type InsertLesson,
  type Assessment,
  type InsertAssessment,
  type Activity,
  type InsertActivity,
  type Resource,
  type InsertResource,
  type AccessibilityStudent,
  type InsertAccessibilityStudent,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type StudentProfile,
  type InsertStudentProfile,
  type UpdateStudentProfile,
  type DashboardStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, count, sum, desc, gte, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations for username/password authentication
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateLogin(credentials: LoginData): Promise<User | null>;

  // Student operations
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Lesson operations
  getAllLessons(): Promise<Lesson[]>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLesson(id: number): Promise<Lesson | undefined>;

  // Assessment operations
  getAllAssessments(): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;

  // Activity operations
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Resource operations
  getAllResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource>;

  // Accessibility operations
  getAllAccessibilityStudents(): Promise<AccessibilityStudent[]>;
  createAccessibilityStudent(student: InsertAccessibilityStudent): Promise<AccessibilityStudent>;

  // Attendance operations
  getAllAttendanceRecords(): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  getTodayAttendance(): Promise<AttendanceRecord[]>;

  // Student Profile operations
  getAllStudentProfiles(): Promise<StudentProfile[]>;
  createStudentProfile(profile: InsertStudentProfile): Promise<StudentProfile>;
  getStudentProfile(id: number): Promise<StudentProfile | undefined>;
  updateStudentProfile(id: number, profile: UpdateStudentProfile): Promise<StudentProfile>;
  deleteStudentProfile(id: number): Promise<void>;

  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: number, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async validateLogin(credentials: LoginData): Promise<User | null> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, credentials.username));

      if (user && user.password === credentials.password) {
        return user;
      }
      return null;
    } catch (error) {
      console.error("Login validation error:", error);
      return null;
    }
  }

  // Student operations
  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(studentData)
      .returning();
    return student;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(studentData)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Lesson operations
  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
  }

  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const [lesson] = await db
      .insert(lessons)
      .values(lessonData)
      .returning();
    return lesson;
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson;
  }

  // Assessment operations
  async getAllAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments);
  }

  async createAssessment(assessmentData: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(assessmentData)
      .returning();
    return assessment;
  }

  // Activity operations
  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  // Resource operations
  async getAllResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async createResource(resourceData: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values(resourceData)
      .returning();
    return resource;
  }

  async updateResource(id: number, resourceData: Partial<InsertResource>): Promise<Resource> {
    const [resource] = await db
      .update(resources)
      .set(resourceData)
      .where(eq(resources.id, id))
      .returning();
    return resource;
  }

  // Accessibility operations
  async getAllAccessibilityStudents(): Promise<AccessibilityStudent[]> {
    return await db.select().from(accessibilityStudents);
  }

  async createAccessibilityStudent(studentData: InsertAccessibilityStudent): Promise<AccessibilityStudent> {
    const [student] = await db
      .insert(accessibilityStudents)
      .values(studentData)
      .returning();
    return student;
  }

  // Attendance operations
  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    return await db.select().from(attendanceRecords);
  }

  async createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db
      .insert(attendanceRecords)
      .values(recordData)
      .returning();
    return record;
  }

  async getTodayAttendance(): Promise<AttendanceRecord[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.date, today));
  }

  // Student Profile operations
  async getAllStudentProfiles(): Promise<StudentProfile[]> {
    return await db.select().from(studentProfiles);
  }

  async createStudentProfile(profileData: InsertStudentProfile): Promise<StudentProfile> {
    const [profile] = await db
      .insert(studentProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async getStudentProfile(id: number): Promise<StudentProfile | undefined> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.id, id));
    return profile;
  }

  async updateStudentProfile(id: number, profileData: UpdateStudentProfile): Promise<StudentProfile> {
    const [profile] = await db
      .update(studentProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.id, id))
      .returning();
    return profile;
  }

  async deleteStudentProfile(id: number): Promise<void> {
    await db.delete(studentProfiles).where(eq(studentProfiles.id, id));
  }

  // Dashboard operations
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's attendance count
    const todayAttendance = await db
      .select({ count: count() })
      .from(attendanceRecords)
      .where(and(
        eq(attendanceRecords.date, today),
        eq(attendanceRecords.present, true)
      ));

    // Get completed lessons count
    const completedLessons = await db
      .select({ count: count() })
      .from(lessons);

    // Get active languages count (unique languages from students)
    const activeLanguages = await db
      .selectDistinct({ language: students.language })
      .from(students);

    // Get resource usage (available resources)
    const availableResources = await db
      .select({ count: count() })
      .from(resources)
      .where(eq(resources.availability, true));

    return {
      studentsToday: todayAttendance[0]?.count || 0,
      completedLessons: completedLessons[0]?.count || 0,
      activeLanguages: activeLanguages.length || 0,
      resourceUsage: availableResources[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();