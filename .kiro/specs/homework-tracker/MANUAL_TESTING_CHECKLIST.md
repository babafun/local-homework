# Manual Testing Checklist - Homework Tracker

## Overview
This document provides a comprehensive manual testing checklist for the Homework Tracker application. All automated tests are passing, and the application is ready for manual testing across different browsers and devices.

## Pre-Testing Setup

### Starting the Application
1. **Development Mode**: Run `npm run dev` and open `http://localhost:5173`
2. **Production Build**: Run `npm run build` then `npm run preview` and open `http://localhost:4173`

### Test Data Preparation
- Have multiple homework items ready to add
- Test with various due dates (past, present, future)
- Test with different title/subject lengths

---

## Test 1: Browser Compatibility (Requirements 6.1, 6.2, 6.3)

### Chrome (Version 90+)
- [ ] Application loads without errors
- [ ] All UI elements render correctly
- [ ] Form inputs work properly
- [ ] Add homework functionality works
- [ ] Toggle completion works
- [ ] Delete functionality works
- [ ] LocalStorage persistence works
- [ ] No console errors

### Firefox (Version 88+)
- [ ] Application loads without errors
- [ ] All UI elements render correctly
- [ ] Form inputs work properly
- [ ] Add homework functionality works
- [ ] Toggle completion works
- [ ] Delete functionality works
- [ ] LocalStorage persistence works
- [ ] No console errors

### Edge (Version 90+)
- [ ] Application loads without errors
- [ ] All UI elements render correctly
- [ ] Form inputs work properly
- [ ] Add homework functionality works
- [ ] Toggle completion works
- [ ] Delete functionality works
- [ ] LocalStorage persistence works
- [ ] No console errors

---

## Test 2: Responsive Design - Mobile (Requirement 6.4)

### Test at 320px width (minimum mobile size)
- [ ] Page layout is not broken
- [ ] Header is readable and properly sized
- [ ] Form inputs are accessible and usable
- [ ] Labels are visible and clear
- [ ] Add button is clickable
- [ ] Homework items display in single column
- [ ] Action buttons (Done/Delete) are accessible
- [ ] No horizontal scrolling required
- [ ] Text is readable without zooming

### Test at 375px width (iPhone SE)
- [ ] All elements fit comfortably
- [ ] Adequate spacing between elements
- [ ] Buttons are easily tappable

### Test at 414px width (iPhone Plus)
- [ ] Layout utilizes available space well
- [ ] No awkward gaps or spacing issues

---

## Test 3: Responsive Design - Desktop (Requirement 6.5)

### Test at 1024px width (minimum desktop size)
- [ ] Container is centered
- [ ] Maximum width constraint is applied
- [ ] Form layout is comfortable
- [ ] Homework items display properly
- [ ] Action buttons are aligned correctly

### Test at 1920px width (Full HD)
- [ ] Container remains centered
- [ ] Content doesn't stretch too wide
- [ ] Layout remains visually balanced

---

## Test 4: Empty State Testing (Requirement 3.4)

### Initial Load with No Data
- [ ] Empty state message is displayed
- [ ] Message is clear and informative
- [ ] Message is centered and styled appropriately
- [ ] No errors in console

### After Deleting All Items
- [ ] Empty state message reappears
- [ ] No leftover UI elements
- [ ] Application remains functional

---

## Test 5: Multiple Homework Items (Requirements 3.1, 3.2)

### Add Multiple Items
- [ ] Add 5+ homework items with different due dates
- [ ] Items appear in the list immediately
- [ ] Each item displays all fields (title, subject, due date)

### Verify Sorting
- [ ] Items are sorted by due date (earliest first)
- [ ] Add an item with an earlier due date - verify it appears first
- [ ] Add an item with a later due date - verify it appears last

### Visual Distinction
- [ ] Mark some items as complete
- [ ] Completed items have strikethrough text
- [ ] Completed items have different visual styling (opacity, border color)
- [ ] Incomplete items remain clearly visible

---

## Test 6: LocalStorage Persistence (Requirements 4.1, 4.2, 4.3, 4.4)

### Add Persistence
- [ ] Add a homework item
- [ ] Refresh the page
- [ ] Verify the item is still present

### Modification Persistence
- [ ] Toggle an item to completed
- [ ] Refresh the page
- [ ] Verify the item is still marked as completed
- [ ] Toggle it back to incomplete
- [ ] Refresh the page
- [ ] Verify the item is now incomplete

### Deletion Persistence
- [ ] Delete a homework item
- [ ] Refresh the page
- [ ] Verify the item is gone

### Multiple Items Persistence
- [ ] Add 3+ items
- [ ] Mark some as complete
- [ ] Refresh the page
- [ ] Verify all items and their states are preserved

### Cross-Tab Persistence
- [ ] Open the app in one tab
- [ ] Add items
- [ ] Open the app in a new tab
- [ ] Verify items appear (may need refresh)

---

## Test 7: Form Validation (Requirements 1.2, 1.3, 1.4)

### Empty Title
- [ ] Leave title empty
- [ ] Fill subject and due date
- [ ] Click "Add Homework"
- [ ] Verify error message appears: "Title cannot be empty"
- [ ] Verify item is not added

### Empty Subject
- [ ] Fill title
- [ ] Leave subject empty
- [ ] Fill due date
- [ ] Click "Add Homework"
- [ ] Verify error message appears: "Subject cannot be empty"
- [ ] Verify item is not added

