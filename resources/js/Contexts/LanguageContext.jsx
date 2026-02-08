import { createContext, useContext, useState, useCallback } from 'react';
import en from '@/i18n/en.json';
import ms from '@/i18n/ms.json';

const translations = { en, ms };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState(() => {
        try { return localStorage.getItem('locale') || 'en'; } catch { return 'en'; }
    });

    const setLocale = useCallback((l) => {
        setLocaleState(l);
        try { localStorage.setItem('locale', l); } catch {}
    }, []);

    const t = useCallback((key) => {
        return translations[locale]?.[key] || translations.en?.[key] || key;
    }, [locale]);

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}

export function LanguageSwitcher({ className = '' }) {
    const { locale, setLocale } = useLanguage();
    return (
        <div className={`flex items-center gap-1 text-sm font-bold ${className}`}>
            <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 rounded-lg transition-colors ${locale === 'en' ? 'text-[#FF6600] bg-[#FF6600]/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
                EN
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
                onClick={() => setLocale('ms')}
                className={`px-2 py-1 rounded-lg transition-colors ${locale === 'ms' ? 'text-[#FF6600] bg-[#FF6600]/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
            >
                MY
            </button>
        </div>
    );
}
