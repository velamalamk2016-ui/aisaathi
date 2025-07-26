import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, varchar, index } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simple user table for username/password authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("teacher"),
  preferredLanguage: varchar("preferred_language", { length: 50 }).default("hindi"),
  // Teacher profile fields
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  gender: varchar("gender", { length: 10 }),
  phoneNumber: varchar("phone_number", { length: 15 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  qualification: varchar("qualification", { length: 100 }),
  experience: integer("experience"), // years of experience
  subjects: text("subjects").array(), // subjects taught
  joiningDate: varchar("joining_date", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  age: integer("age").notNull(),
  language: text("language").notNull().default("hindi"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  subject: text("subject").notNull(),
  grade: integer("grade").notNull(),
  language: text("language").notNull().default("hindi"),
  materials: jsonb("materials"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  lessonId: integer("lesson_id").references(() => lessons.id),
  score: integer("score").notNull(),
  feedback: text("feedback"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'worksheet', 'quiz', 'story', 'translation'
  title: text("title").notNull(),
  description: text("description"),
  agentType: text("agent_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'cardboard', 'clay', 'leaves', 'plastic'
  description: text("description"),
  availability: boolean("availability").default(true),
});

export const accessibilityStudents = pgTable("accessibility_students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  disability: text("disability").notNull(), // 'Visual', 'Hearing', 'Dyslexia', 'Down Syndrome'
  contentType: text("content_type").notNull(), // 'AudioBook', 'SignLanguageVideo', 'PracticalVideo', 'SimplifiedMedia'
  grade: integer("grade").notNull(),
  language: text("language").notNull().default("hindi"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance records table for persistent attendance tracking
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentProfiles.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  present: boolean("present").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Student Profile table for comprehensive student data
export const studentProfiles = pgTable("student_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(), // YYYY-MM-DD format
  gender: text("gender").notNull(), // 'Male', 'Female', 'Other'
  photo: text("photo"), // URL or base64 image data
  examSkills: jsonb("exam_skills").default([]), // Array of skills for future integration
  languages: jsonb("languages").notNull().default(['Hindi']), // Array of languages
  bloodGroup: text("blood_group"), // A+, B+, O+, AB+, A-, B-, O-, AB-
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactMobile: text("emergency_contact_mobile").notNull(),
  emergencyContactRelation: text("emergency_contact_relation").notNull(),
  height: real("height"), // in cm
  weight: real("weight"), // in kg
  attendancePercentage: real("attendance_percentage").default(0), // placeholder for now
  class: text("class").notNull(), // e.g., "Class 3", "LKG", "UKG"
  specialStatus: text("special_status").notNull().default("None"), // 'Blind', 'Deaf', 'Dyslexia', 'Down Syndrome', 'None'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas for authentication
export const upsertUserSchema = createInsertSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  completedAt: true,
});

export const insertAccessibilityStudentSchema = createInsertSchema(accessibilityStudents).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  submittedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Login schema
export const loginSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const teacherProfileSchema = createInsertSchema(users).omit({
  id: true,
  username: true,
  password: true,
  role: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.string().optional(),
  joiningDate: z.string().optional(),
  subjects: z.array(z.string()).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(4, "New password must be at least 4 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginData = z.infer<typeof loginSchema>;
export type TeacherProfileData = z.infer<typeof teacherProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type AccessibilityStudent = typeof accessibilityStudents.$inferSelect;
export type InsertAccessibilityStudent = z.infer<typeof insertAccessibilityStudentSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

// Student Profile schemas
export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  gender: z.enum(["Male", "Female", "Other"]),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  bloodGroup: z.enum(["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]).optional(),
  emergencyContactMobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(10).max(150).optional(),
  attendancePercentage: z.number().min(0).max(100).default(0),
  specialStatus: z.enum(["Blind", "Deaf", "Dyslexia", "Down Syndrome", "None"]).default("None"),
});

export const updateStudentProfileSchema = insertStudentProfileSchema.partial();

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type UpdateStudentProfile = z.infer<typeof updateStudentProfileSchema>;

// Language types
export type Language = "hindi" | "english" | "tamil" | "telugu" | "bengali" | "urdu" | "marathi" | "malayalam" | "kannada" | "gujarati" | "punjabi" | "odia";

// Agent types
export type AgentType = "teaching-aids" | "lesson-plan" | "assessment" | "multilingual" | "admin" | "storyteller" | "accessibility";

// Dashboard stats type
export type DashboardStats = {
  studentsToday: number;
  completedLessons: number;
  activeLanguages: number;
  resourceUsage: number;
};
