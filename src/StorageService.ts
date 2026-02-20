import { HomeworkItem, isSerializedHomeworkItem } from './types';

/**
 * Service for persisting homework items to LocalStorage
 */
export class StorageService {
  private readonly STORAGE_KEY = 'homework-tracker-data';

  /**
   * Save homework items to LocalStorage
   */
  save(items: HomeworkItem[]): void {
    try {
      const serialized = items.map(item => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        dueDate: item.dueDate.toISOString(),
        completed: item.completed,
        createdAt: item.createdAt.toISOString()
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save to LocalStorage:', error);
      throw error;
    }
  }

  /**
   * Load homework items from LocalStorage
   * Returns empty array if data is corrupted or unavailable
   */
  load(): HomeworkItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      
      if (!Array.isArray(parsed)) {
        console.error('Invalid data format in LocalStorage');
        return [];
      }

      const items: HomeworkItem[] = [];
      
      for (const item of parsed) {
        if (!isSerializedHomeworkItem(item)) {
          console.error('Invalid homework item in storage:', item);
          continue;
        }

        items.push({
          id: item.id,
          title: item.title,
          subject: item.subject,
          dueDate: new Date(item.dueDate),
          completed: item.completed,
          createdAt: new Date(item.createdAt)
        });
      }

      return items;
    } catch (error) {
      console.error('Failed to load from LocalStorage:', error);
      return [];
    }
  }

  /**
   * Clear all homework data from LocalStorage
   */
  clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear LocalStorage:', error);
      throw error;
    }
  }
}
