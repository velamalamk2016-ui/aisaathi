import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Lock, Save, Plus, X } from "lucide-react";
import { teacherProfileSchema, changePasswordSchema, type TeacherProfileData, type ChangePasswordData, type Language, type User as UserType } from "@shared/schema";
import { getTranslation } from "@/lib/language-utils";

interface TeacherProfileProps {
  language: Language;
}

export function TeacherProfile({ language }: TeacherProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSubject, setNewSubject] = useState("");

  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ["/api/auth/user"],
  });

  // Profile form
  const profileForm = useForm<TeacherProfileData>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      name: user?.name || "",
      preferredLanguage: user?.preferredLanguage || "hindi",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      phoneNumber: user?.phoneNumber || "",
      email: user?.email || "",
      address: user?.address || "",
      qualification: user?.qualification || "",
      experience: user?.experience || 0,
      subjects: user?.subjects || [],
      joiningDate: user?.joiningDate || "",
    },
  });

  // Password change form
  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update user data when loaded
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        preferredLanguage: user.preferredLanguage || "hindi",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        address: user.address || "",
        qualification: user.qualification || "",
        experience: user.experience || 0,
        subjects: user.subjects || [],
        joiningDate: user.joiningDate || "",
      });
    }
  }, [user, profileForm]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: TeacherProfileData) => {
      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: getTranslation("success", language) || "Success",
        description: getTranslation("profile-updated", language) || "Profile updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: getTranslation("error", language) || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await fetch("/api/teacher/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: getTranslation("success", language) || "Success",
        description: getTranslation("password-changed", language) || "Password changed successfully!",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: getTranslation("error", language) || "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (data: TeacherProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordSubmit = (data: ChangePasswordData) => {
    changePasswordMutation.mutate(data);
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      const currentSubjects = profileForm.getValues("subjects") || [];
      profileForm.setValue("subjects", [...currentSubjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const removeSubject = (index: number) => {
    const currentSubjects = profileForm.getValues("subjects") || [];
    profileForm.setValue("subjects", currentSubjects.filter((_, i) => i !== index));
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {getTranslation("loading", language) || "Loading..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getTranslation("teacher-profile", language) || "Teacher Profile"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {getTranslation("manage-profile-desc", language) || "Manage your personal information and account settings"}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {getTranslation("profile", language) || "Profile"}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {getTranslation("security", language) || "Security"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {getTranslation("personal-information", language) || "Personal Information"}
                </CardTitle>
                <CardDescription>
                  {getTranslation("update-profile-desc", language) || "Update your profile information and teaching details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("full-name", language) || "Full Name"}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="preferredLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("preferred-language", language) || "Preferred Language"}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                                <SelectItem value="telugu">తెలుగు (Telugu)</SelectItem>
                                <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("date-of-birth", language) || "Date of Birth"}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("gender", language) || "Gender"}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">{getTranslation("male", language) || "Male"}</SelectItem>
                                <SelectItem value="female">{getTranslation("female", language) || "Female"}</SelectItem>
                                <SelectItem value="other">{getTranslation("other", language) || "Other"}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("phone-number", language) || "Phone Number"}</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="+91 98765 43210" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("email", language) || "Email"}</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} value={field.value || ""} placeholder="teacher@school.edu" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="qualification"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("qualifications", language) || "Qualifications"}</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} placeholder="B.Ed, M.A." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("experience-years", language) || "Years of Experience"}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} value={field.value || ""} min="0" max="50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="joiningDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{getTranslation("joining-date", language) || "Joining Date"}</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{getTranslation("address", language) || "Address"}</FormLabel>
                          <FormControl>
                            <Textarea {...field} value={field.value || ""} rows={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormLabel>{getTranslation("subjects-taught", language) || "Subjects Taught"}</FormLabel>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder={getTranslation("subject-name", language) || "Enter subject name"}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                        />
                        <Button type="button" onClick={addSubject} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(profileForm.watch("subjects") || []).map((subject, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-2">
                            {subject}
                            <button
                              type="button"
                              onClick={() => removeSubject(index)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updateProfileMutation.isPending 
                          ? (getTranslation("updating", language) || "Updating...")
                          : (getTranslation("save-changes", language) || "Save Changes")
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {getTranslation("change-password", language) || "Change Password"}
                </CardTitle>
                <CardDescription>
                  {getTranslation("change-password-desc", language) || "Update your password to keep your account secure"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{getTranslation("current-password", language) || "Current Password"}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{getTranslation("new-password", language) || "New Password"}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{getTranslation("confirm-password", language) || "Confirm New Password"}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={changePasswordMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        {changePasswordMutation.isPending 
                          ? (getTranslation("changing", language) || "Changing...")
                          : (getTranslation("change-password", language) || "Change Password")
                        }
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}