### Missing Due Date
- [ ] Fill title and subject
- [ ] Leave due date empty
- [ ] Click "Add Homework"
- [ ] Verify error message appears: "Please select a due date"
- [ ] Verify item is not added

### Whitespace-Only Input
- [ ] Enter only spaces in title
- [ ] Fill subject and due date
- [ ] Click "Add Homework"
- [ ] Verify validation error appears
- [ ] Verify item is not added

### Error Message Clearing
- [ ] Trigger a validation error
- [ ] Correct the input
- [ ] Submit again
- [ ] Verify error message disappears
- [ ] Verify item is added successfully

---

## Test 8: User Interactions (Requirements 2.1, 2.2, 5.3, 5.4, 7.4)

### Toggle Completion
- [ ] Click "Done" button on an incomplete item
- [ ] Verify item is marked as complete (visual change)
- [ ] Click "Done" button again
- [ ] Verify item returns to incomplete state
- [ ] Verify immediate visual feedback

### Delete with Confirmation
- [ ] Click "Delete" button
- [ ] Verify confirmation dialog appears
- [ ] Click "Cancel"
- [ ] Verify item is NOT deleted
- [ ] Click "Delete" again
- [ ] Click "OK" or "Confirm"
- [ ] Verify item is removed from list

### Form Submission
- [ ] Fill all fields correctly
- [ ] Click "Add Homework"
- [ ] Verify item appears in list
- [ ] Verify form inputs are cleared
- [ ] Verify no error messages

---

## Test 9: Visual Design (Requirements 7.1, 7.2, 7.3, 7.5)

### Overall Appearance
- [ ] Color scheme is age-appropriate (11-16 years old)
- [ ] Typography is clear and readable
- [ ] Adequate spacing between elements
- [ ] Buttons are clearly identifiable

### Form Design
- [ ] "Add Homework" section is clearly visible
- [ ] Form labels are clear and descriptive
- [ ] Input fields are properly sized
- [ ] Add button is prominent

### Homework List Design
- [ ] Items are displayed in a clean format
- [ ] Adequate spacing between items
- [ ] Hover effects work (desktop)
- [ ] Action buttons are clearly visible

### Interactive Feedback
- [ ] Button hover states work
- [ ] Button click feedback is immediate
- [ ] Form submission provides feedback
- [ ] Error messages are clearly visible

---

## Test 10: Edge Cases and Error Handling

### Long Text Input
- [ ] Enter very long title (200+ characters)
- [ ] Verify it displays without breaking layout
- [ ] Enter very long subject
- [ ] Verify it displays without breaking layout

### Special Characters
- [ ] Enter title with special characters (!@#$%^&*)
- [ ] Verify it saves and displays correctly
- [ ] Enter subject with emojis
- [ ] Verify it saves and displays correctly

### Date Selection
- [ ] Select a past date
- [ ] Verify it's accepted and displays correctly
- [ ] Select today's date
- [ ] Verify it's accepted and displays correctly
- [ ] Select a future date
- [ ] Verify it's accepted and displays correctly

### Rapid Interactions
- [ ] Quickly add multiple items
- [ ] Verify all are added correctly
- [ ] Quickly toggle completion multiple times
- [ ] Verify state updates correctly
- [ ] Quickly delete multiple items
- [ ] Verify all are removed correctly

---

## Test 11: LocalStorage Edge Cases (Requirement 4.5)

### LocalStorage Unavailable
- [ ] Open browser in private/incognito mode (if LocalStorage is disabled)
- [ ] Verify warning message appears
- [ ] Verify app still functions (in-memory only)

### LocalStorage Quota
- [ ] Add 50+ homework items
- [ ] Verify all are saved
- [ ] Refresh page
- [ ] Verify all items load correctly

---

## Testing Completion Checklist

### All Browsers Tested
- [ ] Chrome
- [ ] Firefox
- [ ] Edge

### All Screen Sizes Tested
- [ ] 320px (mobile minimum)
- [ ] 375px (mobile standard)
- [ ] 768px (tablet)
- [ ] 1024px (desktop minimum)
- [ ] 1920px (desktop full HD)

### All Features Tested
- [ ] Add homework
- [ ] View homework list
- [ ] Toggle completion
- [ ] Delete homework
- [ ] Form validation
- [ ] LocalStorage persistence
- [ ] Empty state
- [ ] Sorting by due date

### All Requirements Validated
- [ ] Requirement 6.1 (Chrome compatibility)
- [ ] Requirement 6.2 (Firefox compatibility)
- [ ] Requirement 6.3 (Edge compatibility)
- [ ] Requirement 6.4 (Mobile responsive 320px+)
- [ ] Requirement 6.5 (Desktop responsive 1024px+)

---

## Issues Found

### Issue Template
Use this template to document any issues found during testing:

```
**Issue #**: [Number]
**Browser**: [Chrome/Firefox/Edge]
**Screen Size**: [Width in px]
**Severity**: [Critical/High/Medium/Low]
**Description**: [What went wrong]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]
**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshot**: [If applicable]
```

---

## Sign-Off

**Tester Name**: ___________________________

**Date**: ___________________________

**Overall Result**: [ ] PASS  [ ] FAIL

**Notes**:
