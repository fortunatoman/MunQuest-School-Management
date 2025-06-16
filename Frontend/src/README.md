# Development Guidelines

## 📋 Naming Conventions

### Files and Folders
- **Components**: PascalCase (e.g., `UserProfile.tsx`, `StudentHome.tsx`)
- **Pages**: PascalCase (e.g., `Dashboard.tsx`, `EventCreate.tsx`)
- **Utilities**: camelCase (e.g., `avatarUtils.ts`, `profileCheck.ts`)
- **Assets**: kebab-case (e.g., `home-icon.svg`, `organiser-icon.svg`)
- **Folders**: camelCase (e.g., `schoolList/`, `userProfile/`)

### Variables and Functions
- **React Components**: PascalCase (e.g., `const UserProfile`)
- **Variables**: camelCase (e.g., `const userName`, `const isLoggedIn`)
- **Functions**: camelCase (e.g., `const handleSubmit`, `const getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `const API_BASE_URL`)
- **API Functions**: camelCase with "Api" suffix (e.g., `getUserByIdApi`)

### CSS Classes
- **Tailwind CSS**: Use utility classes
- **Custom Classes**: kebab-case (e.g., `custom-button`, `form-container`)

## 🏗️ Folder Organization

### By Purpose
```
src/
├── apis/           # API integration layer
├── assets/         # Static assets (images, icons)
├── components/     # Reusable UI components
├── pages/          # Page components
├── styles/         # Global styles
├── types/          # TypeScript definitions
└── utils/          # Utility functions
```

### Component Structure
- **UI Components**: Basic, reusable components in `components/ui/`
- **Shared Components**: Common components like `Header` in `components/`
- **Page Components**: Full page components in `pages/`
- **Feature Components**: Grouped by feature (student/, teacher/)

### Header Component Usage
```typescript
import { Header } from '../components/ui';

// Basic usage
<Header />

// With custom max width
<Header maxWidth="max-w-[88rem]" />

// Without navigation (logo only)
<Header showNavigation={false} />

// With custom styling
<Header className="custom-header-class" />
```

## 📝 Code Standards

### One File = One Responsibility
- Each file should have a single, clear purpose
- Keep components focused and small
- Separate concerns (UI, logic, data)

### Import Organization
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 3. Internal imports (components)
import { Logo, Avatar } from '../components/ui';

// 4. Internal imports (utilities)
import { getUserByIdApi } from '../apis/userApi';

// 5. Asset imports
import HomeIcon from '../assets/home_icon.svg';
```

### Component Structure
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component definition
// 4. State declarations
// 5. Effect hooks
// 6. Event handlers
// 7. Render helpers
// 8. Main render
// 9. Export
```

## 🎨 Styling Guidelines

### Tailwind CSS Usage
- Use utility classes for styling
- Maintain consistent spacing (4px, 8px, 16px, 24px, 32px)
- Use design system colors
- Responsive design with mobile-first approach

### Component Styling
```typescript
// Good: Consistent, readable
className="w-[400px] px-4 py-3 border border-gray-300 rounded-lg"

// Bad: Inconsistent spacing
className="w-96 px-3 py-2 border border-gray-300 rounded"
```

## 🔧 API Integration

### Naming Convention
- All API functions end with "Api" suffix
- Use descriptive names: `getUserByIdApi`, `updateUserProfileApi`
- Group related APIs in the same file

### Error Handling
```typescript
try {
  const response = await getUserByIdApi();
  if (response.success) {
    // Handle success
  } else {
    toast.error(response.message);
  }
} catch (error: any) {
  toast.error('An error occurred');
  console.log('Error:', error);
}
```

## 📱 Responsive Design

### Breakpoints
- Mobile: Default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

### Component Widths
- Forms: `w-[400px]` (consistent form width)
- Full width: `w-full`
- Container: `max-w-7xl mx-auto`

## 🧪 Testing Guidelines

### Component Testing
- Test user interactions
- Test error states
- Test loading states
- Test responsive behavior

### Code Quality
- Use TypeScript strictly
- Avoid `any` types when possible
- Use proper error boundaries
- Handle edge cases

## 🚀 Performance

### Optimization
- Use React.memo for expensive components
- Lazy load routes when appropriate
- Optimize images
- Minimize re-renders

### State Management
- Keep state as local as possible
- Use context for global state
- Avoid prop drilling

## 📚 Documentation

### Code Comments
- Explain complex logic
- Document API integrations
- Add TODO comments for future work
- Keep comments up to date

### README Updates
- Update when adding new features
- Document breaking changes
- Keep installation instructions current
- Document new environment variables

## 🔄 Git Workflow

### Commit Messages
- Use descriptive commit messages
- Follow conventional commit format
- Reference issues when applicable

### Code Review
- Review for naming consistency
- Check for proper error handling
- Verify responsive design
- Test functionality

---

**Remember**: Consistency is key. When in doubt, follow the established patterns in the codebase.