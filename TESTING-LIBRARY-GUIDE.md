# Testing Library Guide

## Overview
This project uses **React Testing Library** for comprehensive component testing, following best practices for accessible, user-centric testing.

## Installed Packages

### Core Packages
- **`@testing-library/react`** (v16.0.0) - React component testing utilities
- **`@testing-library/jest-dom`** (v6.6.3) - Custom Jest matchers for DOM assertions
- **`@testing-library/user-event`** (v14.6.1) - Realistic user interaction simulation

## Testing Library Features Used

### 1. Rendering Components
```typescript
import { render } from '@testing-library/react';

const { container } = render(<Component />);
```

### 2. Querying Elements (Accessibility-First)
Testing Library provides queries in order of recommendation:

**By Role** (Best - most accessible):
```typescript
screen.getByRole('button');
screen.getByRole('textbox');
screen.getAllByRole('listitem');
```

**By Label Text**:
```typescript
screen.getByLabelText('Email');
```

**By Placeholder Text**:
```typescript
screen.getByPlaceholderText('Enter URL');
```

**By Text** (use as fallback):
```typescript
screen.getByText('Click Me');
screen.getByText(/regex/i); // regex support
```

**By Test ID** (last resort):
```typescript
screen.getByTestId('custom-id');
```

### 3. Async Queries
```typescript
await screen.findByText('Loading...'); // Waits for element
await waitFor(() => {
  expect(onClose).toHaveBeenCalled();
});
```

### 4. User Event Simulation
```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.hover(element);
```

### 5. Jest DOM Matchers
Custom matchers from `@testing-library/jest-dom`:

```typescript
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toHaveClass('cyber-button');
expect(element).toHaveStyle({ width: '100%' });
expect(element).toHaveTextContent('Expected text');
expect(input).toHaveValue('expected value');
expect(form).toHaveFormValues({ email: 'test@example.com' });
```

### 6. Testing Async Behavior
```typescript
import { waitFor, act } from '@testing-library/react';

// Wait for async state updates
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Wrap state updates
act(() => {
  jest.advanceTimersByTime(1000);
});
```

## Test Files Structure

### 1. `__tests__/components.test.tsx`
Tests for core UI components:
- ✅ **RiskBar** (4 tests) - Risk score rendering and styling
- ✅ **CyberButton** (5 tests) - Button interactions and variants
- ✅ **CyberInput** (4 tests) - Input handling and multiline support

### 2. `__tests__/components-extended.test.tsx`
Extended component coverage:
- ✅ **AnalysisCard** (5 tests) - Card rendering, risk styling, details display
- ✅ **Toast** (6 tests) - Toast notifications, auto-close, types
- ✅ **ToastContainer** (2 tests) - Multiple toasts handling
- ✅ **LoadingSpinner** (3 tests) - Spinner sizes and rendering
- ✅ **CyberLoader** (3 tests) - Loader with messages
- ✅ **ExplainPanel** (6 tests) - Explainability features, heatmaps, percentages

### 3. Unit Tests
- `__tests__/heuristics.test.ts` - Rule-based detection
- `__tests__/quantum.test.ts` - Quantum hashing
- `__tests__/audio.test.ts` - Audio feature extraction
- `__tests__/visual.test.ts` - Visual DNA rendering

## Testing Best Practices

### ✅ DO:
- Test from user's perspective
- Query by accessible queries first (role, label, text)
- Use `userEvent` for interactions
- Use `waitFor` for async operations
- Test behavior, not implementation
- Use descriptive test names

### ❌ DON'T:
- Don't test implementation details
- Don't use `getByTestId` unless necessary
- Don't test third-party library internals
- Don't over-mock
- Don't test CSS classes directly (test behavior instead)

## Example Test Pattern

```typescript
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/app/components/MyComponent';

describe('MyComponent', () => {
  it('should handle user interaction', async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(button);
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/components.test.tsx

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Test Coverage Summary

**Total Component Tests: 38**
- RiskBar: 4 tests
- CyberButton: 5 tests
- CyberInput: 4 tests
- AnalysisCard: 5 tests
- Toast: 6 tests
- ToastContainer: 2 tests
- LoadingSpinner: 3 tests
- CyberLoader: 3 tests
- ExplainPanel: 6 tests

**All tests passing! ✅**

