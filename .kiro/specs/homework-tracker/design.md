# Design Document: Homework Tracker

## Overview

The Homework Tracker is a client-side web application built with HTML, CSS, and TypeScript that provides a simple interface for students to manage their homework assignments. The application follows a straightforward architecture with three main layers: UI components, business logic, and data persistence. All data is stored locally in the browser's LocalStorage, eliminating the need for backend infrastructure or user authentication.

The application is designed to be intuitive for users aged 11-16, with a clean interface that prioritizes ease of use over feature complexity. The system handles homework items as immutable data structures, with all state changes resulting in new objects being created and persisted.

## Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────┐
│         UI Layer (HTML/CSS)         │
│  - Homework List Display            │
│  - Add Homework Form                │
│  - Action Buttons (Done, Delete)    │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│    Application Layer (TypeScript)   │
│  - HomeworkManager                  │
│  - Event Handlers                   │
│  - Validation Logic                 │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│   Data Layer (LocalStorage)         │
│  - StorageService                   │
│  - Serialization/Deserialization    │
└─────────────────────────────────────┘
```

The UI layer renders homework items and captures user interactions. The application layer contains the core business logic for managing homework items, including validation and state management. The data layer handles persistence to LocalStorage with proper error handling for corrupted data.

## Components and Interfaces

### HomeworkItem Interface

```typescript
interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
}
```

### HomeworkManager Class

The `HomeworkManager` class is the core business logic component that manages homework items.

```typescript
class HomeworkManager {
  private items: HomeworkItem[];
  private storage: StorageService;

  constructor(storage: StorageService);
  
  // Add a new homework item
  addHomework(title: string, subject: string, dueDate: Date): HomeworkItem;
  
  // Toggle completion status
  toggleCompletion(id: string): void;
  
  // Delete a homework item
  deleteHomework(id: string): void;
  
  // Get all homework items sorted by due date
  getAllHomework(): HomeworkItem[];
  
  // Get a specific homework item by ID
  getHomeworkById(id: string): HomeworkItem | undefined;
}
```

**Key behaviors:**
- `addHomework` validates inputs (non-empty title/subject, valid date), generates a unique ID, creates a new item with `completed: false`, persists to storage, and returns the created item
- `toggleCompletion` finds the item by ID, flips the `completed` boolean, persists the change
- `deleteHomework` removes the item from the internal list and updates storage
- `getAllHomework` returns items sorted by `dueDate` in ascending order

### StorageService Class

The `StorageService` class handles all interactions with LocalStorage.

```typescript
class StorageService {
  private readonly STORAGE_KEY = 'homework-tracker-data';
  
  // Save homework items to LocalStorage
  save(items: HomeworkItem[]): void;
  
  // Load homework items from LocalStorage
  load(): HomeworkItem[];
  
  // Clear all data from LocalStorage
  clear(): void;
}
```

**Key behaviors:**
- `save` serializes the array of HomeworkItem objects to JSON and stores in LocalStorage
- `load` retrieves data from LocalStorage, deserializes JSON, validates structure, handles corrupted data by returning empty array, converts date strings back to Date objects
- `clear` removes all homework data from LocalStorage

### UI Controller

The UI controller manages DOM manipulation and event handling.

```typescript
class UIController {
  private manager: HomeworkManager;
  
  constructor(manager: HomeworkManager);
  
  // Initialize the UI and attach event listeners
  init(): void;
  
  // Render the homework list
  renderHomeworkList(): void;
  
  // Handle add homework form submission
  handleAddHomework(event: Event): void;
  
  // Handle toggle completion
  handleToggleCompletion(id: string): void;
  
  // Handle delete homework
  handleDeleteHomework(id: string): void;
  
  // Show validation error message
  showError(message: string): void;
  
  // Clear error messages
  clearError(): void;
}
```

## Data Models

### HomeworkItem

The `HomeworkItem` represents a single homework assignment.

**Fields:**
- `id`: Unique identifier (UUID v4 format)
- `title`: Assignment title (non-empty string, max 200 characters)
- `subject`: Subject name (non-empty string, max 100 characters)
- `dueDate`: Due date (Date object, must be valid date)
- `completed`: Completion status (boolean)
- `createdAt`: Creation timestamp (Date object)

**Validation rules:**
- Title must be non-empty after trimming whitespace
- Subject must be non-empty after trimming whitespace
- Due date must be a valid Date object
- ID must be unique across all homework items

### LocalStorage Schema

Data is stored in LocalStorage as a JSON array under the key `homework-tracker-data`.

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Math worksheet pages 45-47",
    "subject": "Mathematics",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "completed": false,
    "createdAt": "2024-01-10T14:30:00.000Z"
  }
]
```

**Serialization:**
- Date objects are serialized to ISO 8601 strings
- On deserialization, date strings are converted back to Date objects
- Invalid or corrupted data results in an empty array being returned

