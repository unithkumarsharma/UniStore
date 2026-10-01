import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import {
  setupRecaptcha,
  clearRecaptcha,
  sendPhoneOtp,
  verifyPhoneOtp,
  registerWithEmailAndVerification,
  loginWithEmailChecked,
  resendEmailVerification,
  sendResetPasswordEmail,
} from '../services/firebase';
import { api } from '../services/api';
import logoImg from '../assets/logo.png';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LoginPage: React.FC = () => {
  useDocumentTitle('Sign In / Register');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialMode = location.pathname.includes('register') || searchParams.get('mode') === 'signup'
    ? 'signup'
    : searchParams.get('mode') === 'forgot'
    ? 'forgot'
    : 'signin';

  const { login, loginWithGoogle, syncFirebaseSession } = useAuth();

  // Mode: 'signin' | 'signup' | 'forgot'
  const [pageMode, setPageMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  // Method: 'email' | 'phone'
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email Verification Screen States
  const [emailVerificationSent, setEmailVerificationSent] = useState<string | null>(null);
  const [passwordResetSent, setPasswordResetSent] = useState<string | null>(null);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<boolean>(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Phone OTP States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  // One-Tap Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/account');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In via Email & Password
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      try {
        await loginWithEmailChecked(email, password);
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/unverified-email') {
          setUnverifiedUser(fbErr.user);
          setError('Your email address has not been verified yet. Please check your inbox for the verification link.');
          setIsSubmitting(false);
          return;
        }
      }

      await login(email, password);
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Account via Email (with mandatory verification)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please provide your full name, email, and a secure password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fbResult = await registerWithEmailAndVerification(email, password);
      await api.register(email, fullName, password);
      setUnverifiedUser(fbResult.user);
      setEmailVerificationSent(email);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Could not complete registration. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Password Reset via Email
  const handleEmailForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await sendResetPasswordEmail(email.trim());
      setPasswordResetSent(email.trim());
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No registered account was found with this email.');
      } else {
        setError(err.message || 'Could not send reset link. Please check your email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send Phone OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pageMode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const verifier = await setupRecaptcha('recaptcha-container');
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${cleanDigits.slice(-10)}`;
      const confirmation = await sendPhoneOtp(formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err: any) {
      console.error('Phone OTP error:', err);
      clearRecaptcha('recaptcha-container');

      if (err.code === 'auth/invalid-app-credential') {
        setError(
          'Verification token expired. Please tap "Send Verification Code" again to continue.'
        );
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment before trying again.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota limit reached. Please try again shortly.');
      } else {
        setError(err.message || 'Unable to send SMS code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify Phone OTP (Sign In or Sign Up)
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fbResult = await verifyPhoneOtp(confirmationResult, otpCode);
      const cleanDigits = phoneNumber.replace(/\D/g, '');
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${cleanDigits.slice(-10)}`;

      await syncFirebaseSession({
        idToken: fbResult.token,
        phone: formattedPhone,
        fullName: fullName.trim() || `Customer ${formattedPhone.slice(-4)}`,
      });

      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please check and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify Phone OTP & Reset Password
  const handleVerifyPhoneResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await verifyPhoneOtp(confirmationResult, otpCode);
      const cleanDigits = phoneNumber.replace(/\D/g, '');
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber.trim() : `+91${cleanDigits.slice(-10)}`;

      await api.resetPassword({
        phone: formattedPhone,
        new_password: newPassword,
      });

      setPasswordResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Verification or password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAllFlows = (mode: 'signin' | 'signup' | 'forgot') => {
    clearRecaptcha('recaptcha-container');
    setPageMode(mode);
    setEmailVerificationSent(null);
    setPasswordResetSent(null);
    setPasswordResetSuccess(false);
    setError(null);
    setOtpSent(false);
    setOtpCode('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-14 bg-zinc-50/50">
      <div className="w-full max-w-md bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-9 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-3">
            <img src={logoImg} alt="UniStore Logo" className="h-8 sm:h-9 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950">
            {pageMode === 'signin'
              ? 'Welcome Back'
              : pageMode === 'signup'
              ? 'Create an Account'
              : 'Account Recovery'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {pageMode === 'signin'
              ? 'Sign in to access your curated orders and saved pieces'
              : pageMode === 'signup'
              ? 'Join UniStore for curated essentials and private member perks'
              : 'Choose your recovery method to update your credentials'}
          </p>
        </div>

        {/* Primary Mode Toggle: Sign In vs Create Account */}
        {pageMode !== 'forgot' && (
          <div className="flex bg-zinc-100 p-1 rounded-2xl mb-6 border border-zinc-200/60">
            <button
              type="button"
              onClick={() => resetAllFlows('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                pageMode === 'signin'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => resetAllFlows('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                pageMode === 'signup'
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Google One-Tap Social Button */}
        {pageMode !== 'forgot' && (
          <>
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 px-4 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs flex items-center justify-center gap-3 shadow-xs transition-all active:scale-[0.99]"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.89c2.28-2.09 3.65-5.17 3.65-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.05c-1.08.72-2.45 1.16-4.04 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.98 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {pageMode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                </span>
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-zinc-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative">
                or continue with
              </span>
              <div className="border-t border-zinc-200 w-full"></div>
            </div>
          </>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
            {unverifiedUser && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resendEmailVerification(unverifiedUser);
                    setResendSuccess(true);
                    setTimeout(() => setResendSuccess(false), 5000);
                  } catch {
                    setError('Could not resend verification link right now.');
                  }
                }}
                className="text-[11px] font-bold text-zinc-950 text-left underline"
              >
                {resendSuccess ? '✓ Verification link resent to your email!' : 'Resend Verification Link'}
              </button>
            )}
          </div>
        )}

        {/* CASE 1: EMAIL VERIFICATION SENT */}
        {emailVerificationSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-900 border border-zinc-200/60">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h2 className="text-base font-bold text-zinc-950">Verification Email Sent</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We've dispatched a secure activation link to <span className="font-bold text-zinc-900">{emailVerificationSent}</span>.
              Please click the link in your inbox to confirm your account, then sign in.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => resetAllFlows('signin')}
                className="w-full py-3 px-4 rounded-full bg-zinc-950 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        ) : passwordResetSent ? (
          /* CASE 2: PASSWORD RESET SENT */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-900 border border-zinc-200/60">
              <span className="material-symbols-outlined text-[32px]">lock_reset</span>
            </div>
            <h2 className="text-base font-bold text-zinc-950">Password Recovery Sent</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              We've sent password reset instructions to <span className="font-bold text-zinc-900">{passwordResetSent}</span>.
              Check your inbox or spam folder to complete the reset.
            </p>
            <div className="pt-2">
              <button
                onClick={() => resetAllFlows('signin')}
                className="w-full py-3 px-4 rounded-full bg-zinc-950 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        ) : passwordResetSuccess ? (
          /* CASE 3: PHONE PASSWORD RESET SUCCESS */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h2 className="text-base font-bold text-zinc-950">Password Reset Completed</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your password has been successfully updated via verified mobile OTP. You can now log into your account.
            </p>
            <div className="pt-2">
              <button
                onClick={() => resetAllFlows('signin')}
                className="w-full py-3 px-4 rounded-full bg-zinc-950 text-white text-xs font-bold shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
              >
                Sign In Now
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Method Tabs: Email vs Phone */}
            <div className="flex border-b border-zinc-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  clearRecaptcha('recaptcha-container');
                  setAuthMethod('email');
                  setError(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${
                  authMethod === 'email'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {pageMode === 'forgot'
                  ? 'Reset via Email'
                  : pageMode === 'signup'
                  ? 'Email (Verification)'
                  : 'Email & Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearRecaptcha('recaptcha-container');
                  setAuthMethod('phone');
                  setError(null);
                }}
                className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-all ${
                  authMethod === 'phone'
                    ? 'border-zinc-950 text-zinc-950'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {pageMode === 'forgot' ? 'Reset via Phone OTP' : 'Mobile Number (OTP)'}
              </button>
            </div>

            {/* METHOD 1: EMAIL */}
            {authMethod === 'email' && (
              <form
                onSubmit={
                  pageMode === 'signin'
                    ? handleEmailSignIn
                    : pageMode === 'signup'
                    ? handleEmailSignUp
                    : handleEmailForgotPassword
                }
                className="space-y-4"
              >
                {pageMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                  />
                </div>

                {pageMode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-zinc-700">Password</label>
                      {pageMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => resetAllFlows('forgot')}
                          className="text-[11px] text-zinc-900 font-semibold hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={pageMode === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all mt-2"
                >
                  {isSubmitting
                    ? 'Authenticating...'
                    : pageMode === 'signin'
                    ? 'Sign In with Email'
                    : pageMode === 'signup'
                    ? 'Create Account & Send Verification'
                    : 'Send Password Reset Link'}
                </button>
              </form>
            )}

            {/* METHOD 2: PHONE OTP */}
            {authMethod === 'phone' && (
              <div className="space-y-4">
                <div id="recaptcha-container"></div>

                {!otpSent ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    {pageMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Arjun Sharma"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">Mobile Phone Number</label>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-700">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">We will send a 6-digit OTP code to this number</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                      {isSubmitting ? 'Sending OTP...' : 'Send Verification Code'}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={pageMode === 'forgot' ? handleVerifyPhoneResetPassword : handleVerifyPhoneOtp}
                    className="space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-zinc-700">Enter 6-Digit OTP</label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[11px] text-zinc-900 font-semibold hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-center tracking-widest text-base font-bold text-zinc-950 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                      />
                      <p className="text-[11px] text-zinc-500 mt-1 text-center">SMS code dispatched to {phoneNumber}</p>
                    </div>

                    {pageMode === 'forgot' && (
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">Set New Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-all"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-6 rounded-full bg-zinc-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-zinc-800 active:scale-95 transition-all"
                    >
                      {isSubmitting
                        ? 'Verifying...'
                        : pageMode === 'forgot'
                        ? 'Verify & Save New Password'
                        : pageMode === 'signup'
                        ? 'Verify OTP & Create Account'
                        : 'Verify & Sign In'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Bottom Mode Switchers */}
            <div className="mt-6 text-center text-xs text-zinc-500">
              {pageMode === 'forgot' ? (
                <button
                  type="button"
                  onClick={() => resetAllFlows('signin')}
                  className="font-bold text-zinc-950 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Back to Sign In</span>
                </button>
              ) : pageMode === 'signin' ? (
                <>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => resetAllFlows('signup')}
                    className="font-bold text-zinc-950 hover:underline"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => resetAllFlows('signin')}
                    className="font-bold text-zinc-950 hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* Security Trust Mark */}
        <div className="mt-6 pt-5 border-t border-zinc-100 text-center">
          <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
            <span>256-bit encrypted authentication & privacy standard</span>
          </p>
        </div>
      </div>
    </div>
  );
};
