/**
 * Represents a single homework assignment
 */
export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
}

/**
 * Type guard to check if an object is a valid HomeworkItem
 */
export function isHomeworkItem(obj: any): obj is HomeworkItem {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.subject === 'string' &&
    obj.dueDate instanceof Date &&
    typeof obj.completed === 'boolean' &&
    obj.createdAt instanceof Date
  );
}

/**
 * Type guard for validating serialized homework item data from storage
 */
export function isSerializedHomeworkItem(obj: any): boolean {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.subject === 'string' &&
    typeof obj.dueDate === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.createdAt === 'string'
  );
}
