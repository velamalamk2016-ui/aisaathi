import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { offlineStorage } from "@/lib/offline-storage";
import { type Language } from "@shared/schema";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TeachingAids from "@/pages/agents/teaching-aids";
import LessonPlan from "@/pages/agents/lesson-plan";
import Assessment from "@/pages/agents/assessment";
import Multilingual from "@/pages/agents/multilingual";
import Admin from "@/pages/agents/admin";
import Storyteller from "@/pages/agents/storyteller";
import Accessibility from "@/pages/agents/accessibility";
import Evaluation from "@/pages/agents/evaluation";


function Router() {
  const [language, setLanguage] = useState<Language>("hindi");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = offlineStorage.getLanguage();
    if (savedLanguage) {
      setLanguage(savedLanguage as Language);
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    offlineStorage.saveLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header 
        language={language} 
        onLanguageChange={handleLanguageChange}
        isOnline={isOnline}
      />
      
      <Switch>
        <Route path="/" component={() => <Dashboard language={language} />} />
        <Route path="/agents/teaching-aids" component={() => <TeachingAids language={language} />} />
        <Route path="/agents/lesson-plan" component={() => <LessonPlan language={language} />} />
        <Route path="/agents/assessment" component={() => <Assessment language={language} />} />
        <Route path="/agents/multilingual" component={() => <Multilingual language={language} />} />
        <Route path="/agents/admin" component={() => <Admin language={language} />} />
        <Route path="/agents/storyteller" component={() => <Storyteller language={language} />} />
        <Route path="/agents/accessibility" component={Accessibility} />
        <Route path="/agents/evaluation" component={() => <Evaluation language={language} />} />

        <Route component={() => <NotFound language={language} />} />
      </Switch>
      
      <Footer language={language} onLanguageChange={handleLanguageChange} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
