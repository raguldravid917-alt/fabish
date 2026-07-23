import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import Loader from '../components/ui/Loader';

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: 'bg-gray-200', textColor: 'text-gray-400' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
  return { score: 3, label: 'Strong', color: 'bg-[#729855]', textColor: 'text-[#729855]' };
};

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setError('');

    if (password.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setLoading(false);

      if (res?.success !== false) {
        setSuccess(true);
        showToast('Password reset successfully!', 'success');
      } else {
        const msg = res?.message || 'Password reset link is invalid or expired.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Password reset link is invalid or expired.';
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
          Account Security
        </span>
        <h1 className="serif-title text-2xl sm:text-3xl text-[#1c2415] font-bold uppercase tracking-wide">
          Choose New Password
        </h1>
      </div>

      {success ? (
        /* Success State */
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center text-[#729855]">
            <div className="p-4 bg-green-50 rounded-full border border-green-100">
              <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
            </div>
          </div>

          <div className="bg-green-50/80 border border-[#729855]/30 text-[#2f3e10] p-4 text-xs font-medium leading-relaxed">
            Your credentials have been updated successfully. You can now sign in using your new password.
          </div>

          <Link
            to="/account/login"
            className="w-full inline-flex items-center justify-center bg-[#2f3e10] hover:bg-black text-[#F9F9EB] py-4 px-6 text-xs font-bold uppercase tracking-[0.2em] transition-colors no-underline shadow-xs"
          >
            Sign In Now
          </Link>
        </div>
      ) : (
        <>
          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium mb-6 text-center animate-fade-in flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <Link 
                to="/account/forgot-password" 
                className="underline text-red-900 font-bold text-[11px] no-underline"
              >
                Request New Password Link
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* New Password */}
            <div>
              <label htmlFor="reset-password" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#fdfcf7] border border-[#eae8d8] focus:border-[#729855] focus:bg-white focus:ring-2 focus:ring-[#729855]/20 pl-10 pr-12 py-3.5 text-sm text-[#1c2415] outline-none transition-all placeholder:text-gray-400 rounded-none"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black bg-transparent border-none cursor-pointer p-1 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength Meter */}
              {password && (
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-gray-500">Strength:</span>
                    <span className={`font-bold uppercase tracking-wider ${strength.textColor}`}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex-1 h-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="reset-confirm-password" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#fdfcf7] border border-[#eae8d8] focus:border-[#729855] focus:bg-white focus:ring-2 focus:ring-[#729855]/20 pl-10 pr-12 py-3.5 text-sm text-[#1c2415] outline-none transition-all placeholder:text-gray-400 rounded-none"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black bg-transparent border-none cursor-pointer p-1 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword && (
                <p className={`mt-1.5 text-[11px] font-bold ${password === confirmPassword ? 'text-[#729855]' : 'text-red-500'}`}>
                  {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2f3e10] hover:bg-black text-[#F9F9EB] py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-xs mt-2"
            >
              {loading ? (
                <Loader size="small" />
              ) : (
                'Save New Password'
              )}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-[#eae8d8] text-xs">
            <Link
              to="/account/login"
              className="font-bold text-[#729855] hover:text-black tracking-widest uppercase transition-colors no-underline"
            >
              ← Return to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
