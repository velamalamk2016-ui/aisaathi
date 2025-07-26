import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Brain, Globe, Wifi, WifiOff, User, ChevronDown } from "lucide-react";
import { LANGUAGES, getTranslation, type Language } from "@/lib/language-utils";
import { offlineStorage } from "@/lib/offline-storage";

interface HeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  isOnline: boolean;
}

export function Header({ language, onLanguageChange, isOnline }: HeaderProps) {
  const [location] = useLocation();
  
  const handleLanguageChange = (newLanguage: Language) => {
    onLanguageChange(newLanguage);
    offlineStorage.saveLanguage(newLanguage);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{getTranslation('ai-saathi', language)}</h1>
              <p className="text-sm text-gray-600">{getTranslation('ai-saathi-subtitle', language)}</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Online/Offline Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isOnline 
                ? 'bg-accent text-white' 
                : 'bg-red-500 text-white'
            }`}>
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{isOnline ? getTranslation('online', language) : getTranslation('offline', language)}</span>
            </div>
            
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{LANGUAGES[language]}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <DropdownMenuItem 
                    key={code}
                    onClick={() => handleLanguageChange(code as Language)}
                    className={language === code ? 'bg-primary text-white' : ''}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.reload();
                    } catch (error) {
                      console.error('Logout error:', error);
                      window.location.reload();
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  {getTranslation('logout', language) || 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