## Error Handling

### Input Validation Errors

When users provide invalid input:
- Empty title: Display "Title cannot be empty"
- Empty subject: Display "Subject cannot be empty"
- Missing due date: Display "Please select a due date"
- Invalid date: Display "Please select a valid date"

Errors are displayed in a dedicated error message area above the form and cleared when the user corrects the input.

### LocalStorage Errors

When LocalStorage operations fail:
- **Quota exceeded**: Catch the exception, display "Storage is full. Please delete some homework items."
- **Corrupted data**: Return empty array and log error to console
- **LocalStorage unavailable**: Display "Local storage is not available. Data will not be saved."

### Browser Compatibility

The application checks for LocalStorage availability on initialization:

```typescript
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
```

If LocalStorage is unavailable, display a warning message but allow the app to function with in-memory storage only.

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage.

### Unit Testing

Unit tests will verify specific behaviors and edge cases:

- **HomeworkManager tests:**
  - Adding homework with valid inputs creates an item
  - Adding homework with empty title throws error
  - Adding homework with empty subject throws error
  - Toggling completion flips the boolean value
  - Deleting homework removes it from the list
  - Getting all homework returns items sorted by due date

- **StorageService tests:**
  - Saving and loading preserves data structure
  - Loading with no data returns empty array
  - Loading with corrupted data returns empty array
  - Date serialization/deserialization works correctly

- **UIController tests:**
  - Form submission with valid data adds homework
  - Form submission with invalid data shows error
  - Clicking toggle button updates completion status
  - Clicking delete button removes item after confirmation

### Property-Based Testing

Property-based tests will be implemented using fast-check (TypeScript property testing library). Each test will run a minimum of 100 iterations with randomly generated inputs.

Tests will be tagged with comments referencing the design document properties:
```typescript
// Feature: homework-tracker, Property 1: [property text]
```

### Test Configuration

- **Framework**: Jest for unit tests, fast-check for property-based tests
- **Coverage target**: 80% code coverage minimum
- **Property test iterations**: 100 minimum per property
- **Test organization**: Tests colocated with source files (e.g., `HomeworkManager.test.ts`)



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Valid homework creation

*For any* non-empty title, non-empty subject, and valid due date, creating a homework item should produce an item containing exactly those values with a unique ID and completed status set to false.

**Validates: Requirements 1.1, 1.6**

### Property 2: Input validation rejects invalid data

*For any* string composed entirely of whitespace (for title or subject) or invalid/missing date value, attempting to add a homework item should be rejected and the homework list should remain unchanged.

**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: Unique ID assignment

*For any* set of homework items created, all IDs should be unique with no duplicates.

**Validates: Requirements 1.5**

### Property 4: Toggle completion flips state

*For any* homework item, toggling its completion status should flip the boolean value (false to true, or true to false).

**Validates: Requirements 2.1, 2.2**

### Property 5: Completion persistence round-trip

*For any* homework item, after toggling its completion status, retrieving it from storage should reflect the new completion state.

**Validates: Requirements 2.3**

### Property 6: Visual distinction for completed items

*For any* homework item, the rendered HTML should contain different visual indicators (CSS classes or attributes) based on whether the item is completed or incomplete.

**Validates: Requirements 2.4**

### Property 7: Storage load retrieves all items

*For any* set of homework items stored in LocalStorage, loading the application should retrieve all of them.

**Validates: Requirements 3.1, 4.4**

### Property 8: Due date sort order invariant

*For any* list of homework items, the displayed list should be sorted by due date in ascending order (earliest due date first).

**Validates: Requirements 3.2**

### Property 9: Rendered items contain required fields

*For any* homework item, the rendered output should contain the title, subject, due date, and completion status.

**Validates: Requirements 3.3**

### Property 10: Add persistence round-trip

*For any* valid homework item, after adding it to the system, retrieving all items from storage should include that item with all its properties intact.

**Validates: Requirements 4.1**

### Property 11: Modification persistence round-trip

*For any* homework item and any valid modification (such as toggling completion), after the modification, retrieving the item from storage should reflect the changes.

**Validates: Requirements 4.2**

### Property 12: Deletion removes item completely

*For any* homework item, after deleting it, the item should not appear in the displayed list and should not exist in LocalStorage.

**Validates: Requirements 4.3, 5.1, 5.2, 5.4**

### Property 13: Corrupted data handling

*For any* invalid or corrupted JSON string in LocalStorage, loading the application should handle the error gracefully and return an empty homework list without crashing.

**Validates: Requirements 4.5**

### Property 14: Serialization round-trip

*For any* valid homework item with Date objects, serializing to JSON and deserializing back should produce an equivalent item with Date objects properly restored.

**Validates: Requirements 4.1, 4.2** (implicit requirement for date handling)
