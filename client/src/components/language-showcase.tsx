import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES, getTranslation, type Language } from "@/lib/language-utils";

interface LanguageShowcaseProps {
  language: Language;
}

export function LanguageShowcase({ language }: LanguageShowcaseProps) {
  const languages: Array<{ lang: Language; region: string; script: string }> = [
    { lang: "hindi", region: "North India", script: "Devanagari" },
    { lang: "english", region: "Global", script: "Latin" },
    { lang: "tamil", region: "Tamil Nadu", script: "Tamil" },
    { lang: "telugu", region: "Andhra Pradesh, Telangana", script: "Telugu" },
    { lang: "bengali", region: "West Bengal", script: "Bengali" },
    { lang: "urdu", region: "North India", script: "Arabic" },
    { lang: "marathi", region: "Maharashtra", script: "Devanagari" },
    { lang: "malayalam", region: "Kerala", script: "Malayalam" },
    { lang: "kannada", region: "Karnataka", script: "Kannada" },
    { lang: "gujarati", region: "Gujarat", script: "Gujarati" },
    { lang: "punjabi", region: "Punjab", script: "Gurmukhi" },
    { lang: "odia", region: "Odisha", script: "Odia" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌍 {getTranslation('supported-languages', language)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map(({ lang, region, script }) => (
            <div key={lang} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">
                  {LANGUAGES[lang]}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {lang}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>📍 {region}</div>
                <div>📝 {script} Script</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {getTranslation('language-features-desc', language)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}