/**
 * Register Page — Rendered inside AuthLayout (no Navbar/Footer).
 *
 * ROOT CAUSE FIX: Removed full-page outer `min-h-screen` wrapper.
 * AuthLayout handles all centering — this component renders only the card.
 *
 * IMPROVEMENTS:
 * - Proper form state + validation
 * - Password strength meter (live)
 * - Eye toggle aligned correctly (pr-14 on input)
 * - Connected to AuthContext register function
 * - Error/loading states handled
 */
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

/** Computes password strength: 0=empty, 1=weak, 2=fair, 3=strong */
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (score === 1) return { score: 1, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' };
  return { score: 3, label: 'Strong', color: 'bg-[#729855]', textColor: 'text-[#729855]' };
};

const Register = () => {
  const { register, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(name.trim(), email, password);
      setLoading(false);
      if (result?.success !== false) {
        showToast('Account created successfully! Welcome to Fabish.', 'success');
        navigate('/account/verify-email');
      } else {
        const msg = result?.message || 'Registration failed. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Registration failed. Please try again.';
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
            Create Account
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-[#111] leading-tight">
            CUSTOMER SIGN UP
          </h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
              Your Name
            </label>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 text-base text-[#333] outline-none transition-colors placeholder:text-gray-400"
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 text-base text-[#333] outline-none transition-colors placeholder:text-gray-400"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
              Password
            </label>
            <div className="relative w-full">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 pr-14 text-base text-[#333] outline-none transition-colors placeholder:text-gray-400"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] bg-transparent border-none cursor-pointer p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111] uppercase tracking-widest">Strength:</span>
                    <span className={`text-xs font-bold uppercase tracking-widest ${strength.textColor}`}>
                      {strength.label}
                    </span>
                  </div>
                  <span className="text-xs text-[#888]">a-z, A-Z, 0-9</span>
                </div>
                <div className="w-full h-1 bg-gray-200 flex gap-0.5">
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

          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
              Confirm Password
            </label>
            <div className="relative w-full">
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 pr-14 text-base text-[#333] outline-none transition-colors placeholder:text-gray-400"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#333] bg-transparent border-none cursor-pointer p-1 transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* Match indicator */}
            {confirmPassword && (
              <p className={`mt-2 text-xs font-bold ${password === confirmPassword ? 'text-[#729855]' : 'text-red-500'}`}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3e4e20] hover:bg-black text-white py-4 text-sm font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {loading ? (
              <Loader size="small" />
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <span className="text-sm text-[#555] font-medium mr-2">Already registered?</span>
          <Link
            to="/account/login"
            className="text-sm font-bold text-[#729855] hover:text-[#111] tracking-widest uppercase transition-colors no-underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;