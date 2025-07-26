import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Brain, Shield, Globe, Users } from "lucide-react";
import { loginSchema, type LoginData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getTranslation, type Language } from "@/lib/language-utils";

interface LoginProps {
  language: Language;
}

export function Login({ language }: LoginProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "admin",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: getTranslation("login-success", language) || "Login Successful",
        description: getTranslation("welcome-back", language) || "Welcome back to AI Saathi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: getTranslation("login-error", language) || "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl inline-block mb-4">
            <Brain className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTranslation("ai-saathi", language) || "AI Saathi"}
          </h1>
          <p className="text-gray-600">
            {getTranslation("ai-saathi-subtitle", language) || "Empowering Indian Education"}
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {getTranslation("login", language) || "Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {getTranslation("login-description", language) || "Enter your credentials to access AI Saathi"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getTranslation("username", language) || "Username"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={getTranslation("username-placeholder", language) || "Enter username"}
                          disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getTranslation("password", language) || "Password"}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder={getTranslation("password-placeholder", language) || "Enter password"}
                          disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending
                    ? (getTranslation("logging-in", language) || "Logging in...")
                    : (getTranslation("login", language) || "Login")
                  }
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <Shield className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-xs text-gray-600">{getTranslation("secure", language) || "Secure"}</p>
          </div>
          <div className="flex flex-col items-center">
            <Globe className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-xs text-gray-600">{getTranslation("multilingual", language) || "Multilingual"}</p>
          </div>
          <div className="flex flex-col items-center">
            <Users className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-xs text-gray-600">{getTranslation("collaborative", language) || "Collaborative"}</p>
          </div>
        </div>

        {/* Default Credentials Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Default credentials:</strong><br />
            Username: admin | Password: admin
          </p>
        </div>
      </div>
    </div>
  );
}