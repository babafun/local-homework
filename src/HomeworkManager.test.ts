import { HomeworkManager } from './HomeworkManager';
import { StorageService } from './StorageService';
import { HomeworkItem } from './types';

describe('HomeworkManager', () => {
  let storage: StorageService;
  let manager: HomeworkManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new StorageService();
  });

  describe('constructor', () => {
    it('should initialize with empty items when storage is empty', () => {
      manager = new HomeworkManager(storage);
      expect(manager.getAllHomework()).toEqual([]);
    });

    it('should load existing items from storage on construction', () => {
      // Arrange: Add items to storage
      const items: HomeworkItem[] = [
        {
          id: '1',
          title: 'Math homework',
          subject: 'Mathematics',
          dueDate: new Date('2024-01-15'),
          completed: false,
          createdAt: new Date('2024-01-10')
        },
        {
          id: '2',
          title: 'Science project',
          subject: 'Science',
          dueDate: new Date('2024-01-20'),
          completed: true,
          createdAt: new Date('2024-01-12')
        }
      ];
      storage.save(items);

      // Act: Create manager (should load from storage)
      manager = new HomeworkManager(storage);

      // Assert: Verify items were loaded
      const loadedItems = manager.getAllHomework();
      expect(loadedItems).toHaveLength(2);
      expect(loadedItems[0].id).toBe('1');
      expect(loadedItems[0].title).toBe('Math homework');
      expect(loadedItems[1].id).toBe('2');
      expect(loadedItems[1].title).toBe('Science project');
    });

    it('should handle corrupted storage data gracefully', () => {
      // Arrange: Put invalid data in storage
      localStorage.setItem('homework-tracker-data', 'invalid json');

      // Act: Create manager (should handle error and start with empty array)
      manager = new HomeworkManager(storage);

      // Assert: Should have empty array, not crash
      expect(manager.getAllHomework()).toEqual([]);
    });
  });

  describe('getAllHomework', () => {
    it('should return items sorted by due date in ascending order', () => {
      // Arrange: Add items with different due dates
      const items: HomeworkItem[] = [
        {
          id: '1',
          title: 'Due last',
          subject: 'Math',
          dueDate: new Date('2024-01-25'),
          completed: false,
          createdAt: new Date('2024-01-10')
        },
        {
          id: '2',
          title: 'Due first',
          subject: 'Science',
          dueDate: new Date('2024-01-15'),
          completed: false,
          createdAt: new Date('2024-01-10')
        },
        {
          id: '3',
          title: 'Due middle',
          subject: 'English',
          dueDate: new Date('2024-01-20'),
          completed: false,
          createdAt: new Date('2024-01-10')
        }
      ];
      storage.save(items);
      manager = new HomeworkManager(storage);

      // Act
      const sorted = manager.getAllHomework();

      // Assert: Should be sorted by due date
      expect(sorted[0].title).toBe('Due first');
      expect(sorted[1].title).toBe('Due middle');
      expect(sorted[2].title).toBe('Due last');
    });

    it('should return a copy of items array, not the original', () => {
      manager = new HomeworkManager(storage);
      const items1 = manager.getAllHomework();
      const items2 = manager.getAllHomework();
      
      // Should be different array instances
      expect(items1).not.toBe(items2);
    });
  });

  describe('getHomeworkById', () => {
    beforeEach(() => {
      const items: HomeworkItem[] = [
        {
          id: 'test-id-1',
          title: 'Test homework',
          subject: 'Math',
          dueDate: new Date('2024-01-15'),
          completed: false,
          createdAt: new Date('2024-01-10')
        }
      ];
      storage.save(items);
      manager = new HomeworkManager(storage);
    });

    it('should return item when ID exists', () => {
      const item = manager.getHomeworkById('test-id-1');
      expect(item).toBeDefined();
      expect(item?.title).toBe('Test homework');
    });

    it('should return undefined when ID does not exist', () => {
      const item = manager.getHomeworkById('non-existent-id');
      expect(item).toBeUndefined();
    });
  });
});
