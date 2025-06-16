export interface User {
  userId: string;
  email: string;
  role: 'student' | 'teacher';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomJwtPayload {
  role: 'student' | 'teacher' | "organizer" | "super_user" ;
  userId: string;
  sub: string;
  iat: number;
  exp: number;
}

export interface AuthFormData {
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  user: User | null;
  theme: Theme;
  isLoading: boolean;
}

export interface LeadershipRole {
  id: string;
  abbreviation: string;
  title: string;
  created_at?: Date;
  updated_at?: Date;
}