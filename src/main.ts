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
 * Initialize the application
 */
function initApp(): void {
  // Check LocalStorage availability
  if (!isLocalStorageAvailable()) {
    console.warn('LocalStorage is not available. Data will not be saved.');
    const warning = document.createElement('div');
    warning.className = 'error-message';
    warning.textContent = 'Warning: Local storage is not available. Data will not be saved.';
    document.querySelector('.container')?.prepend(warning);
  }

  // Initialize services
  const storage = new StorageService();
  const manager = new HomeworkManager(storage);
  const ui = new UIController(manager);

  // Initialize UI
  ui.init();
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
