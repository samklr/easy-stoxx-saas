"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { Locale, LOCALE_NAMES } from "@/lib/i18n";

interface LanguageSelectorProps {
  currentLocale: Locale;
  onLocaleChange: (locale: Locale) => void;
}

export function LanguageSelector({ currentLocale, onLocaleChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: Locale) => {
    onLocaleChange(locale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-foreground transition-colors border border-primary/20"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{LOCALE_NAMES[currentLocale]}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
            {Object.entries(LOCALE_NAMES).map(([locale, name]) => (
              <button
                key={locale}
                onClick={() => handleLocaleChange(locale as Locale)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  currentLocale === locale
                    ? "bg-primary/20 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
