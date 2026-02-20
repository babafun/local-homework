// Main entry point for the Homework Tracker application
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
 * Initialize the application (Add Task page)
 */
function initApp(): void {
  // Check LocalStorage availability
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage is not available. Data will not be saved.');
    const warning = document.createElement('div');
    warning.className = 'error-message show';
    warning.textContent = 'Warning: Local storage is not available. Data will not be saved.';
    document.querySelector('.container')?.prepend(warning);
  }

  // Initialize services
  const storage = new StorageService();
  const manager = new HomeworkManager(storage);
  const ui = new UIController(manager);

  // Initialize form only (no list rendering on add page)
  const form = document.getElementById('add-homework-form') as HTMLFormElement;
  if (form) {
    form.addEventListener('submit', (event) => {
      ui.handleAddHomework(event);
      
      // Show success message and redirect after a short delay
      const errorMessage = document.getElementById('error-message');
      if (errorMessage && !errorMessage.classList.contains('show')) {
        // Success - show message and redirect
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Homework added successfully! Redirecting to view tasks...';
        successMessage.style.cssText = 'background-color: var(--success); color: var(--bg); padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-weight: 500;';
        
        const formSection = document.querySelector('.add-homework-section');
        const existingSuccess = formSection?.querySelector('.success-message');
        if (existingSuccess) {
          existingSuccess.remove();
        }
        
        errorMessage?.parentElement?.insertBefore(successMessage, errorMessage);
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          window.location.href = 'view-tasks.html';
        }, 1500);
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
