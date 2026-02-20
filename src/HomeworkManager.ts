import { HomeworkItem } from './types';
import { StorageService } from './StorageService';

/**
 * Manages homework items with business logic and persistence
 */
export class HomeworkManager {
  private items: HomeworkItem[];
  private storage: StorageService;

  /**
   * Initialize HomeworkManager with storage service
   * Loads existing items from storage on construction
   */
  constructor(storage: StorageService) {
    this.storage = storage;
    this.items = this.storage.load();
  }

  /**
   * Get all homework items sorted by due date (ascending)
   */
  getAllHomework(): HomeworkItem[] {
    return [...this.items].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  /**
   * Get a specific homework item by ID
   */
  getHomeworkById(id: string): HomeworkItem | undefined {
    return this.items.find(item => item.id === id);
  }
  /**
   * Add a new homework item
   * Validates inputs and generates unique ID
   * @throws Error if validation fails
   */
  addHomework(title: string, subject: string, dueDate: Date): HomeworkItem {
    // Validate title
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('Title cannot be empty');
    }

    // Validate subject
    const trimmedSubject = subject.trim();
    if (trimmedSubject.length === 0) {
      throw new Error('Subject cannot be empty');
    }

    // Validate due date
    if (!(dueDate instanceof Date) || isNaN(dueDate.getTime())) {
      throw new Error('Please select a valid date');
    }

    // Generate unique ID (UUID v4)
    const id = crypto.randomUUID();

    // Create new homework item
    const newItem: HomeworkItem = {
      id,
      title: trimmedTitle,
      subject: trimmedSubject,
      dueDate,
      completed: false,
      createdAt: new Date()
    };

    // Add to items array
    this.items.push(newItem);

    // Persist to storage
    this.storage.save(this.items);

    return newItem;
  }

    /**
     * Toggle completion status of a homework item
     */
    toggleCompletion(id: string): void {
      const item = this.items.find(item => item.id === id);
      if (item) {
        item.completed = !item.completed;
        this.storage.save(this.items);
      }
    }

    /**
     * Delete a homework item by ID
     */
    deleteHomework(id: string): void {
      const index = this.items.findIndex(item => item.id === id);
      if (index !== -1) {
        this.items.splice(index, 1);
        this.storage.save(this.items);
      }
    }
}
