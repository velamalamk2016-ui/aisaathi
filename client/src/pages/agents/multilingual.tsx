import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LanguageSelector } from "@/components/language-selector";
import { LanguageShowcase } from "@/components/language-showcase";
import { Label } from "@/components/ui/label";
import { Loader2, Languages, ArrowRight, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Language } from "@/lib/language-utils";
import { LANGUAGES, getTranslation, isRTL } from "@/lib/language-utils";

interface MultilingualProps {
  language: Language;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  culturalNotes?: string;
}

export default function MultilingualAgent({ language }: MultilingualProps) {
  const [inputText, setInputText] = useState("");
  const [fromLanguage, setFromLanguage] = useState<string>("hindi");
  const [toLanguage, setToLanguage] = useState<string>("english");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const translateMutation = useMutation({
    mutationFn: async (data: { text: string; fromLanguage: string; toLanguage: string }) => {
      return apiRequest(`/api/agents/multilingual/translate`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/activities"] });
      toast({
        title: getTranslation("success", language),
        description: getTranslation("translation-success", language),
      });
    },
    onError: () => {
      toast({
        title: getTranslation("error", language),
        description: getTranslation("translation-error", language),
        variant: "destructive",
      });
    },
  });

  const handleTranslate = () => {
    if (!inputText.trim()) {
      toast({
        title: getTranslation("error", language),
        description: getTranslation("enter-text-to-translate", language),
        variant: "destructive",
      });
      return;
    }

    if (fromLanguage === toLanguage) {
      toast({
        title: getTranslation("error", language),
        description: getTranslation("select-different-languages", language),
        variant: "destructive",
      });
      return;
    }

    translateMutation.mutate({
      text: inputText,
      fromLanguage,
      toLanguage,
    });
  };

  const handleCopy = async () => {
    if (result?.translatedText) {
      await navigator.clipboard.writeText(result.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: getTranslation("success", language),
        description: getTranslation("translation-copied", language),
      });
    }
  };

  const swapLanguages = () => {
    setFromLanguage(toLanguage);
    setToLanguage(fromLanguage);
    if (result) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  // Language options for supported languages
  const supportedLanguages = [
    "hindi", "english", "tamil", "telugu", "bengali", 
    "urdu", "marathi", "malayalam", "kannada", "gujarati", 
    "punjabi", "odia"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Languages className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getTranslation("multilingual", language)}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Translate educational content across 12 major Indian languages including Hindi, English, Tamil, Telugu, Bengali, Urdu, Marathi, Malayalam, Kannada, Gujarati, Punjabi, and Odia with cultural context
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language Selection
              </CardTitle>
              <CardDescription>
                Choose source and target languages for translation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="fromLanguage">From Language</Label>
                  <LanguageSelector
                    value={fromLanguage}
                    onValueChange={setFromLanguage}
                    supportedLanguages={supportedLanguages}
                    placeholder="Select source language"
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={swapLanguages}
                    className="px-3"
                  >
                    ⇄
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toLanguage">To Language</Label>
                  <LanguageSelector
                    value={toLanguage}
                    onValueChange={setToLanguage}
                    supportedLanguages={supportedLanguages}
                    placeholder="Select target language"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Source Text ({LANGUAGES[fromLanguage as Language]})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter text to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {inputText.length} characters
                  </span>
                  <Button
                    onClick={handleTranslate}
                    disabled={translateMutation.isPending || !inputText.trim()}
                    className="flex items-center gap-2"
                  >
                    {translateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    Translate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Translation ({LANGUAGES[toLanguage as Language]})
                  {result && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      className="flex items-center gap-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {translateMutation.isPending ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Translating content...</p>
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p 
                        className={`text-gray-900 dark:text-white leading-relaxed ${
                          isRTL(toLanguage as Language) ? 'text-right' : 'text-left'
                        }`}
                        dir={isRTL(toLanguage as Language) ? 'rtl' : 'ltr'}
                      >
                        {result.translatedText}
                      </p>
                    </div>
                    {result.culturalNotes && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                          Cultural Notes:
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {result.culturalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <p className="text-gray-500 text-center">
                      Translation will appear here...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Language Support Overview */}
          <LanguageShowcase />

          {/* Quick Translation Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Examples</CardTitle>
              <CardDescription>
                Try these common educational phrases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  "Good morning, students!",
                  "Please open your books",
                  "Today we will learn about mathematics",
                  "Raise your hand if you have questions",
                  "Very good! Well done!",
                  "Let's practice together",
                  "Complete your homework",
                  "Pay attention to the lesson",
                  "Time for break",
                  "See you tomorrow"
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left h-auto p-3 whitespace-normal"
                    onClick={() => setInputText(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}