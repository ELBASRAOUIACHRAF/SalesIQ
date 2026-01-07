import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface SystemSettingsState {
  siteName: string;
  itemsPerPage: number;
  theme: 'dark' | 'light';
  compactMode: boolean;
  showAnimations: boolean;
  sessionTimeout: number;
}

const STORAGE_KEY = 'salesiq_system_settings';

const DEFAULT_SETTINGS: SystemSettingsState = {
  siteName: 'SalesIQ',
  itemsPerPage: 10,
  theme: 'dark',
  compactMode: false,
  showAnimations: true,
  sessionTimeout: 30,
};

@Injectable({ providedIn: 'root' })
export class SystemSettingsService {
  private settings$ = new BehaviorSubject<SystemSettingsState>(DEFAULT_SETTINGS);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      const stored = this.loadFromStorage();
      const merged = { ...DEFAULT_SETTINGS, ...stored } as SystemSettingsState;
      this.settings$.next(merged);
      this.applySideEffects(merged);
      this.persist(merged);
    }
  }

  getSettings(): SystemSettingsState {
    return this.settings$.getValue();
  }

  getSetting<K extends keyof SystemSettingsState>(key: K): SystemSettingsState[K] {
    return this.settings$.getValue()[key];
  }

  settingsChanges() {
    return this.settings$.asObservable();
  }

  saveSettings(settings: Partial<SystemSettingsState>): SystemSettingsState {
    const current = this.settings$.getValue();
    const merged = { ...current, ...settings } as SystemSettingsState;
    if (this.isBrowser) {
      this.persist(merged);
    }
    this.settings$.next(merged);
    if (this.isBrowser) {
      this.applySideEffects(merged);
    }
    return merged;
  }

  resetSettings(): SystemSettingsState {
    if (this.isBrowser) {
      this.persist(DEFAULT_SETTINGS);
    }
    this.settings$.next(DEFAULT_SETTINGS);
    if (this.isBrowser) {
      this.applySideEffects(DEFAULT_SETTINGS);
    }
    return DEFAULT_SETTINGS;
  }

  private persist(settings: SystemSettingsState): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to persist settings', e);
    }
  }

  private loadFromStorage(): Partial<SystemSettingsState> | null {
    if (!this.isBrowser) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Partial<SystemSettingsState>;
    } catch (e) {
      console.error('Failed to parse stored settings', e);
      return null;
    }
  }

  private applySideEffects(settings: SystemSettingsState): void {
    if (!this.isBrowser) return;
    
    const root = document.documentElement;

    // Theme: set attribute and CSS variables for light/dark palettes
    root.setAttribute('data-theme', settings.theme);
    const isLight = settings.theme === 'light';
    root.style.setProperty('--bg', isLight ? '#f8fafc' : '#0f172a');
    root.style.setProperty('--panel', isLight ? '#ffffff' : '#1e293b');
    root.style.setProperty('--text', isLight ? '#0f172a' : '#f1f5f9');
    root.style.setProperty('--muted', isLight ? '#475569' : '#94a3b8');
    root.style.setProperty('--accent', isLight ? '#4f46e5' : '#6366f1');
    root.style.setProperty('--border', isLight ? '#e2e8f0' : '#334155');

    // Compact mode
    document.body.classList.toggle('compact-mode', !!settings.compactMode);

    // Animations toggle
    document.body.classList.toggle('animations-off', settings.showAnimations === false);

    // Site name (document title for visibility)
    if (settings.siteName) {
      document.title = settings.siteName;
    }
  }
}
