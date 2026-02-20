import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeworkManager } from './HomeworkManager';
import { StorageService } from './StorageService';
import { UIController } from './UIController';

/**
 * Integration tests for complete workflows
 * Tests the interaction between HomeworkManager, StorageService, and UIController
 * **Validates: Requirements 1.1, 2.1, 3.1, 5.1**
 */
describe('Integration Tests - Complete Workflows', () => {
  let storage: StorageService;
  let manager: HomeworkManager;
  let controller: UIController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Set up DOM structure
    document.body.innerHTML = `
      <form id="add-homework-form">
        <input id="title" type="text" />
        <input id="subject" type="text" />
        <input id="due-date" type="date" />
        <button type="submit">Add</button>
      </form>
      <div id="error-message" class="hidden"></div>
      <div id="homework-list"></div>
    `;
    
    // Initialize components
    storage = new StorageService();
    manager = new HomeworkManager(storage);
    controller = new UIController(manager);
  });

  /**
   * Test: Add → Display → Toggle → Delete flow
   * **Validates: Requirements 1.1, 2.1, 3.1, 5.1**
   */
  it('should complete full workflow: add → display → toggle → delete', () => {
    // Step 1: Add homework via UI
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;

    titleInput.value = 'Math homework';
    subjectInput.value = 'Mathematics';
    dueDateInput.value = '2024-12-31';

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    // Verify homework was added to manager
    let items = manager.getAllHomework();
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Math homework');
    expect(items[0].subject).toBe('Mathematics');
    expect(items[0].completed).toBe(false);

    // Step 2: Display - render the list
    controller.renderHomeworkList();

    // Verify item is displayed in DOM
    const homeworkList = document.getElementById('homework-list') as HTMLElement;
    expect(homeworkList.innerHTML).toContain('Math homework');
    expect(homeworkList.innerHTML).toContain('Mathematics');
    
    const itemDiv = homeworkList.querySelector('.homework-item') as HTMLElement;
    expect(itemDiv).toBeDefined();
    expect(itemDiv.classList.contains('completed')).toBe(false);

    // Step 3: Toggle completion
    const itemId = items[0].id;
    controller.handleToggleCompletion(itemId);

    // Verify completion status changed
    items = manager.getAllHomework();
    expect(items[0].completed).toBe(true);

    // Re-render and verify visual change
    controller.renderHomeworkList();
    const completedItemDiv = homeworkList.querySelector('.homework-item') as HTMLElement;
    expect(completedItemDiv.classList.contains('completed')).toBe(true);
    
    const toggleBtn = completedItemDiv.querySelector('.btn-toggle') as HTMLButtonElement;
    expect(toggleBtn.textContent?.trim()).toBe('Undo');

    // Step 4: Delete homework
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(true); // User confirms deletion

    controller.handleDeleteHomework(itemId);

    // Verify item was deleted
    items = manager.getAllHomework();
    expect(items.length).toBe(0);

    // Re-render and verify empty state
    controller.renderHomeworkList();
    expect(homeworkList.innerHTML).toContain('No homework yet');

    // Clean up
    confirmSpy.mockRestore();
  });

  /**
   * Test: Persistence across page reloads
   * **Validates: Requirements 4.1, 4.2, 4.3**
   */
  it('should persist data across page reloads (simulated)', () => {
    // Step 1: Add multiple homework items
    manager.addHomework('Math homework', 'Mathematics', new Date('2024-12-31'));
    manager.addHomework('Science project', 'Science', new Date('2024-12-25'));
    manager.addHomework('English essay', 'English', new Date('2024-12-20'));

    // Verify items were added
    let items = manager.getAllHomework();
    expect(items.length).toBe(3);

    // Step 2: Toggle completion on one item
    const secondItemId = items[1].id;
    manager.toggleCompletion(secondItemId);

    // Step 3: Simulate page reload by creating new instances
    const newStorage = new StorageService();
    const newManager = new HomeworkManager(newStorage);

    // Verify all items were loaded from storage
    const loadedItems = newManager.getAllHomework();
    expect(loadedItems.length).toBe(3);

    // Verify items are sorted by due date (ascending)
    expect(loadedItems[0].title).toBe('English essay'); // Dec 20
    expect(loadedItems[1].title).toBe('Science project'); // Dec 25
    expect(loadedItems[2].title).toBe('Math homework'); // Dec 31

    // Verify completion status was persisted
    const loadedSecondItem = loadedItems.find(item => item.id === secondItemId);
    expect(loadedSecondItem).toBeDefined();
    expect(loadedSecondItem!.completed).toBe(true);

    // Step 4: Delete an item
    const firstItemId = loadedItems[0].id;
    newManager.deleteHomework(firstItemId);

    // Step 5: Simulate another page reload
    const thirdStorage = new StorageService();
    const thirdManager = new HomeworkManager(thirdStorage);

    // Verify deletion was persisted
    const finalItems = thirdManager.getAllHomework();
    expect(finalItems.length).toBe(2);
    
    const deletedItem = finalItems.find(item => item.id === firstItemId);
    expect(deletedItem).toBeUndefined();

    // Verify remaining items are correct
    expect(finalItems[0].title).toBe('Science project');
    expect(finalItems[1].title).toBe('Math homework');
  });

  /**
   * Test: Multiple homework items interaction
   * **Validates: Requirements 1.1, 2.1, 3.2, 5.1**
   */
  it('should handle multiple homework items correctly', () => {
    // Step 1: Add multiple homework items with different due dates
    const item1 = manager.addHomework('Assignment 1', 'Math', new Date('2024-12-15'));
    const item2 = manager.addHomework('Assignment 2', 'Science', new Date('2024-12-10'));
    const item3 = manager.addHomework('Assignment 3', 'English', new Date('2024-12-20'));
    const item4 = manager.addHomework('Assignment 4', 'History', new Date('2024-12-05'));

    // Step 2: Verify items are sorted by due date
    let items = manager.getAllHomework();
    expect(items.length).toBe(4);
    expect(items[0].title).toBe('Assignment 4'); // Dec 5
    expect(items[1].title).toBe('Assignment 2'); // Dec 10
    expect(items[2].title).toBe('Assignment 1'); // Dec 15
    expect(items[3].title).toBe('Assignment 3'); // Dec 20

    // Step 3: Toggle completion on multiple items
    manager.toggleCompletion(item1.id); // Assignment 1 -> completed
    manager.toggleCompletion(item3.id); // Assignment 3 -> completed

    // Verify completion status
    items = manager.getAllHomework();
    const completedItem1 = items.find(item => item.id === item1.id);
    const completedItem3 = items.find(item => item.id === item3.id);
    const incompleteItem2 = items.find(item => item.id === item2.id);
    const incompleteItem4 = items.find(item => item.id === item4.id);

    expect(completedItem1!.completed).toBe(true);
    expect(completedItem3!.completed).toBe(true);
    expect(incompleteItem2!.completed).toBe(false);
    expect(incompleteItem4!.completed).toBe(false);

    // Step 4: Render the list and verify visual distinction
    controller.renderHomeworkList();
    const homeworkList = document.getElementById('homework-list') as HTMLElement;
    const itemDivs = homeworkList.querySelectorAll('.homework-item');

    expect(itemDivs.length).toBe(4);

    // Verify completed items have the 'completed' class
    itemDivs.forEach(itemDiv => {
      const toggleBtn = itemDiv.querySelector('.btn-toggle') as HTMLButtonElement;
      const itemId = toggleBtn.getAttribute('data-id');

      if (itemId === item1.id || itemId === item3.id) {
        expect(itemDiv.classList.contains('completed')).toBe(true);
        expect(toggleBtn.textContent?.trim()).toBe('Undo');
      } else {
        expect(itemDiv.classList.contains('completed')).toBe(false);
        expect(toggleBtn.textContent?.trim()).toBe('Done');
      }
    });

    // Step 5: Delete one completed and one incomplete item
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(true);

    controller.handleDeleteHomework(item1.id); // Delete completed item
    controller.handleDeleteHomework(item4.id); // Delete incomplete item

    // Verify deletions
    items = manager.getAllHomework();
    expect(items.length).toBe(2);
    expect(items[0].title).toBe('Assignment 2');
    expect(items[1].title).toBe('Assignment 3');

    // Step 6: Verify persistence after deletions
    const newStorage = new StorageService();
    const newManager = new HomeworkManager(newStorage);
    const persistedItems = newManager.getAllHomework();

    expect(persistedItems.length).toBe(2);
    expect(persistedItems[0].title).toBe('Assignment 2');
    expect(persistedItems[1].title).toBe('Assignment 3');

    // Clean up
    confirmSpy.mockRestore();
  });

  /**
   * Test: UI form validation and error handling
   * **Validates: Requirements 1.2, 1.3, 1.4**
   */
  it('should handle form validation errors in complete workflow', () => {
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;
    const errorMessage = document.getElementById('error-message') as HTMLElement;

    // Test 1: Empty title
    titleInput.value = '';
    subjectInput.value = 'Math';
    dueDateInput.value = '2024-12-31';

    let submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    expect(errorMessage.classList.contains('hidden')).toBe(false);
    expect(errorMessage.textContent).toContain('Title cannot be empty');
    expect(manager.getAllHomework().length).toBe(0);

    // Test 2: Empty subject
    titleInput.value = 'Math homework';
    subjectInput.value = '';
    dueDateInput.value = '2024-12-31';

    submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    expect(errorMessage.classList.contains('hidden')).toBe(false);
    expect(errorMessage.textContent).toContain('Subject cannot be empty');
    expect(manager.getAllHomework().length).toBe(0);

    // Test 3: Valid input clears error and adds item
    titleInput.value = 'Math homework';
    subjectInput.value = 'Mathematics';
    dueDateInput.value = '2024-12-31';

    submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    expect(errorMessage.classList.contains('hidden')).toBe(true);
    expect(manager.getAllHomework().length).toBe(1);
  });

  /**
   * Test: Empty state display
   * **Validates: Requirements 3.4**
   */
  it('should display empty state when no homework exists', () => {
    // Initially, no homework items
    controller.renderHomeworkList();

    const homeworkList = document.getElementById('homework-list') as HTMLElement;
    expect(homeworkList.innerHTML).toContain('No homework yet');
    expect(homeworkList.querySelector('.empty-state')).toBeDefined();

    // Add an item
    manager.addHomework('Test homework', 'Math', new Date('2024-12-31'));
    controller.renderHomeworkList();

    // Empty state should be gone
    expect(homeworkList.innerHTML).not.toContain('No homework yet');
    expect(homeworkList.querySelector('.homework-item')).toBeDefined();

    // Delete the item
    const items = manager.getAllHomework();
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(true);
    
    controller.handleDeleteHomework(items[0].id);

    // Empty state should be back
    expect(homeworkList.innerHTML).toContain('No homework yet');
    expect(homeworkList.querySelector('.empty-state')).toBeDefined();

    confirmSpy.mockRestore();
  });

  /**
   * Test: Toggle completion multiple times
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  it('should handle multiple toggle operations correctly', () => {
    // Add a homework item
    const item = manager.addHomework('Test homework', 'Math', new Date('2024-12-31'));

    // Initial state: incomplete
    expect(item.completed).toBe(false);

    // Toggle 1: incomplete -> complete
    manager.toggleCompletion(item.id);
    let updatedItem = manager.getHomeworkById(item.id);
    expect(updatedItem!.completed).toBe(true);

    // Toggle 2: complete -> incomplete
    manager.toggleCompletion(item.id);
    updatedItem = manager.getHomeworkById(item.id);
    expect(updatedItem!.completed).toBe(false);

    // Toggle 3: incomplete -> complete
    manager.toggleCompletion(item.id);
    updatedItem = manager.getHomeworkById(item.id);
    expect(updatedItem!.completed).toBe(true);

    // Verify persistence after multiple toggles
    const newStorage = new StorageService();
    const newManager = new HomeworkManager(newStorage);
    const persistedItem = newManager.getHomeworkById(item.id);

    expect(persistedItem).toBeDefined();
    expect(persistedItem!.completed).toBe(true);
  });

  /**
   * Test: Complete workflow with UI interactions
   * **Validates: Requirements 1.1, 2.1, 3.1, 5.1, 7.4**
   */
  it('should provide immediate visual feedback for all actions', () => {
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;
    const homeworkList = document.getElementById('homework-list') as HTMLElement;

    // Add homework
    titleInput.value = 'Test homework';
    subjectInput.value = 'Math';
    dueDateInput.value = '2024-12-31';

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    // Verify immediate visual feedback: form cleared
    expect(titleInput.value).toBe('');
    expect(subjectInput.value).toBe('');
    expect(dueDateInput.value).toBe('');

    // Verify immediate visual feedback: item displayed
    controller.renderHomeworkList();
    expect(homeworkList.querySelector('.homework-item')).toBeDefined();

    // Toggle completion
    const items = manager.getAllHomework();
    controller.handleToggleCompletion(items[0].id);

    // Verify immediate visual feedback: completion status changed
    controller.renderHomeworkList();
    const itemDiv = homeworkList.querySelector('.homework-item') as HTMLElement;
    expect(itemDiv.classList.contains('completed')).toBe(true);

    // Delete item
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(true);
    controller.handleDeleteHomework(items[0].id);

    // Verify immediate visual feedback: item removed, empty state shown
    controller.renderHomeworkList();
    expect(homeworkList.innerHTML).toContain('No homework yet');

    confirmSpy.mockRestore();
  });
});
