import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, PasswordInput, Logo } from '../components/ui';
import type { AuthFormData } from '../types';
import { supabaseSignUp } from '../apis/SupabaseAuth';
import { toast } from 'sonner';
import { signupApi } from '../apis/Users';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<AuthFormData>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    } else localStorage.clear();
  }, [navigate]);

  const handleRoleChange = (role: 'student' | 'teacher') => {
    setRole(role);
  };

  const signupHandler = async () => {
    try {
      setIsLoading(true);

      // Validate email is a Gmail address and password is at least 6 characters
      const newErrors: Partial<AuthFormData> = {};
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

      if (!email) {
        newErrors.email = 'Email is required';
        toast.error('Email is required');
        setIsLoading(false);
        return;
      } else if (!gmailRegex.test(email)) {
        newErrors.email = 'Please enter a valid Gmail address';
        toast.error('Please enter a valid Gmail address');
        setIsLoading(false);
        return;
      }

      if (!password) {
        newErrors.password = 'Password is required';
        toast.error('Password is required');
        setIsLoading(false);
        return;
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        toast.error('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      const signupResponse = await supabaseSignUp(email, password);
      const auth_id = signupResponse.data?.user?.id;
      if (!signupResponse.success) {
        throw new Error(signupResponse.message);
      } else {
        const signupUserTableResponse = await signupApi(email, role, auth_id || '');
        if (!signupUserTableResponse.success) {
          throw new Error(signupUserTableResponse.message);
        }
        toast.success('Account created successfully!');
        navigate('/email-verification', { state: { email } });
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-6">
      <div className="overflow-hidden w-full max-w-5xl">
        <div className="flex h-[760px]">
          {/* Left Section - Branding */}
          <div className="w-[566px] bg-[#1E395D] flex flex-col items-center justify-end p-12 relative flex-shrink-0 rounded-[32px]">
            {/* Logo */}
            <div className="mb-10">
              <div className="bg-[#F7F7F7] p-6 rounded-[24px] shadow-lg">
                <Logo size="figma" />
              </div>
            </div>

            {/* Slogan */}
            <h2 className="text-[#F7F7F7] text-[21px] font-normal mb-12 text-center leading-normal font-[Poppins]">
              Quest for Leadership, Quest for Change
            </h2>

            {/* Quote */}
            <div className="flex items-center mt-20 mb-10">
              <h1 className="text-[#F7F7F7] text-[32px] font-normal text-center leading-normal">
                "Future Leaders Start Here"
              </h1>
            </div>

            {/* Copyright */}
            <div className='mt-16'>
              <p className="text-[#AAA] text-center font-[Poppins] text-[16px] font-normal leading-normal">
                © Iman Praveesh Hassan
              </p>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="flex flex-col items-center justify-center p-10 flex-1">
            <div className="w-full max-w-md">
              <div className="space-y-6">
                {/* Email Input */}
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  error={errors.email}
                  className="w-full"
                />

                {/* Password Input */}
                <PasswordInput
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  className="w-full"
                />

                {/* Role Selection */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={role === 'student' ? 'role-select-active' : 'role-select'}
                    onClick={() => handleRoleChange('student')}
                    className="flex-1 py-3.5 rounded-[16px] text-sm font-medium text-black"
                  >
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant={role === 'teacher' ? 'role-select-active' : 'role-select'}
                    onClick={() => handleRoleChange('teacher')}
                    className="flex-1 py-3.5 rounded-[16px] text-sm font-medium border border-black"
                  >
                    Teacher
                  </Button>
                </div>

                {/* Sign Up Button */}
                <Button
                  variant="primary"
                  className="w-full py-4 rounded-[32px] text-base font-bold"
                  style={{ backgroundColor: '#C2A46D' }}
                  onClick={signupHandler}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    'Sign Up'
                  )}
                </Button>

                {/* Login Link */}
                <div className="flex justify-between items-center text-xs mt-5">
                  <span className="text-gray-600">
                    Have an account?{' '}
                    <Link to="/login" className="text-[#1E395D] hover:underline font-medium underline">
                      Log In
                    </Link>
                  </span>
                  <a href="#" className="text-[#1E395D] hover:underline font-medium underline">
                    Read Terms and Conditions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
