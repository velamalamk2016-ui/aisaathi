import type { DashboardStats, Activity, Resource, Student } from "@shared/schema";

const STORAGE_KEYS = {
  DASHBOARD_STATS: 'ai-saathi-dashboard-stats',
  ACTIVITIES: 'ai-saathi-activities',
  RESOURCES: 'ai-saathi-resources',
  STUDENTS: 'ai-saathi-students',
  USER_PREFERENCES: 'ai-saathi-user-preferences',
  OFFLINE_QUEUE: 'ai-saathi-offline-queue',
  LANGUAGE: 'ai-saathi-language',
} as const;

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  data: any;
  timestamp: Date;
}

class OfflineStorage {
  private isOnline = navigator.onLine;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  isOffline(): boolean {
    return !this.isOnline;
  }

  // Generic storage methods
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  // Dashboard data
  saveDashboardStats(stats: DashboardStats): void {
    this.setItem(STORAGE_KEYS.DASHBOARD_STATS, stats);
  }

  getDashboardStats(): DashboardStats | null {
    return this.getItem<DashboardStats>(STORAGE_KEYS.DASHBOARD_STATS);
  }

  // Activities
  saveActivities(activities: Activity[]): void {
    this.setItem(STORAGE_KEYS.ACTIVITIES, activities);
  }

  getActivities(): Activity[] {
    return this.getItem<Activity[]>(STORAGE_KEYS.ACTIVITIES) || [];
  }

  addActivity(activity: Activity): void {
    const activities = this.getActivities();
    activities.unshift(activity);
    this.saveActivities(activities.slice(0, 50)); // Keep last 50 activities
  }

  // Resources
  saveResources(resources: Resource[]): void {
    this.setItem(STORAGE_KEYS.RESOURCES, resources);
  }

  getResources(): Resource[] {
    return this.getItem<Resource[]>(STORAGE_KEYS.RESOURCES) || [];
  }

  // Students
  saveStudents(students: Student[]): void {
    this.setItem(STORAGE_KEYS.STUDENTS, students);
  }

  getStudents(): Student[] {
    return this.getItem<Student[]>(STORAGE_KEYS.STUDENTS) || [];
  }

  // User preferences
  saveUserPreferences(preferences: UserPreferences): void {
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  getUserPreferences(): UserPreferences {
    return this.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES) || {
      language: 'hindi',
      theme: 'light',
      notifications: true,
    };
  }

  // Language
  saveLanguage(language: string): void {
    this.setItem(STORAGE_KEYS.LANGUAGE, language);
  }

  getLanguage(): string {
    return this.getItem<string>(STORAGE_KEYS.LANGUAGE) || 'hindi';
  }

  // Offline queue management
  addToOfflineQueue(action: OfflineAction): void {
    const queue = this.getItem<OfflineAction[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
    queue.push(action);
    this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  }

  getOfflineQueue(): OfflineAction[] {
    return this.getItem<OfflineAction[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  }

  clearOfflineQueue(): void {
    this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  private async syncOfflineQueue(): Promise<void> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline actions...`);
    
    for (const action of queue) {
      try {
        const response = await fetch(action.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });

        if (!response.ok) {
          console.error('Failed to sync action:', action);
        }
      } catch (error) {
        console.error('Error syncing action:', action, error);
      }
    }

    this.clearOfflineQueue();
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const offlineStorage = new OfflineStorage();
