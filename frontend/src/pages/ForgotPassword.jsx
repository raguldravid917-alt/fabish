import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck, Mail, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
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
    if (loading) return; // Prevent double submit
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(cleanEmail);
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
      const msg = err?.message || 'Failed to send password reset email. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div 
      className="bg-white w-full max-w-md border border-[#eae8d8] p-8 sm:p-10 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-none relative select-none font-body"
    >
      {/* Sparkle Accent */}
      <div className="absolute top-6 right-6 text-[#729855]">
        <Sparkles className="w-5 h-5" />
      </div>

      {/* Header */}
      <div className="text-center border-b border-[#eae8d8] pb-6 mb-8">
        <span className="block text-[#729855] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-2">
          Password Recovery
        </span>
        <h1 className="serif-title text-2xl sm:text-3xl text-[#1c2415] font-bold uppercase tracking-wide">
          Reset Password
        </h1>
        {!sent && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
            Enter your email below. If registered, we will send a secure password recovery link.
          </p>
        )}
      </div>

      {sent ? (
        /* Success confirmation state */
        <div className="space-y-6 text-center animate-fade-in">
          <div className="flex justify-center text-[#729855]">
            <div className="p-4 bg-green-50 rounded-full border border-green-100">
              <MailCheck className="w-12 h-12 stroke-[1.5]" />
            </div>
          </div>

          <div className="bg-green-50/80 border border-[#729855]/30 text-[#2f3e10] p-4 text-xs font-medium leading-relaxed">
            A password reset link has been dispatched to <strong className="text-black">{email}</strong>. Please inspect your inbox and spam folder.
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#eae8d8]/60 hover:bg-[#eae8d8] text-black text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Resend Reset Email</span>
            </button>

            <Link
              to="/account/login"
              className="w-full flex items-center justify-center gap-2 bg-[#2f3e10] hover:bg-black text-[#F9F9EB] py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors no-underline shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Controlled Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium mb-6 text-center animate-fade-in flex flex-col items-center gap-1">
              <span>{error}</span>
              <button 
                type="button" 
                onClick={handleSubmit}
                className="underline text-red-900 font-bold bg-transparent border-none cursor-pointer text-[11px]"
              >
                Try Again
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="forgot-email" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#fdfcf7] border border-[#eae8d8] focus:border-[#729855] focus:bg-white focus:ring-2 focus:ring-[#729855]/20 pl-10 pr-4 py-3.5 text-sm text-[#1c2415] outline-none transition-all placeholder:text-gray-400 rounded-none"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f3e10] hover:bg-black text-[#F9F9EB] py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-xs mt-2"
            >
              {loading ? (
                <Loader size="small" />
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Sign In Link */}
          <div className="text-center mt-6 pt-6 border-t border-[#eae8d8] text-xs">
            <Link
              to="/account/login"
              className="font-bold text-[#729855] hover:text-black tracking-widest uppercase transition-colors no-underline inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;