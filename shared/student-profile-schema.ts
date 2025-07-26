import { pgTable, text, serial, integer, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Zod schemas for validation
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

// Helper function to calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Helper function to determine accessibility support level
export function getAccessibilityLevel(specialStatus: string): {
  level: 'high' | 'medium' | 'low' | 'none';
  color: string;
  label: string;
} {
  switch (specialStatus) {
    case 'Blind':
    case 'Deaf':
      return { level: 'high', color: 'bg-red-100 text-red-800', label: 'High Support' };
    case 'Dyslexia':
    case 'Down Syndrome':
      return { level: 'medium', color: 'bg-yellow-100 text-yellow-800', label: 'Medium Support' };
    default:
      return { level: 'none', color: 'bg-green-100 text-green-800', label: 'No Support Needed' };
  }
}