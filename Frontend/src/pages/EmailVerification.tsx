import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Logo } from '../components/ui';
import { resendVerificationEmail } from '../apis/SupabaseAuth';
import { toast } from 'sonner';

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // If no email is provided, redirect to signup
  React.useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleResendEmail = async () => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before resending`);
      return;
    }

    try {
      setIsResending(true);
      const response = await resendVerificationEmail(email);
      
      if (response.success) {
        toast.success(response.message);
        // Set 60 second cooldown
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
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

          {/* Right Section - Verification Message */}
          <div className="flex flex-col items-center justify-center p-10 flex-1">
            <div className="w-full max-w-md">
              <div className="space-y-6">
                {/* Email Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#C2A46D] rounded-full flex items-center justify-center">
                    <svg 
                      className="w-10 h-10 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-[#1E395D] text-[32px] font-bold text-center leading-normal">
                  Verify Your Email
                </h1>

                {/* Instructions */}
                <div className="space-y-4 text-center">
                  <p className="text-gray-700 text-[16px] leading-relaxed">
                    We've sent a verification email to:
                  </p>
                  
                  <p className="text-[#1E395D] text-[18px] font-semibold break-all px-2">
                    {email}
                  </p>

                  <div className="bg-[#FFF8E7] border-l-4 border-[#C2A46D] p-4 rounded-r-lg text-left">
                    <p className="text-gray-800 text-[14px] leading-relaxed">
                      <span className="font-semibold">📧 Important:</span> Please check your email inbox 
                      <span className="font-semibold"> including Spam/Promotions folders</span> to verify your account.
                    </p>
                  </div>

                  <p className="text-gray-600 text-[14px] leading-relaxed">
                    Click the verification link in the email to activate your account and log in.
                  </p>
                </div>

                {/* Resend Button */}
                <Button
                  variant="primary"
                  className="w-full py-4 rounded-[32px] text-base font-bold mt-6"
                  style={{ 
                    backgroundColor: cooldown > 0 ? '#9CA3AF' : '#C2A46D',
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={handleResendEmail}
                  disabled={isResending || cooldown > 0}
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="ml-2">Sending...</span>
                    </div>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>

                {/* Back to Login */}
                <div className="flex justify-center items-center text-sm mt-6">
                  <span className="text-gray-600">
                    Already verified?{' '}
                    <Link to="/login" className="text-[#1E395D] hover:underline font-medium underline">
                      Log In
                    </Link>
                  </span>
                </div>

                {/* Help Text */}
                <div className="text-center mt-4">
                  <p className="text-gray-500 text-xs">
                    Didn't receive the email? Check your spam folder or click resend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;

