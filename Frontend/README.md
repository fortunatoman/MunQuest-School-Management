# MunQuest - School Management System Frontend

A comprehensive React-based frontend application for managing Model United Nations (MUN) events, student and teacher registrations, and event organization.

## 🚀 Features

- **User Authentication**: Login and registration for students and teachers
- **Event Management**: Create, view, and manage MUN events
- **Profile Management**: Complete profile creation and editing for both user types
- **Event-based Routing**: Automatic navigation based on event availability
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: Dynamic content updates and avatar management

## 📁 Project Structure

```
src/
├── apis/                    # API integration layer
│   └── userApi.ts          # All API calls and endpoints
├── assets/                  # Static assets
│   ├── *.svg               # Icon files (home, notification, organiser, edit)
│   ├── *.png               # Image assets (Logo, student, teacher, event)
│   └── school_list/        # School data JSON files by emirate
├── components/              # Reusable UI components
│   └── ui/                 # Basic UI components
│       ├── Avatar.tsx      # User avatar with upload functionality
│       ├── Button.tsx      # Reusable button component
│       ├── DateRangePicker.tsx
│       ├── Input.tsx       # Form input component
│       ├── LoadingSpinner.tsx
│       ├── Logo.tsx        # Application logo
│       ├── PasswordInput.tsx
│       └── index.ts        # Component exports
├── pages/                   # Page components
│   ├── Dashboard.tsx       # Main events dashboard
│   ├── HomePage.tsx        # Landing page with event checking
│   ├── Login.tsx           # User authentication
│   ├── SignUp.tsx          # User registration
│   ├── Organiser.tsx       # Event organizer interface
│   ├── ProfilePage.tsx     # Shared profile management
│   ├── EventCreate.tsx     # Event creation form
│   ├── EventCreateSuccess.tsx
│   ├── RequestApproval.tsx # Organizer approval request
│   ├── RequestUnderVerification.tsx
│   ├── student/            # Student-specific pages
│   │   ├── StudentHome.tsx
│   │   ├── StudentProfileCreate.tsx
│   │   ├── StudentProfilePage.tsx
│   │   ├── StudentRegistration.tsx
│   │   ├── StudentRegistrationSuccess.tsx
│   │   └── StudentDelegatePage.tsx
│   └── teacher/            # Teacher-specific pages
│       ├── TeacherHome.tsx
│       ├── TeacherProfileCreate.tsx
│       ├── TeacherProfilePage.tsx
│       ├── TeacherRegistration.tsx
│       └── TeacherRegistrationSuccess.tsx
├── styles/                  # Global styles
│   └── globals.css         # Global CSS with design system
├── types/                   # TypeScript type definitions
│   └── index.ts            # Shared type definitions
├── utils/                   # Utility functions
│   ├── avatarUtils.ts      # Avatar management utilities
│   ├── profileCheck.ts     # Profile validation utilities
│   ├── toast.ts            # Toast notification utilities
│   └── usernameGenerator.ts # Username generation logic
├── App.tsx                  # Main application component
├── App.css                  # Application styles
├── main.tsx                 # Application entry point
└── vite-env.d.ts           # Vite environment types
```

## 🎨 Design System

### Color Palette
- **Primary Dark**: `#1E395D` - Main brand color
- **Primary Gold**: `#C2A46D` - Accent color
- **Gold Dark**: `#B8945A` - Hover states
- **Background Light**: `#F8F8F8` - Page backgrounds
- **Background White**: `#FFFFFF` - Card backgrounds
- **Text Dark**: `#000000` - Primary text
- **Text Gray**: `#7E7E7E` - Secondary text

### Typography
- **Headings**: Bold, various sizes (2xl to 6xl)
- **Body Text**: Regular weight, 14px-16px
- **Labels**: Bold, 16px
- **Small Text**: 12px-14px

### Component Standards
- **Buttons**: Rounded corners (30px), consistent padding
- **Inputs**: 400px width, rounded corners (8px), focus states
- **Cards**: White background, subtle shadows, rounded corners
- **Icons**: 24px standard size, consistent spacing

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Notifications**: Sonner (toast notifications)
- **Build Tool**: Vite
- **Package Manager**: npm

## 📋 Naming Conventions

### Files and Folders
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Pages**: PascalCase (e.g., `StudentHome.tsx`)
- **Utilities**: camelCase (e.g., `avatarUtils.ts`)
- **Assets**: kebab-case (e.g., `home-icon.svg`)
- **Folders**: camelCase (e.g., `schoolList/`)

### Variables and Functions
- **React Components**: PascalCase (e.g., `const UserProfile`)
- **Variables**: camelCase (e.g., `const userName`)
- **Functions**: camelCase (e.g., `const handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `const API_BASE_URL`)

### API Endpoints
- **Files**: camelCase (e.g., `userApi.ts`)
- **Functions**: camelCase with descriptive names (e.g., `getUserByIdApi`)

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_BACKEND_URL=your_backend_api_url
```

## 🔄 Application Flow

### Authentication Flow
1. **Login/SignUp** → User authentication
2. **Profile Creation** → Student/Teacher profile setup
3. **Event Check** → Automatic routing based on events
4. **Dashboard/Home** → Main application interface

### Event-based Routing
- **Events Available** → Redirect to Dashboard
- **No Events** → Show Home page
- **Real-time Updates** → Automatic page refresh on event changes

### User Types
- **Students**: Can view events, register for MUN conferences
- **Teachers**: Can view events, manage student registrations
- **Organizers**: Can create and manage events

## 🎯 Key Features

### Avatar Management
- Real-time avatar updates across all components
- Automatic fallback to default avatars
- Cross-tab synchronization

### Event Management
- Dynamic event loading from API
- Event filtering by status (Current, Completed, Cancelled)
- Real-time event updates

### Form Validation
- Client-side validation with error messages
- Real-time input validation
- Consistent error handling

### Responsive Design
- Mobile-first approach
- Consistent breakpoints
- Touch-friendly interfaces

## 🧪 Development Guidelines

### Code Organization
- **One file = One responsibility**
- **Group related files together**
- **Use descriptive names**
- **Keep components small and focused**

### State Management
- Use React hooks for local state
- Lift state up when needed
- Avoid prop drilling

### Error Handling
- Consistent error messages
- User-friendly error displays
- Proper error boundaries

### Performance
- Lazy loading for routes
- Optimized images
- Minimal re-renders

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Follow the established naming conventions
2. Maintain consistent code style
3. Write descriptive commit messages
4. Test thoroughly before submitting
5. Update documentation as needed

## 📄 License

This project is proprietary software. All rights reserved.

---

**Note**: This application is designed specifically for the MunQuest school management system and follows the established design patterns and user flows for MUN event management.