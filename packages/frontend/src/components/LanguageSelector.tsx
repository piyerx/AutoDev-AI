"use client";

import { useState } from "react";
import type { SupportedLanguage, LanguageOption } from "@autodev/shared";

const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  fresherMode?: boolean;
  onFresherToggle?: (enabled: boolean) => void;
  compact?: boolean;
  className?: string;
}

export default function LanguageSelector({
  value,
  onChange,
  fresherMode = false,
  onFresherToggle,
  compact = false,
  className,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className || ""}`}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SupportedLanguage)}
          className="text-xs border rounded px-2 py-1 bg-white text-gray-700"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
        {onFresherToggle && (
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={fresherMode}
              onChange={(e) => onFresherToggle(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            Fresher
          </label>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`}>
      <div className="flex items-center gap-3">
        {/* Language dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <span className="font-medium">{currentLang.nativeName}</span>
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-[200px] py-1">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code as SupportedLanguage);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                    lang.code === value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-gray-400">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fresher mode toggle */}
        {onFresherToggle && (
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={fresherMode}
                onChange={(e) => onFresherToggle(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors ${
                  fresherMode ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  fresherMode ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm text-gray-600 group-hover:text-gray-800">
              Fresher mode
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
