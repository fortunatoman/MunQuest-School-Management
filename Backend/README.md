# School Management System - Backend API

A comprehensive backend API for a school management system built with Node.js, Express.js, TypeScript, and Supabase.

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/                    # Request handlers
│   │   ├── event.controller.ts
│   │   ├── user.controller.ts
│   │   └── organiser.controller.ts
│   ├── middleware/                     # Custom middleware
│   │   └── auth.middleware.ts
│   ├── routers/                        # Route definitions
│   │   ├── route.ts                    # Main router
│   │   ├── event.router.ts             # Event-related routes
│   │   ├── user.router.ts              # User-related routes
│   │   └── organiser.router.ts         # Organiser-related routes
│   ├── services/                       # Business logic
│   │   ├── event.service.ts
│   │   ├── user.service.ts
│   │   └── organiser.service.ts
│   ├── utils/                          # Utility functions
│   │   ├── supabase.ts
│   │   └── uniqueNameGenerator.ts
│   └── index.ts                        # Application entry point
├── package.json
├── tsconfig.json
└── README.md
```

## 📋 Naming Conventions

### Files and Folders
- **Files**: Use camelCase for TypeScript files (e.g., `userController.ts`)
- **Folders**: Use lowercase with hyphens for multi-word folders (e.g., `user-management`)
- **Routers**: Always use `.router.ts` suffix (e.g., `user.router.ts`)
- **Controllers**: Always use `.controller.ts` suffix (e.g., `user.controller.ts`)
- **Services**: Always use `.service.ts` suffix (e.g., `user.service.ts`)
- **Utils**: Use descriptive names (e.g., `uniqueNameGenerator.ts`)

### Functions and Variables
- **Functions**: Use camelCase (e.g., `getUserById`, `createEventService`)
- **Variables**: Use camelCase (e.g., `userId`, `eventName`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### API Endpoints
- Use kebab-case for URLs (e.g., `/create-event`, `/user-profile`)
- Use descriptive names that clearly indicate the action

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PORT=1000
   JWT_SECRET=your_jwt_secret_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:1000/api/v1
```

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### User Management

#### Register User
```http
POST /users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "student" // optional, defaults to "student"
}
```

#### Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /users/user-profile
Authorization: Bearer <token>
```

#### Update Teacher Profile
```http
POST /users/teacher-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "John Doe",
  "username": "johndoe",
  "birthday": "1990-01-01",
  "gender": "male",
  "locality": "New York",
  "schoolName": "ABC School",
  "yearsOfWorkExperience": "5",
  "phone": "1234567890",
  "countryCode": "+1"
}
```

#### Update Student Profile
```http
POST /users/student-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "Jane Doe",
  "username": "janedoe",
  "birthday": "2000-01-01",
  "gender": "female",
  "locality": "New York",
  "schoolName": "ABC School",
  "gradeType": "High School",
  "grade": "10th",
  "phone": "1234567890",
  "countryCode": "+1"
}
```

#### Upload Avatar
```http
POST /users/upload-avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <image_file>
```

#### Change Password
```http
POST /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

### Event Management

#### Upload Event Images
```http
POST /events/create-event-images-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

#### Create Event
```http
POST /events/create-event
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventName": "Science Fair 2024",
  "coverImage": "https://example.com/cover.jpg",
  "school": "ABC School",
  "locality": "New York",
  "eventLogo": "https://example.com/logo.jpg",
  "eventDescription": "Annual science fair",
  "eventStartDate": "2024-06-01",
  "eventEndDate": "2024-06-03",
  "numberOfSeats": "100",
  "feesPerDelegate": "50",
  "totalRevenue": "5000",
  "website": "https://example.com",
  "instagram": "@abcschool"
}
```

#### Get Current Events
```http
GET /events/get-events
Authorization: Bearer <token>
```

### Organiser Management

#### Upload Evidence Document
```http
POST /organiser/organiser-approval-evidence-upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <document_file>
```

**Supported file types**: PDF, DOC, DOCX, JPEG, PNG
**Maximum file size**: 10MB

**Response**:
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "documentUrl": "https://your-supabase-url/storage/v1/object/public/documents/user123_1703123456789_1234.pdf"
}
```

#### Request Organiser Approval
```http
POST /organiser/organiser-approval-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "schoolName": "ABC School",
  "locality": "New York",
  "role": "Event Organiser",
  "evidenceDocs": ["https://example.com/evidence1.pdf", "https://example.com/evidence2.pdf"]
}
```

## 🛠️ Technical Details

### File Upload System
- **Avatar Uploads**: Stored in Supabase `avatars` bucket
- **Event Images**: Stored in Supabase `events` bucket
- **Documents**: Stored in Supabase `documents` bucket (PDFs, DOCs, images)
- **Unique Naming**: All files are automatically renamed to prevent conflicts using the pattern: `{userId}_{timestamp}_{randomNumber}.{extension}`

### Database Schema
The application uses Supabase with the following main tables:
- `users`: User accounts and profiles
- `events`: Event information and details
- `organisers`: Organiser approval requests and profiles

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- File type validation
- File size limits
- CORS enabled for cross-origin requests

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages for debugging

## 🔧 Development Guidelines

### Code Organization
1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Contain business logic and database operations
3. **Routers**: Define API endpoints and middleware
4. **Middleware**: Handle cross-cutting concerns (auth, validation)
5. **Utils**: Reusable utility functions

### Adding New Features
1. Create service functions in appropriate service files
2. Create controller functions to handle HTTP requests
3. Add routes in the appropriate router files
4. Update this README with new endpoints

### Code Style
- Use TypeScript for type safety
- Follow camelCase naming conventions
- Add proper error handling
- Include JSDoc comments for complex functions
- Keep functions focused on single responsibilities

## 📦 Dependencies

### Production
- `express`: Web framework
- `typescript`: Type safety
- `supabase`: Database and storage
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT authentication
- `multer`: File upload handling
- `cors`: Cross-origin resource sharing
- `morgan`: HTTP request logger

### Development
- `nodemon`: Development server
- `@types/*`: TypeScript type definitions

## 🚀 Deployment

1. Build the TypeScript code:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

When contributing to this project:
1. Follow the established naming conventions
2. Maintain consistent code style
3. Add proper error handling
4. Update documentation for new features
5. Test all changes thoroughly

---

**Note**: This backend API is designed to work with a frontend application and requires proper Supabase configuration for full functionality.


---
Last updated: 2026-02-24 04:49:28
