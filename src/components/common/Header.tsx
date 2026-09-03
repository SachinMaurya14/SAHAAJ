import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Sun, 
  Moon, 
  Laptop,
  Search, 
  User, 
  Stethoscope, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { UserRole, ThemeMode } from '../../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  theme?: ThemeMode;
  setTheme?: (theme: ThemeMode) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  userRole,
  setUserRole,
  theme = 'dark',
  setTheme,
  isDarkMode,
  toggleDarkMode,
  onOpenCommandPalette
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = isDarkMode !== undefined 
    ? isDarkMode 
    : (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'intelligence', label: 'Health Intelligence' },
    { id: 'app-overview', label: 'Workspace' },
    { id: 'provenance', label: 'Safety & AI' },
  ];

  const handleSelectTheme = (mode: ThemeMode) => {
    if (setTheme) {
      setTheme(mode);
    } else if (toggleDarkMode) {
      if ((mode === 'dark' && !isDark) || (mode === 'light' && isDark)) {
        toggleDarkMode();
      }
    }
    setThemeDropdownOpen(false);
  };

  return (
    <header 
      id="saahaj-main-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2.5 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-primary)] shadow-sm' 
          : 'py-3.5 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]'
      }`}
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between gap-4">
        
        {/* =========================================================================
            ZONE 1: Brand Masthead & Editorial Mark
           ========================================================================= */}
        <div className="flex items-center shrink-0">
          <button 
            id="brand-logo-btn"
            onClick={() => { setCurrentView('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-3.5 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A38D7D]"
          >
            <div className="w-8 h-8 rounded-none border border-[var(--border-primary)] bg-[var(--text-primary)] text-[var(--bg-primary)] flex items-center justify-center transition-transform group-hover:scale-105">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-editorial text-2xl sm:text-3xl font-normal tracking-tight italic text-[var(--text-primary)] leading-none">
                SAAHAJ
              </span>
              <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.22em] font-mono-code text-[var(--text-muted)] mt-1">
                Health Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* =========================================================================
            ZONE 2: Primary Navigation & Distinct Mode Switcher
           ========================================================================= */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1 max-w-3xl">
          
          {/* Distinct Segmented Folio Mode Switcher */}
          <div className="flex items-center p-1 rounded-none border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-xs shrink-0 shadow-xs">
            <button
              id="role-toggle-patient"
              onClick={() => setUserRole('patient')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-sans font-semibold transition-all cursor-pointer ${
                userRole === 'patient'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Patient Folio</span>
            </button>
            <button
              id="role-toggle-clinician"
              onClick={() => setUserRole('clinician')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-sans font-semibold transition-all cursor-pointer ${
                userRole === 'clinician'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Stethoscope className="w-3 h-3" />
              <span>Clinician Folio</span>
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[11px] font-sans font-medium uppercase tracking-[0.18em]">
            {navItems.map((item) => {
              const isActive = currentView === item.id || (item.id === 'app-overview' && currentView.startsWith('app-'));
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setCurrentView(item.id);
                    if (item.id === 'landing') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`pb-1 transition-all border-b cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* =========================================================================
            ZONE 3: Utility & Actions (Search, Theme, Folio Launch)
           ========================================================================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Search / Command Palette Trigger */}
          <button
            id="header-search-btn"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-none text-xs text-[var(--text-secondary)] bg-[var(--surface-primary)] hover:bg-[var(--surface-secondary)] border border-[var(--border-primary)] transition-colors cursor-pointer shadow-2xs"
            title="Open Health Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="hidden sm:inline font-sans text-[11px] tracking-wider uppercase">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono-code bg-[var(--surface-secondary)] border border-[var(--border-secondary)] text-[var(--text-muted)]">⌘K</kbd>
          </button>

          {/* Theme Selector (Light / Dark / System) */}
          <div className="relative">
            <button
              id="theme-toggle-btn"
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-none border border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              aria-label="Theme settings"
              title={`Current Theme: ${theme.toUpperCase()}`}
            >
              {theme === 'system' ? (
                <Laptop className="w-3.5 h-3.5" />
              ) : isDark ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-600" />
              )}
            </button>

            {/* Theme Dropdown Menu */}
            {themeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-[var(--surface-primary)] border border-[var(--border-primary)] shadow-lg py-1 z-50 animate-in fade-in">
                <button
                  onClick={() => handleSelectTheme('light')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    theme === 'light' 
                      ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => handleSelectTheme('dark')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    theme === 'dark' 
                      ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => handleSelectTheme('system')}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    theme === 'system' 
                      ? 'bg-[var(--surface-secondary)] text-[var(--text-primary)] font-bold' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            id="header-launch-app-btn"
            onClick={() => setCurrentView('app-overview')}
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-none text-[11px] font-sans font-bold uppercase tracking-widest text-[var(--bg-primary)] bg-[var(--text-primary)] hover:opacity-90 border border-[var(--border-primary)] transition-all cursor-pointer shadow-xs"
          >
            <span>{currentView.startsWith('app-') ? 'Workspace' : 'Enter Folio'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-none border border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-primary)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] shadow-xl space-y-3">
          {/* Mobile Role Switcher */}
          <div className="flex items-center p-1 border border-[var(--border-primary)] bg-[var(--surface-secondary)] text-xs">
            <button
              onClick={() => { setUserRole('patient'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-center ${
                userRole === 'patient' 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Patient Mode
            </button>
            <button
              onClick={() => { setUserRole('clinician'); setMobileMenuOpen(false); }}
              className={`flex-1 py-1.5 text-[11px] uppercase tracking-wider font-semibold text-center ${
                userRole === 'clinician' 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Clinician Mode
            </button>
          </div>

          <div className="flex flex-col space-y-1 pt-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-xs uppercase tracking-wider font-sans font-medium ${
                  currentView === item.id 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setCurrentView('app-overview'); setMobileMenuOpen(false); }}
            className="w-full py-2.5 text-center font-bold uppercase tracking-widest text-[var(--bg-primary)] bg-[var(--text-primary)] text-xs"
          >
            Enter Health Workspace
          </button>
        </div>
      )}
    </header>
  );
};
