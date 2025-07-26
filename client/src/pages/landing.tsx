import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Brain, Globe, BarChart3, Accessibility, Zap, Shield } from "lucide-react";
import { type Language } from "@shared/schema";
import { getTranslation } from "@/lib/language-utils";

interface LandingProps {
  language: Language;
}

export default function Landing({ language }: LandingProps) {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Saathi
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            {getTranslation("landing-subtitle", language) || 
            "Empowering India's educators with AI-powered tools for multilingual, inclusive, and effective teaching"}
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            {getTranslation("start-teaching", language) || "Start Teaching with AI"}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-lg">
                {getTranslation("teaching-aids", language) || "Teaching Aids"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Generate worksheets, flashcards, and interactive learning materials instantly
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle className="text-lg">
                {getTranslation("lesson-planning", language) || "Lesson Planning"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Create comprehensive lesson plans adapted to multi-grade classrooms
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-lg">
                {getTranslation("multilingual-support", language) || "Multilingual"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Support for 12 Indian languages with instant translation and localization
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle className="text-lg">
                {getTranslation("admin-tools", language) || "Admin Tools"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Track attendance, monitor progress, and generate comprehensive reports
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* AI Agents Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            8 Specialized AI Agents for Every Teaching Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Assessment Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Conduct oral quizzes and evaluations</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Storyteller Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Create engaging educational stories</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Accessibility className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Accessibility Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Support for special needs students</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <Zap className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Evaluation Agent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered worksheet evaluation</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Built for Indian Classrooms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Offline-First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Works seamlessly even with limited internet connectivity
              </p>
            </div>
            <div className="text-center">
              <Globe className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Culturally Relevant</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Content designed for Indian curriculum and cultural context
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Multi-Grade Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Perfect for mixed-age classrooms common in rural India
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of educators already using AI Saathi
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="px-12 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            {getTranslation("get-started", language) || "Get Started Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}