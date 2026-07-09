/**
 * ForgotPassword Page — Rendered inside AuthLayout (no Navbar/Footer).
 *
 * ROOT CAUSE FIX: Removed full-page outer `min-h-screen` wrapper.
 * AuthLayout handles all centering — this component renders only the card.
 *
 * IMPROVEMENTS:
 * - Real API call via useAuth().forgotPassword
 * - Success state shown after submission
 * - Loading + error states
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      setLoading(false);
      if (result?.success !== false) {
        setSent(true);
        showToast('Password reset link sent to your email!', 'success');
      } else {
        const msg = result?.message || 'No account found with that email address.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Something went wrong. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    /* Root element is the card — AuthLayout handles all centering */
    <div className="bg-white w-full max-w-lg shadow-sm relative" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
      {/* Sparkle accent icon */}
      <svg
        className="absolute top-8 right-8 w-6 h-6 text-[#729855] opacity-70"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v18M3 12h18M5.5 5.5l13 13M18.5 5.5l-13 13" />
      </svg>

      <div className="px-10 pt-12 pb-10 md:px-14 md:pt-14 md:pb-12">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="block text-[#729855] text-xs font-bold tracking-[0.25em] uppercase mb-3">
            Password Recovery
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-[#111] leading-tight mb-5">
            RESET PASSWORD
          </h1>
          {!sent && (
            <p className="text-sm text-[#666] leading-relaxed max-w-sm mx-auto">
              Enter your email address below. If your account is found, we will send a secure link to reset your credentials.
            </p>
          )}
        </div>

        {sent ? (
          /* Success state */
          <div className="space-y-6 text-center">
            <div className="flex justify-center text-[#729855]">
              <MailCheck className="w-16 h-16 stroke-1" />
            </div>
            <div className="bg-green-50 border border-[#729855]/30 text-[#2f3e10] px-5 py-4 text-sm font-medium leading-relaxed">
              A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.
            </div>
            <Link
              to="/account/login"
              className="w-full inline-flex items-center justify-center bg-[#3e4e20] hover:bg-black text-white py-4 text-sm font-bold tracking-[0.2em] uppercase transition-colors no-underline"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <>
            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 text-base text-[#333] outline-none transition-colors placeholder:text-gray-400"
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3e4e20] hover:bg-black text-white py-4 text-sm font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {loading ? (
                  <Loader size="small" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="text-center mt-8">
              <Link
                to="/account/login"
                className="text-sm font-bold text-[#729855] hover:text-[#111] tracking-widest uppercase transition-colors no-underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;