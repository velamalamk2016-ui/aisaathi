import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, type Language } from "@/lib/language-utils";

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  supportedLanguages: string[];
  placeholder?: string;
  className?: string;
}

export function LanguageSelector({ 
  value, 
  onValueChange, 
  supportedLanguages, 
  placeholder = "Select language",
  className = ""
}: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-64 overflow-y-auto">
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{LANGUAGES[lang as Language]}</span>
              <span className="text-xs text-gray-500 uppercase">{lang}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}