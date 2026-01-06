import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingsService, SystemSettingsState } from '../../../core/services/system-settings.service';

interface Setting {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'number' | 'text';
  value: any;
  options?: { value: any; label: string }[];
  min?: number;
  max?: number;
}

interface SettingGroup {
  title: string;
  icon: string;
  description: string;
  settings: Setting[];
}

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-settings.html',
  styleUrls: ['./system-settings.css']
})
export class SystemSettings implements OnInit {
  settingGroups: SettingGroup[] = [];
  saving = false;
  hasChanges = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private settingsService: SystemSettingsService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.initializeSettings();
    const current = this.settingsService.getSettings();
    this.applySettings(current);
  }

  private collectSettings(): Record<string, any> {
    const settings: Record<string, any> = {};
    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        settings[setting.key] = setting.value;
      });
    });
    return settings;
  }

  private setSavingState(value: boolean): void {
    this.saving = value;
    this.cdr.detectChanges();
  }

  applySettings(settings: Record<string, any>): void {
    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if (settings.hasOwnProperty(setting.key)) {
          setting.value = settings[setting.key];
        }
      });
    });
  }

  initializeSettings(): void {
    this.settingGroups = [
      {
        title: 'General',
        icon: '⚙️',
        description: 'General application settings and preferences',
        settings: [
          {
            key: 'siteName',
            label: 'Site Name',
            description: 'The name displayed in browser tab and across the application',
            type: 'text',
            value: 'SalesIQ'
          },
          {
            key: 'itemsPerPage',
            label: 'Items Per Page',
            description: 'Number of items shown in tables (Users, Products, Sales, Reviews)',
            type: 'number',
            value: 10,
            min: 5,
            max: 50
          }
        ]
      },
      {
        title: 'Appearance',
        icon: '🎨',
        description: 'Visual customization options',
        settings: [
          {
            key: 'theme',
            label: 'Theme',
            description: 'Switch between dark and light color schemes',
            type: 'select',
            value: 'dark',
            options: [
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' }
            ]
          },
          {
            key: 'compactMode',
            label: 'Compact Mode',
            description: 'Reduce padding and spacing for denser layouts',
            type: 'toggle',
            value: false
          },
          {
            key: 'showAnimations',
            label: 'Enable Animations',
            description: 'Show smooth transitions and animations throughout the app',
            type: 'toggle',
            value: true
          }
        ]
      },
      {
        title: 'Session',
        icon: '🔒',
        description: 'Session and timeout settings',
        settings: [
          {
            key: 'sessionTimeout',
            label: 'Session Timeout (minutes)',
            description: 'Auto logout after this many minutes of inactivity (requires page reload)',
            type: 'number',
            value: 30,
            min: 5,
            max: 480
          }
        ]
      }
    ];
  }

  onSettingChange(): void {
    this.hasChanges = true;
    this.cdr.detectChanges();
  }

  saveSettings(): void {
    if (this.saving) return; // Prevent double-clicks

    this.setSavingState(true);

    try {
      const settings = this.collectSettings();
      this.settingsService.saveSettings(settings as SystemSettingsState);

      this.zone.run(() => {
        this.hasChanges = false;
        this.setSavingState(false);
        this.cdr.detectChanges();
        this.showSuccessMessage('Settings saved successfully!');
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      this.zone.run(() => {
        this.setSavingState(false);
        this.cdr.detectChanges();
        this.showErrorMessage('Failed to save settings. Please try again.');
      });
    }
  }

  resetSettings(): void {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      try {
        // Reset settings in service first
        const defaults = this.settingsService.resetSettings();
        
        // Re-initialize settings groups with fresh default values
        this.initializeSettings();
        
        // Apply the defaults from the service to ensure consistency
        this.applySettings(defaults);
        
        this.hasChanges = false;
        
        // Run change detection inside NgZone to ensure UI updates
        this.zone.run(() => {
          this.cdr.detectChanges();
          this.showSuccessMessage('Settings reset to defaults');
        });
      } catch (error) {
        console.error('Error resetting settings:', error);
        this.zone.run(() => {
          this.cdr.detectChanges();
          this.showErrorMessage('Failed to reset settings');
        });
      }
    }
  }

  exportSettings(): void {
    try {
      const settings = this.collectSettings();

      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `salesiq-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      this.showSuccessMessage('Settings exported successfully');
    } catch (error) {
      console.error('Error exporting settings:', error);
      this.showErrorMessage('Failed to export settings');
    }
  }

  importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const settings = JSON.parse(event.target.result);
            this.applySettings(settings);
            this.hasChanges = true;
            this.cdr.detectChanges();
            this.showSuccessMessage('Settings imported successfully. Click Save to apply.');
          } catch (error) {
            console.error('Error importing settings:', error);
            this.showErrorMessage('Invalid settings file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  private showSuccessMessage(message: string): void {
    // You can replace this with a toast notification service
    const banner = document.createElement('div');
    banner.className = 'success-toast';
    banner.textContent = message;
    banner.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; animation: slideIn 0.3s ease-out;';
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => document.body.removeChild(banner), 300);
    }, 3000);
  }

  private showErrorMessage(message: string): void {
    const banner = document.createElement('div');
    banner.className = 'error-toast';
    banner.textContent = message;
    banner.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999; animation: slideIn 0.3s ease-out;';
    document.body.appendChild(banner);
    setTimeout(() => {
      banner.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => document.body.removeChild(banner), 300);
    }, 3000);
  }
}
