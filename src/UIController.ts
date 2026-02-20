import { HomeworkManager } from './HomeworkManager';

/**
 * Controls UI interactions and rendering
 */
export class UIController {
  private manager: HomeworkManager;
  private form: HTMLFormElement;
  private titleInput: HTMLInputElement;
  private subjectInput: HTMLInputElement;
  private dueDateInput: HTMLInputElement;
  private homeworkList: HTMLElement;
  private errorMessage: HTMLElement;

  constructor(manager: HomeworkManager) {
    this.manager = manager;
    
    // Cache DOM elements
    this.form = document.getElementById('add-homework-form') as HTMLFormElement;
    this.titleInput = document.getElementById('title') as HTMLInputElement;
    this.subjectInput = document.getElementById('subject') as HTMLInputElement;
    this.dueDateInput = document.getElementById('due-date') as HTMLInputElement;
    this.homeworkList = document.getElementById('homework-list') as HTMLElement;
    this.errorMessage = document.getElementById('error-message') as HTMLElement;
  }

  /**
   * Initialize UI and attach event listeners
   */
  init(): void {
    this.form.addEventListener('submit', (e) => this.handleAddHomework(e));
    this.renderHomeworkList();
  }

  /**
   * Render the homework list
   */
  renderHomeworkList(): void {
    const items = this.manager.getAllHomework();
    
    // Clear existing list
    this.homeworkList.innerHTML = '';
    
    // Show empty state if no items
    if (items.length === 0) {
      this.homeworkList.innerHTML = '<div class="empty-state">No homework yet! Add your first assignment above.</div>';
      return;
    }
    
    // Render each homework item
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = `homework-item${item.completed ? ' completed' : ''}`;
      
      const dueDate = item.dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      itemDiv.innerHTML = `
        <div class="homework-info">
          <h3>${this.escapeHtml(item.title)}</h3>
          <p><strong>Subject:</strong> ${this.escapeHtml(item.subject)}</p>
          <p><strong>Due:</strong> ${dueDate}</p>
        </div>
        <div class="homework-actions">
          <button class="btn-toggle" data-id="${item.id}">
            ${item.completed ? 'Undo' : 'Done'}
          </button>
          <button class="btn-delete" data-id="${item.id}">Delete</button>
        </div>
      `;
      
      // Attach event listeners
      const toggleBtn = itemDiv.querySelector('.btn-toggle') as HTMLButtonElement;
      const deleteBtn = itemDiv.querySelector('.btn-delete') as HTMLButtonElement;
      
      toggleBtn.addEventListener('click', () => this.handleToggleCompletion(item.id));
      deleteBtn.addEventListener('click', () => this.handleDeleteHomework(item.id));
      
      this.homeworkList.appendChild(itemDiv);
    });
  }

  /**
   * Handle add homework form submission
   */
  handleAddHomework(event: Event): void {
    event.preventDefault();
    
    this.clearError();
    
    try {
      const title = this.titleInput.value;
      const subject = this.subjectInput.value;
      const dueDate = new Date(this.dueDateInput.value);
      
      this.manager.addHomework(title, subject, dueDate);
      
      // Clear form
      this.form.reset();
      
      // Re-render list
      this.renderHomeworkList();
    } catch (error) {
      if (error instanceof Error) {
        this.showError(error.message);
      }
    }
  }

  /**
   * Handle toggle completion
   */
  handleToggleCompletion(id: string): void {
    this.manager.toggleCompletion(id);
    this.renderHomeworkList();
  }

  /**
   * Handle delete homework
   */
  handleDeleteHomework(id: string): void {
    if (confirm('Are you sure you want to delete this homework?')) {
      this.manager.deleteHomework(id);
      this.renderHomeworkList();
    }
  }

  /**
   * Show error message
   */
  showError(message: string): void {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage.textContent = '';
    this.errorMessage.classList.add('hidden');
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
