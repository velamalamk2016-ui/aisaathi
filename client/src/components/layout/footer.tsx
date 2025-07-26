import { getTranslation, LANGUAGES, type Language } from "@/lib/language-utils";
import { Link } from "wouter";

interface FooterProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
}

export function Footer({ language, onLanguageChange }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-semibold text-neutral-900 mb-4">{getTranslation('ai-saathi', language)}</h5>
            <p className="text-sm text-gray-600">
              {getTranslation('footer-description', language)}
            </p>
          </div>
          <div>
            <h5 className="font-semibold text-neutral-900 mb-4">{getTranslation('features', language)}</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/agents/teaching-aids" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('teaching-aids', language)}
                </Link>
              </li>
              <li>
                <Link href="/agents/lesson-plan" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('lesson-plan', language)}
                </Link>
              </li>
              <li>
                <Link href="/agents/assessment" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('assessment', language)}
                </Link>
              </li>
              <li>
                <Link href="/agents/multilingual" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('multilingual', language)}
                </Link>
              </li>
              <li>
                <Link href="/agents/admin" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('admin-agent', language)}
                </Link>
              </li>
              <li>
                <Link href="/agents/storyteller" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('storyteller-agent', language)}
                </Link>
              </li>
              <li>
                <Link href="/agents/evaluation" className="hover:text-blue-600 hover:underline transition-colors cursor-pointer">
                  {getTranslation('evaluation-assistant', language)}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-neutral-900 mb-4">{getTranslation('languages', language)}</h5>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <button
                  key={code} 
                  onClick={() => onLanguageChange(code as Language)}
                  className={`text-sm text-left hover:text-blue-600 hover:underline transition-colors cursor-pointer py-1 ${
                    language === code ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-neutral-900 mb-4">{getTranslation('support', language)}</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>{getTranslation('user-guide', language)}</li>
              <li>{getTranslation('faq', language)}</li>
              <li>{getTranslation('community-forum', language)}</li>
              <li>{getTranslation('technical-support', language)}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            {getTranslation('copyright-text', language)}
          </p>
        </div>
      </div>
    </footer>
  );
}
