// View Tasks page entry point
import './style.css';
import { StorageService } from './StorageService';
import { HomeworkManager } from './HomeworkManager';
import { UIController } from './UIController';

/**
 * Check if LocalStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Initialize the view tasks page
 */
function initViewTasksPage(): void {
  // Check LocalStorage availability
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage is not available. Data will not be saved.');
    const warning = document.createElement('div');
    warning.className = 'error-message show';
    warning.textContent = 'Warning: Local storage is not available. Data cannot be loaded.';
    document.querySelector('.container')?.prepend(warning);
  }

  // Initialize services
  const storage = new StorageService();
  const manager = new HomeworkManager(storage);
  const ui = new UIController(manager);

  // Current sort mode
  let currentSort: 'dueDate' | 'subject' = 'dueDate';

  // Function to render with current sort
  const renderWithSort = () => {
    const items = manager.getAllHomework();
    
    // Sort based on current mode
    const sortedItems = [...items].sort((a, b) => {
      if (currentSort === 'subject') {
        // Case-insensitive subject sort
        return a.subject.toLowerCase().localeCompare(b.subject.toLowerCase());
      } else {
        // Due date sort (default)
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
    });

    // Render the sorted items
    renderSortedList(sortedItems);
  };

  // Custom render function for sorted items
  const renderSortedList = (items: any[]) => {
    const homeworkList = document.getElementById('homework-list');
    if (!homeworkList) return;

    if (items.length === 0) {
      homeworkList.innerHTML = '<div class="empty-state">No homework yet! Add some tasks to get started.</div>';
      return;
    }

    const itemsHTML = items.map(item => {
      const completedClass = item.completed ? 'completed' : '';
      const toggleText = item.completed ? 'Undo' : 'Done';
      const formattedDate = item.dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const escapeHtml = (text: string): string => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      return `
        <div class="homework-item ${completedClass}">
          <div class="homework-info">
            <div class="homework-title">${escapeHtml(item.title)}</div>
            <div class="homework-meta">
              <span class="homework-subject">${escapeHtml(item.subject)}</span>
              <span class="homework-due">Due: ${formattedDate}</span>
            </div>
          </div>
          <div class="homework-actions">
            <button class="btn-toggle" data-id="${item.id}">${toggleText}</button>
            <button class="btn-delete" data-id="${item.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    homeworkList.innerHTML = itemsHTML;
  };

  // Initial render with default sort
  renderWithSort();

  // Set up sort filter listeners
  const sortRadios = document.querySelectorAll('input[name="sort"]');
  sortRadios.forEach(radio => {
    radio.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      currentSort = target.value as 'dueDate' | 'subject';
      renderWithSort();
    });
  });

  // Set up event delegation for toggle and delete buttons
  const homeworkList = document.getElementById('homework-list');
  
  if (homeworkList) {
    homeworkList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Handle toggle button clicks
      if (target.classList.contains('btn-toggle')) {
        const id = target.getAttribute('data-id');
        if (id) {
          ui.handleToggleCompletion(id);
          // Re-render with current sort after toggle
          renderWithSort();
        }
      }
      
      // Handle delete button clicks
      if (target.classList.contains('btn-delete')) {
        const id = target.getAttribute('data-id');
        if (id) {
          ui.handleDeleteHomework(id);
          // Re-render with current sort after delete
          renderWithSort();
        }
      }
    });
  }

  // Handle storage notice dismissal
  initStorageNotice();
}

/**
 * Initialize storage notice banner
 */
function initStorageNotice(): void {
  const storageNotice = document.getElementById('storage-notice');
  const dismissButton = document.getElementById('dismiss-notice');

  // Check if user has already dismissed the notice
  const noticeDismissed = localStorage.getItem('storage-notice-dismissed');

  if (noticeDismissed === 'true') {
    storageNotice?.classList.add('hidden');
  }

  // Handle dismiss button click
  dismissButton?.addEventListener('click', () => {
    storageNotice?.classList.add('hidden');
    localStorage.setItem('storage-notice-dismissed', 'true');
  });
}

// Initialize page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initViewTasksPage);
} else {
  initViewTasksPage();
}
