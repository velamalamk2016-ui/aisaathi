import { db } from "./db";
import { students, lessons, activities, resources, studentProfiles, users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Ensure admin user exists with proper teacher profile
    const adminUser = await db.select().from(users).where(eq(users.username, 'admin'));
    if (adminUser.length === 0) {
      await db.insert(users).values({
        username: 'admin',
        password: 'admin',
        name: 'Manoj Velamala',
        role: 'admin',
        preferredLanguage: 'hindi',
        dateOfBirth: '1980-03-15',
        gender: 'male',
        phoneNumber: '9876543210',
        email: 'manoj.velamala@school.edu',
        address: '123 Teacher Colony, Hyderabad, Telangana',
        qualification: 'B.Ed, M.Sc Mathematics',
        experience: 15,
        subjects: ['Mathematics', 'Physics', 'Computer Science'],
        joiningDate: '2010-06-01'
      });
    }

    // Add sample students
    await db.insert(students).values([
      {
        name: "aarav-kumar", // Use key for transliteration
        grade: 3,
        age: 8,
        language: "hindi"
      },
      {
        name: "diya-patel", // Use key for transliteration
        grade: 4,
        age: 9,
        language: "hindi"
      },
      {
        name: "arjun-singh", // Use key for transliteration
        grade: 5,
        age: 10,
        language: "hindi"
      }
    ]).onConflictDoNothing();

    // Add sample lessons
    await db.insert(lessons).values([
      {
        title: "गणित की मूल बातें",
        content: "बुनियादी गणित की समझ",
        grade: 3,
        subject: "गणित",
        language: "hindi",
        materials: JSON.stringify(["काउंटिंग के लिए कंकड़", "कागज़", "पेंसिल"])
      },
      {
        title: "हिंदी वर्णमाला",
        content: "हिंदी अक्षरों का परिचय",
        grade: 3,
        subject: "भाषा",
        language: "hindi",
        materials: JSON.stringify(["स्लेट", "चाक"])
      }
    ]).onConflictDoNothing();

    // Add sample activities
    await db.insert(activities).values([
      {
        type: "worksheet",
        title: "गणित की worksheet बनाई गई",
        description: "कक्षा 3 के लिए जोड़-घटाना",
        agentType: "teaching-aids"
      },
      {
        type: "translation",
        title: "अनुवाद किया गया",
        description: "हिंदी से अंग्रेजी में",
        agentType: "multilingual"
      }
    ]).onConflictDoNothing();

    // Add sample resources
    await db.insert(resources).values([
      {
        name: "पत्तियां",
        type: "local",
        availability: true,
        description: "प्राकृतिक गणना के लिए"
      },
      {
        name: "कंकड़",
        type: "local",
        availability: true,
        description: "गणित की समझ के लिए"
      },
      {
        name: "मिट्टी",
        type: "local",
        availability: true,
        description: "आकार बनाने के लिए"
      },
      {
        name: "कागज़",
        type: "recyclable",
        availability: true,
        description: "लिखने और कलाकृति के लिए"
      }
    ]).onConflictDoNothing();

    // Create comprehensive student profiles if none exist
    const studentProfilesExist = await db.select().from(studentProfiles).limit(1);
    if (studentProfilesExist.length === 0) {
      await db.insert(studentProfiles).values([
        {
          name: "Ananya Reddy",
          dateOfBirth: "2012-04-18",
          gender: "Female",
          photo: "",
          examSkills: ["Mathematics", "Science", "Hindi"],
          languages: ["Hindi", "English", "Telugu"],
          bloodGroup: "B+",
          emergencyContactName: "Rajesh Reddy",
          emergencyContactMobile: "9876543210",
          emergencyContactRelation: "Father",
          height: 145.5,
          weight: 42.0,
          attendancePercentage: 92.5,
          class: "Class 5",
          specialStatus: "None",
        },
        {
          name: "Arjun Kumar",
          dateOfBirth: "2013-08-22",
          gender: "Male",
          photo: "",
          examSkills: ["English", "Mathematics"],
          languages: ["Hindi", "English"],
          bloodGroup: "A+",
          emergencyContactName: "Sunita Kumar",
          emergencyContactMobile: "9123456789",
          emergencyContactRelation: "Mother",
          height: 135.0,
          weight: 38.5,
          attendancePercentage: 88.0,
          class: "Class 4",
          specialStatus: "Dyslexia",
        },
        {
          name: "Priya Sharma",
          dateOfBirth: "2014-12-05",
          gender: "Female",
          photo: "",
          examSkills: ["Art", "Music", "Hindi"],
          languages: ["Hindi", "English", "Punjabi"],
          bloodGroup: "O+",
          emergencyContactName: "Vikram Sharma",
          emergencyContactMobile: "9234567890",
          emergencyContactRelation: "Father",
          height: 125.0,
          weight: 32.0,
          attendancePercentage: 95.0,
          class: "Class 3",
          specialStatus: "None",
        },
        {
          name: "Rohan Patel",
          dateOfBirth: "2015-03-14",
          gender: "Male",
          photo: "",
          examSkills: ["Physical Education", "Mathematics"],
          languages: ["Hindi", "English", "Gujarati"],
          bloodGroup: "AB+",
          emergencyContactName: "Kavita Patel",
          emergencyContactMobile: "9345678901",
          emergencyContactRelation: "Mother",
          height: 118.0,
          weight: 28.5,
          attendancePercentage: 91.5,
          class: "Class 2",
          specialStatus: "None",
        },
        {
          name: "Sneha Gupta",
          dateOfBirth: "2011-09-30",
          gender: "Female",
          photo: "",
          examSkills: ["Science", "Mathematics", "English"],
          languages: ["Hindi", "English", "Bengali"],
          bloodGroup: "B-",
          emergencyContactName: "Amit Gupta",
          emergencyContactMobile: "9456789012",
          emergencyContactRelation: "Father",
          height: 152.0,
          weight: 48.0,
          attendancePercentage: 97.0,
          class: "Class 6",
          specialStatus: "None",
        },
        {
          name: "Ravi Singh",
          dateOfBirth: "2010-11-12",
          gender: "Male",
          photo: "",
          examSkills: ["Science", "Mathematics", "Computer Science"],
          languages: ["Hindi", "English"],
          bloodGroup: "A-",
          emergencyContactName: "Pooja Singh",
          emergencyContactMobile: "9567890123",
          emergencyContactRelation: "Mother",
          height: 158.0,
          weight: 52.0,
          attendancePercentage: 89.5,
          class: "Class 7",
          specialStatus: "Blind",
        },
      ]).onConflictDoNothing();
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}