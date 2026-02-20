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

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

describe('Property-Based Tests', () => {
  let storage: StorageService;

  beforeEach(() => {
    localStorage.clear();
    storage = new StorageService();
  });

  // Feature: homework-tracker, Property 1: Valid homework creation
  // **Validates: Requirements 1.1, 1.6**
  it('Property 1: Valid homework creation - any non-empty title, subject, and valid date should create item with those values', () => {
    fc.assert(
      fc.property(
        // Generate non-empty strings for title and subject
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        // Generate valid dates
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        (title: string, subject: string, dueDate: Date) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Add homework with the generated values
          const item = manager.addHomework(title, subject, dueDate);

          // Verify the item has the correct values
          expect(item.title).toBe(title.trim());
          expect(item.subject).toBe(subject.trim());
          expect(item.dueDate.getTime()).toBe(dueDate.getTime());
          
          // Verify unique ID was assigned
          expect(item.id).toBeDefined();
          expect(typeof item.id).toBe('string');
          expect(item.id.length).toBeGreaterThan(0);
          
          // Verify completed status is false by default
          expect(item.completed).toBe(false);
          
          // Verify createdAt is set
          expect(item.createdAt).toBeInstanceOf(Date);
          expect(item.createdAt.getTime()).toBeLessThanOrEqual(Date.now());

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 14: Serialization round-trip
  // **Validates: Requirements 4.1, 4.2**
  it('Property 14: Serialization round-trip - any valid homework item should survive save/load cycle', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary homework items
        fc.record({
          id: fc.uuid(),
          title: fc.string({ minLength: 1, maxLength: 200 }),
          subject: fc.string({ minLength: 1, maxLength: 100 }),
          dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
          completed: fc.boolean(),
          createdAt: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
        }),
        (item: HomeworkItem) => {
          // Save the item
          storage.save([item]);

          // Load it back
          const loaded = storage.load();

          // Verify we got exactly one item back
          expect(loaded).toHaveLength(1);

          const loadedItem = loaded[0];

          // Verify all properties match
          expect(loadedItem.id).toBe(item.id);
          expect(loadedItem.title).toBe(item.title);
          expect(loadedItem.subject).toBe(item.subject);
          expect(loadedItem.completed).toBe(item.completed);

          // Verify Date objects are properly restored and equal
          expect(loadedItem.dueDate).toBeInstanceOf(Date);
          expect(loadedItem.createdAt).toBeInstanceOf(Date);
          expect(loadedItem.dueDate.getTime()).toBe(item.dueDate.getTime());
          expect(loadedItem.createdAt.getTime()).toBe(item.createdAt.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 2: Input validation rejects invalid data
  // **Validates: Requirements 1.2, 1.3, 1.4**
  it('Property 2: Input validation rejects invalid data - any whitespace-only string or invalid date should be rejected', () => {
    fc.assert(
      fc.property(
        // Generate invalid inputs
        fc.oneof(
          // Case 1: Whitespace-only title with valid subject and date
          fc.record({
            title: fc.stringMatching(/^\s+$/), // Only whitespace
            subject: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          // Case 2: Valid title with whitespace-only subject and valid date
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            subject: fc.stringMatching(/^\s+$/), // Only whitespace
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          // Case 3: Empty string title
          fc.record({
            title: fc.constant(''),
            subject: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          // Case 4: Empty string subject
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            subject: fc.constant(''),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          // Case 5: Invalid date (NaN)
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            subject: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.constant(new Date('invalid'))
          })
        ),
        (invalidInput: { title: string; subject: string; dueDate: Date }) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);
          
          // Get initial count of homework items
          const initialCount = manager.getAllHomework().length;

          // Attempt to add homework with invalid input - should throw error
          expect(() => {
            manager.addHomework(invalidInput.title, invalidInput.subject, invalidInput.dueDate);
          }).toThrow();

          // Verify the homework list remains unchanged
          const finalCount = manager.getAllHomework().length;
          expect(finalCount).toBe(initialCount);

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 3: Unique ID assignment
  // **Validates: Requirements 1.5**
  it('Property 3: Unique ID assignment - any set of homework items created should have unique IDs with no duplicates', () => {
    fc.assert(
      fc.property(
        // Generate an array of homework item data (title, subject, dueDate)
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            subject: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          { minLength: 1, maxLength: 50 } // Test with 1 to 50 items
        ),
        (itemsData: Array<{ title: string; subject: string; dueDate: Date }>) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Create all homework items
          const createdItems = itemsData.map(data => 
            manager.addHomework(data.title, data.subject, data.dueDate)
          );

          // Extract all IDs
          const ids = createdItems.map(item => item.id);

          // Verify all IDs are unique (no duplicates)
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);

          // Also verify that each ID is a non-empty string
          ids.forEach(id => {
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
          });

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 10: Add persistence round-trip
  // **Validates: Requirements 4.1**
  it('Property 10: Add persistence round-trip - any valid homework item should be retrievable from storage after adding', () => {
    fc.assert(
      fc.property(
        // Generate valid homework item data
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        (title: string, subject: string, dueDate: Date) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Add homework item
          const addedItem = manager.addHomework(title, subject, dueDate);

          // Create a new manager instance to simulate loading from storage
          const newManager = new HomeworkManager(storage);

          // Retrieve all items from storage
          const allItems = newManager.getAllHomework();

          // Verify the added item is in the retrieved list
          const retrievedItem = allItems.find(item => item.id === addedItem.id);
          expect(retrievedItem).toBeDefined();

          // Verify all properties are intact
          expect(retrievedItem!.id).toBe(addedItem.id);
          expect(retrievedItem!.title).toBe(addedItem.title);
          expect(retrievedItem!.subject).toBe(addedItem.subject);
          expect(retrievedItem!.dueDate.getTime()).toBe(addedItem.dueDate.getTime());
          expect(retrievedItem!.completed).toBe(addedItem.completed);
          expect(retrievedItem!.createdAt.getTime()).toBe(addedItem.createdAt.getTime());

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 4: Toggle completion flips state
  // **Validates: Requirements 2.1, 2.2**
  it('Property 4: Toggle completion flips state - any homework item should have its completion status flipped when toggled', () => {
    fc.assert(
      fc.property(
        // Generate valid homework item data
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        // Generate initial completion status
        fc.boolean(),
        (title: string, subject: string, dueDate: Date, initialCompleted: boolean) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Add homework item
          const item = manager.addHomework(title, subject, dueDate);

          // Set initial completion status
          if (item.completed !== initialCompleted) {
            manager.toggleCompletion(item.id);
          }

          // Verify initial state
          const itemBeforeToggle = manager.getHomeworkById(item.id);
          expect(itemBeforeToggle).toBeDefined();
          expect(itemBeforeToggle!.completed).toBe(initialCompleted);

          // Toggle completion
          manager.toggleCompletion(item.id);

          // Verify state was flipped
          const itemAfterToggle = manager.getHomeworkById(item.id);
          expect(itemAfterToggle).toBeDefined();
          expect(itemAfterToggle!.completed).toBe(!initialCompleted);

          // Toggle again
          manager.toggleCompletion(item.id);

          // Verify state was flipped back to original
          const itemAfterSecondToggle = manager.getHomeworkById(item.id);
          expect(itemAfterSecondToggle).toBeDefined();
          expect(itemAfterSecondToggle!.completed).toBe(initialCompleted);

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 5: Completion persistence round-trip
  // **Validates: Requirements 2.3**
  it('Property 5: Completion persistence round-trip - any homework item should persist completion status changes to storage', () => {
    fc.assert(
      fc.property(
        // Generate valid homework item data
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        (title: string, subject: string, dueDate: Date) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Add homework item
          const item = manager.addHomework(title, subject, dueDate);

          // Verify initial completion status is false
          expect(item.completed).toBe(false);

          // Toggle completion to true
          manager.toggleCompletion(item.id);

          // Create a new manager instance to simulate loading from storage
          const newManager = new HomeworkManager(storage);

          // Retrieve the item from storage
          const retrievedItem = newManager.getHomeworkById(item.id);
          expect(retrievedItem).toBeDefined();

          // Verify completion status was persisted (should be true)
          expect(retrievedItem!.completed).toBe(true);

          // Toggle completion back to false
          newManager.toggleCompletion(item.id);

          // Create another manager instance to verify persistence again
          const thirdManager = new HomeworkManager(storage);

          // Retrieve the item again
          const retrievedItemAgain = thirdManager.getHomeworkById(item.id);
          expect(retrievedItemAgain).toBeDefined();

          // Verify completion status was persisted (should be false)
          expect(retrievedItemAgain!.completed).toBe(false);

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 11: Modification persistence round-trip
  // **Validates: Requirements 4.2**
  it('Property 11: Modification persistence round-trip - any homework item modification should persist to storage', () => {
    fc.assert(
      fc.property(
        // Generate valid homework item data
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        // Generate a sequence of toggle operations (0 to 5 toggles)
        fc.array(fc.constant('toggle'), { minLength: 0, maxLength: 5 }),
        (title: string, subject: string, dueDate: Date, toggles: string[]) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Add homework item
          const item = manager.addHomework(title, subject, dueDate);
          const itemId = item.id;

          // Track expected completion status
          let expectedCompleted = false;

          // Apply all toggle operations
          toggles.forEach(() => {
            manager.toggleCompletion(itemId);
            expectedCompleted = !expectedCompleted;
          });

          // Create a new manager instance to simulate loading from storage
          const newManager = new HomeworkManager(storage);

          // Retrieve the item from storage
          const retrievedItem = newManager.getHomeworkById(itemId);
          expect(retrievedItem).toBeDefined();

          // Verify the modification was persisted
          expect(retrievedItem!.completed).toBe(expectedCompleted);

          // Verify all other properties remain unchanged
          expect(retrievedItem!.id).toBe(item.id);
          expect(retrievedItem!.title).toBe(item.title);
          expect(retrievedItem!.subject).toBe(item.subject);
          expect(retrievedItem!.dueDate.getTime()).toBe(item.dueDate.getTime());
          expect(retrievedItem!.createdAt.getTime()).toBe(item.createdAt.getTime());

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 13: Corrupted data handling
  // **Validates: Requirements 4.5**
  it('Property 13: Corrupted data handling - any invalid or corrupted JSON should return empty array without crashing', () => {
    fc.assert(
      fc.property(
        // Generate various types of corrupted data
        fc.oneof(
          // Invalid JSON strings
          fc.string().filter(s => {
            try {
              JSON.parse(s);
              return false; // Skip valid JSON
            } catch {
              return true; // Keep invalid JSON
            }
          }),
          // Valid JSON but not an array
          fc.oneof(
            fc.integer(),
            fc.string(),
            fc.boolean(),
            fc.constant(null),
            fc.object()
          ).map(v => JSON.stringify(v)),
          // Array with invalid items (missing required fields)
          fc.array(
            fc.oneof(
              fc.record({
                id: fc.string(),
                // Missing other required fields
              }),
              fc.record({
                id: fc.string(),
                title: fc.string(),
                // Missing subject, dueDate, etc.
              }),
              fc.record({
                id: fc.integer(), // Wrong type for id
                title: fc.string(),
                subject: fc.string(),
                dueDate: fc.string(),
                completed: fc.boolean(),
                createdAt: fc.string()
              }),
              fc.record({
                id: fc.string(),
                title: fc.integer(), // Wrong type for title
                subject: fc.string(),
                dueDate: fc.string(),
                completed: fc.boolean(),
                createdAt: fc.string()
              }),
              fc.record({
                id: fc.string(),
                title: fc.string(),
                subject: fc.string(),
                dueDate: fc.integer(), // Wrong type for dueDate
                completed: fc.boolean(),
                createdAt: fc.string()
              })
            )
          ).map(arr => JSON.stringify(arr))
        ),
        (corruptedData: string) => {
          // Set corrupted data in localStorage
          localStorage.setItem('homework-tracker-data', corruptedData);

          // Attempt to load - should not crash
          const loaded = storage.load();

          // Should return empty array for any corrupted data
          expect(Array.isArray(loaded)).toBe(true);
          expect(loaded).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 8: Due date sort order invariant
  // **Validates: Requirements 3.2**
  it('Property 8: Due date sort order invariant - any list of homework items should be sorted by due date in ascending order', () => {
    fc.assert(
      fc.property(
        // Generate an array of homework items with random due dates (2 to 20 items)
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            subject: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          { minLength: 2, maxLength: 20 }
        ),
        (itemsData: Array<{ title: string; subject: string; dueDate: Date }>) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Create all homework items
          itemsData.forEach(data => 
            manager.addHomework(data.title, data.subject, data.dueDate)
          );

          // Get all homework items (should be sorted by due date)
          const sortedItems = manager.getAllHomework();

          // Verify the list is sorted by due date in ascending order
          for (let i = 0; i < sortedItems.length - 1; i++) {
            const currentDueDate = sortedItems[i].dueDate.getTime();
            const nextDueDate = sortedItems[i + 1].dueDate.getTime();
            
            // Current item's due date should be <= next item's due date
            expect(currentDueDate).toBeLessThanOrEqual(nextDueDate);
          }

          // Verify all items are present (no items lost during sorting)
          expect(sortedItems.length).toBe(itemsData.length);

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 7: Storage load retrieves all items
  // **Validates: Requirements 3.1, 4.4**
  it('Property 7: Storage load retrieves all items - any set of homework items stored in LocalStorage should be retrieved when loading', () => {
    fc.assert(
      fc.property(
        // Generate an array of homework items (1 to 20 items)
        fc.array(
          fc.record({
            id: fc.uuid(),
            title: fc.string({ minLength: 1, maxLength: 200 }),
            subject: fc.string({ minLength: 1, maxLength: 100 }),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
            completed: fc.boolean(),
            createdAt: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (items: HomeworkItem[]) => {
          // Save items directly to storage
          storage.save(items);

          // Create a new manager instance (should load from storage)
          const manager = new HomeworkManager(storage);

          // Get all loaded items
          const loadedItems = manager.getAllHomework();

          // Verify all items were loaded (count matches)
          expect(loadedItems.length).toBe(items.length);

          // Verify each item was loaded correctly
          items.forEach(originalItem => {
            const loadedItem = loadedItems.find(item => item.id === originalItem.id);
            
            // Item should exist
            expect(loadedItem).toBeDefined();
            
            // All properties should match
            expect(loadedItem!.id).toBe(originalItem.id);
            expect(loadedItem!.title).toBe(originalItem.title);
            expect(loadedItem!.subject).toBe(originalItem.subject);
            expect(loadedItem!.completed).toBe(originalItem.completed);
            expect(loadedItem!.dueDate.getTime()).toBe(originalItem.dueDate.getTime());
            expect(loadedItem!.createdAt.getTime()).toBe(originalItem.createdAt.getTime());
          });

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 12: Deletion removes item completely
  // **Validates: Requirements 4.3, 5.1, 5.2, 5.4**
  it('Property 12: Deletion removes item completely - any homework item should not appear in list or storage after deletion', () => {
    fc.assert(
      fc.property(
        // Generate an array of homework items to create (1 to 10 items)
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            subject: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            dueDate: fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        // Generate an index to select which item to delete
        fc.nat(),
        (itemsData: Array<{ title: string; subject: string; dueDate: Date }>, deleteIndex: number) => {
          // Create a fresh manager for each test
          const manager = new HomeworkManager(storage);

          // Create all homework items
          const createdItems = itemsData.map(data => 
            manager.addHomework(data.title, data.subject, data.dueDate)
          );

          // Select which item to delete (use modulo to ensure valid index)
          const itemToDelete = createdItems[deleteIndex % createdItems.length];
          const itemIdToDelete = itemToDelete.id;

          // Get count before deletion
          const countBeforeDeletion = manager.getAllHomework().length;
          expect(countBeforeDeletion).toBe(createdItems.length);

          // Verify item exists before deletion
          const itemBeforeDeletion = manager.getHomeworkById(itemIdToDelete);
          expect(itemBeforeDeletion).toBeDefined();

          // Delete the item
          manager.deleteHomework(itemIdToDelete);

          // Verify item is not in the displayed list
          const allItemsAfterDeletion = manager.getAllHomework();
          expect(allItemsAfterDeletion.length).toBe(countBeforeDeletion - 1);
          
          const deletedItemInList = allItemsAfterDeletion.find(item => item.id === itemIdToDelete);
          expect(deletedItemInList).toBeUndefined();

          // Verify item cannot be retrieved by ID
          const deletedItemById = manager.getHomeworkById(itemIdToDelete);
          expect(deletedItemById).toBeUndefined();

          // Create a new manager instance to verify persistence (item should not exist in storage)
          const newManager = new HomeworkManager(storage);
          
          // Verify item is not in storage
          const allItemsFromStorage = newManager.getAllHomework();
          expect(allItemsFromStorage.length).toBe(countBeforeDeletion - 1);
          
          const deletedItemInStorage = allItemsFromStorage.find(item => item.id === itemIdToDelete);
          expect(deletedItemInStorage).toBeUndefined();

          // Verify the deleted item cannot be retrieved by ID from new manager
          const deletedItemByIdFromStorage = newManager.getHomeworkById(itemIdToDelete);
          expect(deletedItemByIdFromStorage).toBeUndefined();

          // Verify all other items still exist
          const remainingItemIds = createdItems
            .filter(item => item.id !== itemIdToDelete)
            .map(item => item.id);
          
          remainingItemIds.forEach(id => {
            const item = newManager.getHomeworkById(id);
            expect(item).toBeDefined();
          });

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
