import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import { HomeworkItem } from './types';

describe('StorageService - Unit Tests', () => {
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
  });

  describe('Edge Cases', () => {
    it('should return empty array when storage is empty', () => {
      // Act: Load from empty storage
      const items = storage.load();

      // Assert: Should return empty array
      expect(items).toEqual([]);
      expect(items).toHaveLength(0);
    });

    it('should handle LocalStorage unavailable scenario gracefully', () => {
      // Arrange: Mock localStorage to throw errors (simulating unavailable storage)
      const mockGetItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('LocalStorage is not available');
      });

      // Act: Attempt to load - should not crash
      const items = storage.load();

      // Assert: Should return empty array when localStorage is unavailable
      expect(items).toEqual([]);
      expect(items).toHaveLength(0);

      // Cleanup
      mockGetItem.mockRestore();
    });

    it('should handle LocalStorage unavailable during save', () => {
      // Arrange: Mock localStorage.setItem to throw error
      const mockSetItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('LocalStorage quota exceeded');
      });

      const testItem: HomeworkItem = {
        id: 'test-id',
        title: 'Test homework',
        subject: 'Math',
        dueDate: new Date('2024-01-15'),
        completed: false,
        createdAt: new Date('2024-01-10')
      };

      // Act & Assert: Should throw error when save fails
      expect(() => storage.save([testItem])).toThrow();

      // Cleanup
      mockSetItem.mockRestore();
    });

    it('should handle LocalStorage unavailable during clear', () => {
      // Arrange: Mock localStorage.removeItem to throw error
      const mockRemoveItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('LocalStorage is not available');
      });

      // Act & Assert: Should throw error when clear fails
      expect(() => storage.clear()).toThrow();

      // Cleanup
      mockRemoveItem.mockRestore();
    });
  });

  describe('Basic Functionality', () => {
    it('should save and load a single item correctly', () => {
      // Arrange
      const testItem: HomeworkItem = {
        id: 'test-id-1',
        title: 'Math homework',
        subject: 'Mathematics',
        dueDate: new Date('2024-01-15'),
        completed: false,
        createdAt: new Date('2024-01-10')
      };

      // Act
      storage.save([testItem]);
      const loaded = storage.load();

      // Assert
      expect(loaded).toHaveLength(1);
      expect(loaded[0].id).toBe(testItem.id);
      expect(loaded[0].title).toBe(testItem.title);
      expect(loaded[0].subject).toBe(testItem.subject);
      expect(loaded[0].completed).toBe(testItem.completed);
      expect(loaded[0].dueDate.getTime()).toBe(testItem.dueDate.getTime());
      expect(loaded[0].createdAt.getTime()).toBe(testItem.createdAt.getTime());
    });

    it('should save and load multiple items correctly', () => {
      // Arrange
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

      // Act
      storage.save(items);
      const loaded = storage.load();

      // Assert
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('1');
      expect(loaded[1].id).toBe('2');
    });

    it('should clear all data from storage', () => {
      // Arrange: Save some items
      const items: HomeworkItem[] = [
        {
          id: '1',
          title: 'Test',
          subject: 'Math',
          dueDate: new Date('2024-01-15'),
          completed: false,
          createdAt: new Date('2024-01-10')
        }
      ];
      storage.save(items);

      // Act: Clear storage
      storage.clear();

      // Assert: Load should return empty array
      const loaded = storage.load();
      expect(loaded).toEqual([]);
    });
  });
});
