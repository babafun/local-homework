import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { UIController } from './UIController';
import { HomeworkManager } from './HomeworkManager';
import { StorageService } from './StorageService';

describe('UIController - Property-Based Tests', () => {
  let storage: StorageService;
  let manager: HomeworkManager;
  let controller: UIController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new StorageService();
    manager = new HomeworkManager(storage);

    // Set up minimal DOM structure for testing
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

    controller = new UIController(manager);
  });

  // Feature: homework-tracker, Property 6: Visual distinction for completed items
  // **Validates: Requirements 2.4**
  it('Property 6: Visual distinction for completed items - any homework item should have different visual indicators based on completion status', () => {
    fc.assert(
      fc.property(
        // Generate valid homework item data
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        fc.boolean(),
        (title: string, subject: string, dueDate: Date, completed: boolean) => {
          // Clear and reset for each iteration
          localStorage.clear();
          storage = new StorageService();
          manager = new HomeworkManager(storage);
          
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
          
          controller = new UIController(manager);

          // Add homework item
          const item = manager.addHomework(title, subject, dueDate);

          // Set completion status
          if (completed) {
            manager.toggleCompletion(item.id);
          }

          // Render the homework list
          controller.renderHomeworkList();

          // Get the rendered HTML
          const homeworkList = document.getElementById('homework-list') as HTMLElement;
          const itemDiv = homeworkList.querySelector('.homework-item') as HTMLElement;

          // Verify the item exists
          expect(itemDiv).toBeDefined();

          // Property: Visual distinction must exist based on completion status
          if (completed) {
            // Completed items MUST have the 'completed' CSS class
            expect(itemDiv.classList.contains('completed')).toBe(true);
            
            // Completed items MUST show 'Undo' button text
            const toggleBtn = itemDiv.querySelector('.btn-toggle') as HTMLButtonElement;
            expect(toggleBtn.textContent?.trim()).toBe('Undo');
          } else {
            // Incomplete items MUST NOT have the 'completed' CSS class
            expect(itemDiv.classList.contains('completed')).toBe(false);
            
            // Incomplete items MUST show 'Done' button text
            const toggleBtn = itemDiv.querySelector('.btn-toggle') as HTMLButtonElement;
            expect(toggleBtn.textContent?.trim()).toBe('Done');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: homework-tracker, Property 9: Rendered items contain required fields
  // **Validates: Requirements 3.3**
  it('Property 9: Rendered items contain required fields - any homework item should have title, subject, due date, and completion status in rendered output', () => {
    fc.assert(
      fc.property(
        // Generate valid homework item data
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        fc.date({ min: new Date('2000-01-01'), max: new Date('2100-12-31') }),
        fc.boolean(),
        (title: string, subject: string, dueDate: Date, shouldComplete: boolean) => {
          // Add homework item
          const item = manager.addHomework(title, subject, dueDate);

          // Toggle completion if needed
          if (shouldComplete) {
            manager.toggleCompletion(item.id);
          }

          // Re-create controller with fresh DOM for each iteration
          storage = new StorageService();
          manager = new HomeworkManager(storage);
          
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
          
          controller = new UIController(manager);

          // Add homework item
          const addedItem = manager.addHomework(title, subject, dueDate);

          // Toggle completion if needed
          if (shouldComplete) {
            manager.toggleCompletion(addedItem.id);
          }

          // Render the homework list
          controller.renderHomeworkList();

          // Get the rendered HTML
          const homeworkList = document.getElementById('homework-list') as HTMLElement;
          const renderedHTML = homeworkList.innerHTML;

          // Helper function to escape HTML (same as UIController)
          const escapeHtml = (text: string): string => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          };

          // Verify title is present in the rendered output (HTML-escaped)
          expect(renderedHTML).toContain(escapeHtml(title.trim()));

          // Verify subject is present in the rendered output (HTML-escaped)
          expect(renderedHTML).toContain(escapeHtml(subject.trim()));

          // Verify due date is present (formatted as locale date string)
          const formattedDate = dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          expect(renderedHTML).toContain(formattedDate);

          // Verify completion status is reflected in the rendered output
          // Check for the 'completed' CSS class when item is completed
          const itemDiv = homeworkList.querySelector(`[data-id="${addedItem.id}"]`)?.closest('.homework-item');
          expect(itemDiv).toBeDefined();
          
          if (shouldComplete) {
            expect(itemDiv?.classList.contains('completed')).toBe(true);
          } else {
            expect(itemDiv?.classList.contains('completed')).toBe(false);
          }

          // Verify the toggle button text reflects completion status
          const toggleBtn = homeworkList.querySelector(`.btn-toggle[data-id="${addedItem.id}"]`) as HTMLButtonElement;
          expect(toggleBtn).toBeDefined();
          
          if (shouldComplete) {
            expect(toggleBtn?.textContent?.trim()).toBe('Undo');
          } else {
            expect(toggleBtn?.textContent?.trim()).toBe('Done');
          }

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('UIController - Unit Tests for UI Interactions', () => {
  let storage: StorageService;
  let manager: HomeworkManager;
  let controller: UIController;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new StorageService();
    manager = new HomeworkManager(storage);

    // Set up minimal DOM structure for testing
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

    controller = new UIController(manager);
  });

  // **Validates: Requirements 1.1**
  it('should add homework when form is submitted with valid data', () => {
    // Set up form inputs with valid data
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;

    titleInput.value = 'Math homework';
    subjectInput.value = 'Mathematics';
    dueDateInput.value = '2024-12-31';

    // Submit the form
    const form = document.getElementById('add-homework-form') as HTMLFormElement;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    // Verify homework was added
    const items = manager.getAllHomework();
    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Math homework');
    expect(items[0].subject).toBe('Mathematics');
    expect(items[0].dueDate.toISOString().split('T')[0]).toBe('2024-12-31');

    // Verify form was cleared
    expect(titleInput.value).toBe('');
    expect(subjectInput.value).toBe('');
    expect(dueDateInput.value).toBe('');

    // Verify error message is not shown
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    expect(errorMessage.classList.contains('hidden')).toBe(true);
  });

  // **Validates: Requirements 1.2**
  it('should show error when form is submitted with invalid data (empty title)', () => {
    // Set up form inputs with invalid data (empty title)
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;

    titleInput.value = '';
    subjectInput.value = 'Mathematics';
    dueDateInput.value = '2024-12-31';

    // Submit the form
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    // Verify homework was NOT added
    const items = manager.getAllHomework();
    expect(items.length).toBe(0);

    // Verify error message is shown
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    expect(errorMessage.classList.contains('hidden')).toBe(false);
    expect(errorMessage.textContent).toContain('Title cannot be empty');
  });

  // **Validates: Requirements 1.2**
  it('should show error when form is submitted with invalid data (whitespace-only title)', () => {
    // Set up form inputs with invalid data (whitespace-only title)
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;

    titleInput.value = '   ';
    subjectInput.value = 'Mathematics';
    dueDateInput.value = '2024-12-31';

    // Submit the form
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    // Verify homework was NOT added
    const items = manager.getAllHomework();
    expect(items.length).toBe(0);

    // Verify error message is shown
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    expect(errorMessage.classList.contains('hidden')).toBe(false);
    expect(errorMessage.textContent).toContain('Title cannot be empty');
  });

  // **Validates: Requirements 1.3**
  it('should show error when form is submitted with invalid data (empty subject)', () => {
    // Set up form inputs with invalid data (empty subject)
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const subjectInput = document.getElementById('subject') as HTMLInputElement;
    const dueDateInput = document.getElementById('due-date') as HTMLInputElement;

    titleInput.value = 'Math homework';
    subjectInput.value = '';
    dueDateInput.value = '2024-12-31';

    // Submit the form
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    controller.handleAddHomework(submitEvent);

    // Verify homework was NOT added
    const items = manager.getAllHomework();
    expect(items.length).toBe(0);

    // Verify error message is shown
    const errorMessage = document.getElementById('error-message') as HTMLElement;
    expect(errorMessage.classList.contains('hidden')).toBe(false);
    expect(errorMessage.textContent).toContain('Subject cannot be empty');
  });

  // **Validates: Requirements 2.1**
  it('should update completion status when toggle button is clicked', () => {
    // Add a homework item
    const item = manager.addHomework('Math homework', 'Mathematics', new Date('2024-12-31'));
    expect(item.completed).toBe(false);

    // Render the list
    controller.renderHomeworkList();

    // Find and click the toggle button
    const toggleBtn = document.querySelector('.btn-toggle') as HTMLButtonElement;
    expect(toggleBtn).toBeDefined();
    expect(toggleBtn.textContent?.trim()).toBe('Done');

    // Click the toggle button
    controller.handleToggleCompletion(item.id);

    // Verify completion status was updated
    const updatedItem = manager.getHomeworkById(item.id);
    expect(updatedItem?.completed).toBe(true);

    // Re-render and verify button text changed
    controller.renderHomeworkList();
    const updatedToggleBtn = document.querySelector('.btn-toggle') as HTMLButtonElement;
    expect(updatedToggleBtn.textContent?.trim()).toBe('Undo');
  });

  // **Validates: Requirements 5.3**
  it('should show confirmation dialog when delete button is clicked', () => {
    // Add a homework item
    const item = manager.addHomework('Math homework', 'Mathematics', new Date('2024-12-31'));

    // Mock the confirm dialog
    const confirmSpy = vi.spyOn(window, 'confirm');
    confirmSpy.mockReturnValue(false); // User cancels

    // Render the list
    controller.renderHomeworkList();

    // Click the delete button
    controller.handleDeleteHomework(item.id);

    // Verify confirm was called
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this homework?');

    // Verify item was NOT deleted (user cancelled)
    const items = manager.getAllHomework();
    expect(items.length).toBe(1);

    // Now test with user confirming
    confirmSpy.mockReturnValue(true); // User confirms
    controller.handleDeleteHomework(item.id);

    // Verify item was deleted
    const itemsAfterDelete = manager.getAllHomework();
    expect(itemsAfterDelete.length).toBe(0);

    // Clean up
    confirmSpy.mockRestore();
  });
});
