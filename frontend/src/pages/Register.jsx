import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Sparkles, CheckSquare, Square } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

/** Computes password strength score (0-3), label, and color */
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
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submission
    setError('');

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms & Conditions to register.');
      return;
    }

    setLoading(true);
    try {
      const result = await register(cleanName, cleanEmail, password);
      setLoading(false);

      if (result?.success !== false) {
        showToast('Account created successfully! Welcome to Fabish.', 'success');
        navigate('/account/login', { replace: true });
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
          Create Account
        </span>
        <h1 className="serif-title text-2xl sm:text-3xl text-[#1c2415] font-bold uppercase tracking-wide">
          Customer Sign Up
        </h1>
      </div>

      {/* Controlled Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium mb-6 text-center animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="reg-name" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
            Your Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="reg-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#fdfcf7] border border-[#eae8d8] focus:border-[#729855] focus:bg-white focus:ring-2 focus:ring-[#729855]/20 pl-10 pr-4 py-3.5 text-sm text-[#1c2415] outline-none transition-all placeholder:text-gray-400 rounded-none"
              required
              autoComplete="name"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="reg-email" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="reg-email"
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

        {/* Password Field */}
        <div>
          <label htmlFor="reg-password" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-password"
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

          {/* Password Strength Indicator */}
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

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="reg-confirm-password" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="reg-confirm-password"
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

          {/* Password match indicator */}
          {confirmPassword && (
            <p className={`mt-1.5 text-[11px] font-bold ${password === confirmPassword ? 'text-[#729855]' : 'text-red-500'}`}>
              {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className="pt-1">
          <label 
            onClick={() => setAcceptTerms(!acceptTerms)}
            className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 hover:text-black select-none"
          >
            {acceptTerms ? (
              <CheckSquare className="w-4 h-4 text-[#729855] shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
            )}
            <span>
              I accept the <Link to="/pages/terms" className="text-[#729855] underline">Terms & Conditions</Link> and <Link to="/pages/privacy-policy" className="text-[#729855] underline">Privacy Policy</Link>.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2f3e10] hover:bg-black text-[#F9F9EB] py-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-xs mt-2"
        >
          {loading ? (
            <Loader size="small" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Sign In Footer Link */}
      <div className="text-center mt-6 pt-6 border-t border-[#eae8d8] text-xs">
        <span className="text-gray-500 font-medium mr-1.5">Already have an account?</span>
        <Link
          to="/account/login"
          className="font-bold text-[#729855] hover:text-black tracking-widest uppercase transition-colors no-underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;