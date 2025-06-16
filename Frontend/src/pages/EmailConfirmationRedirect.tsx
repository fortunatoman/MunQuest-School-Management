import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserDataByEmailApi } from '../apis/Users';
import { toast } from 'sonner';
import { Logo } from '../components/ui';

const EmailConfirmationRedirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔄 Processing email confirmation...');
        console.log('🔗 Current URL:', window.location.href);
        console.log('🔗 URL Hash:', window.location.hash);
        console.log('🔗 URL Search:', window.location.search);
        
        // Wait a bit for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the session from URL hash (Supabase handles this automatically)
        const { data, error } = await supabase.auth.getSession();
        
        console.log('📋 Session data:', data);
        console.log('❌ Session error:', error);
        
        if (error) {
          console.error('❌ Session error:', error);
          setStatus('error');
          setMessage('Email confirmation failed. Please try again.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (data.session && data.session.user) {
          console.log('✅ Email confirmed successfully!');
          console.log('👤 User:', data.session.user.email);
          console.log('🔑 Access token:', data.session.access_token ? 'Present' : 'Missing');
          
          setStatus('success');
          setMessage('Email confirmed! Logging you in...');
          
          // Get user data from backend
          try {
            // Store the Supabase token first
            localStorage.setItem('token', data.session.access_token);
            console.log('💾 Token stored in localStorage');
            
            // Get user data from backend
            console.log('📞 Calling getUserDataByEmailApi with:', data.session.user.email);
            const userDataResponse = await getUserDataByEmailApi(data.session.user.email!);
            console.log('📋 User data response:', userDataResponse);
            
            if (userDataResponse.success && userDataResponse.user) {
              // Store user data
              localStorage.setItem('userId', userDataResponse.user.id);
              localStorage.setItem('userRole', userDataResponse.user.role);
              localStorage.setItem('global_role', userDataResponse.user.global_role || '');
              
              console.log('✅ Auto-login successful!');
              console.log('👤 User data stored:', {
                userId: userDataResponse.user.id,
                role: userDataResponse.user.role,
                global_role: userDataResponse.user.global_role
              });
              toast.success('Welcome to MunQuest!');
              
              // Navigate based on user role
              const { role: userRole, global_role, organiserId, hasProfile } = userDataResponse.user;
              
              setTimeout(() => {
                if (global_role === 'superuser') {
                  navigate('/super-user');
                } else {
                  if (organiserId) {
                    navigate('/organiser');
                  } else if (userRole === 'student') {
                    if (hasProfile) {
                      navigate('/student-home');
                    } else {
                      navigate('/student-profile');
                    }
                  } else {
                    if (hasProfile) {
                      navigate('/teacher-home');
                    } else {
                      navigate('/teacher-profile');
                    }
                  }
                }
              }, 2000);
            } else {
              console.error('❌ Invalid user data response:', userDataResponse);
              throw new Error('Failed to get user data');
            }
          } catch (backendError) {
            console.error('❌ Backend login error:', backendError);
            setStatus('error');
            setMessage('Login failed. Please try logging in manually.');
            setTimeout(() => navigate('/login'), 3000);
          }
        } else {
          console.log('⚠️ No session found, checking URL parameters...');
          
          // Check if we have email in URL parameters as fallback
          const emailFromUrl = searchParams.get('email');
          if (emailFromUrl) {
            console.log('📧 Found email in URL parameters:', emailFromUrl);
            setStatus('success');
            setMessage('Email confirmed! Logging you in...');
            
            try {
              // Get user data from backend using email from URL
              console.log('📞 Calling getUserDataByEmailApi with URL email:', emailFromUrl);
              const userDataResponse = await getUserDataByEmailApi(emailFromUrl);
              console.log('📋 User data response:', userDataResponse);
              
              if (userDataResponse.success && userDataResponse.user) {
                // Store user data (we'll need to get token from Supabase later)
                localStorage.setItem('userId', userDataResponse.user.id);
                localStorage.setItem('userRole', userDataResponse.user.role);
                localStorage.setItem('global_role', userDataResponse.user.global_role || '');
                
                console.log('✅ Auto-login successful with URL email!');
                toast.success('Welcome to MunQuest!');
                
                // Navigate based on user role
                const { role: userRole, global_role, organiserId, hasProfile } = userDataResponse.user;
                
                setTimeout(() => {
                  if (global_role === 'superuser') {
                    navigate('/super-user');
                  } else {
                    if (organiserId) {
                      navigate('/organiser');
                    } else if (userRole === 'student') {
                      if (hasProfile) {
                        navigate('/student-home');
                      } else {
                        navigate('/student-profile');
                      }
                    } else {
                      if (hasProfile) {
                        navigate('/teacher-home');
                      } else {
                        navigate('/teacher-profile');
                      }
                    }
                  }
                }, 2000);
              } else {
                throw new Error('Failed to get user data');
              }
            } catch (backendError) {
              console.error('❌ Backend login error with URL email:', backendError);
              setStatus('error');
              setMessage('Login failed. Please try logging in manually.');
              setTimeout(() => navigate('/login'), 3000);
            }
          } else {
            setStatus('error');
            setMessage('No active session found. Please log in.');
            setTimeout(() => navigate('/login'), 3000);
          }
        }
      } catch (error) {
        console.error('❌ Email confirmation error:', error);
        setStatus('error');
        setMessage('Email confirmation failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        // Loading state is handled by status
      }
    };

    handleEmailConfirmation();
  }, [navigate, searchParams]);

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

          {/* Right Section - Loading/Status */}
          <div className="flex flex-col items-center justify-center p-10 flex-1">
            <div className="w-full max-w-md">
              <div className="space-y-6">
                {/* Status Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    status === 'loading' ? 'bg-[#C2A46D]' : 
                    status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {status === 'loading' && (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                    )}
                    {status === 'success' && (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {status === 'error' && (
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-[#1E395D] text-[32px] font-bold text-center leading-normal">
                  {status === 'loading' && 'Confirming Email...'}
                  {status === 'success' && 'Welcome to MunQuest!'}
                  {status === 'error' && 'Confirmation Failed'}
                </h1>

                {/* Message */}
                <div className="text-center">
                  <p className="text-gray-700 text-[16px] leading-relaxed">
                    {message}
                  </p>
                  
                  {status === 'loading' && (
                    <div className="mt-4">
                      <p className="text-gray-600 text-[14px] leading-relaxed">
                        Please wait while we verify your email and log you in automatically.
                      </p>
                    </div>
                  )}
                  
                  {status === 'success' && (
                    <div className="mt-4">
                      <p className="text-green-600 text-[14px] leading-relaxed">
                        🎉 Your email has been confirmed! Redirecting you to your dashboard...
                      </p>
                    </div>
                  )}
                  
                  {status === 'error' && (
                    <div className="mt-4">
                      <p className="text-red-600 text-[14px] leading-relaxed">
                        Something went wrong. You'll be redirected to the login page.
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress Bar for Loading */}
                {status === 'loading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
                    <div className="bg-[#C2A46D] h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationRedirect;
