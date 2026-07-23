import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeOff, Eye, Lock, Mail, Sparkles, CheckSquare, Square } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedEmail'));
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/';

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', cleanEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const result = await login(cleanEmail, password);
      setLoading(false);

      if (result?.success !== false) {
        showToast('Welcome back to Fabish!', 'success');
        navigate(redirect, { replace: true });
      } else {
        const msg = result?.message || 'Invalid email or password.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      if (!credentialResponse?.credential) {
        const msg = 'Google authentication response missing token.';
        setError(msg);
        showToast(msg, 'error');
        setLoading(false);
        return;
      }
      const result = await googleLogin(credentialResponse.credential);
      setLoading(false);

      if (result?.success !== false) {
        showToast('Successfully signed in with Google!', 'success');
        navigate(redirect, { replace: true });
      } else {
        const msg = result?.message || 'Google Sign-In failed.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Google Sign-In connection failed.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div 
      className="bg-white w-full max-w-md border border-[#eae8d8] p-8 sm:p-10 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.04)] rounded-none relative select-none font-body"
    >
      {/* Decorative Sparkle */}
      <div className="absolute top-6 right-6 text-[#729855]">
        <Sparkles className="w-5 h-5" />
      </div>

      {/* Header */}
      <div className="text-center border-b border-[#eae8d8] pb-6 mb-8">
        <span className="block text-[#729855] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-2">
          Registered Customer
        </span>
        <h1 className="serif-title text-2xl sm:text-3xl text-[#1c2415] font-bold uppercase tracking-wide">
          Sign In
        </h1>
      </div>

      {/* Controlled Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-xs font-medium mb-6 text-center animate-fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="login-email" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
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
          <label htmlFor="login-password" className="block text-[11px] font-bold text-[#1c2415] tracking-widest uppercase mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fdfcf7] border border-[#eae8d8] focus:border-[#729855] focus:bg-white focus:ring-2 focus:ring-[#729855]/20 pl-10 pr-12 py-3.5 text-sm text-[#1c2415] outline-none transition-all placeholder:text-gray-400 rounded-none"
              required
              autoComplete="current-password"
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
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label 
            onClick={() => setRememberMe(!rememberMe)}
            className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black font-medium select-none"
          >
            {rememberMe ? (
              <CheckSquare className="w-4 h-4 text-[#729855]" />
            ) : (
              <Square className="w-4 h-4 text-gray-300" />
            )}
            <span>Remember me</span>
          </label>

          <Link
            to="/account/forgot-password"
            className="font-bold text-[#729855] hover:text-black tracking-wider uppercase text-[11px] no-underline transition-colors"
          >
            Forgot Password?
          </Link>
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
            'Sign In'
          )}
        </button>
      </form>

      {/* Google OAuth Section */}
      <div className="pt-6 flex flex-col items-center border-t border-[#eae8d8] mt-6 w-full">
        <span className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 text-center">
          Or Continue With
        </span>
        <div className="w-full flex justify-center items-center overflow-hidden min-h-[44px]">
          <div className="w-full max-w-[280px] xs:max-w-[320px] flex justify-center items-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Sign-In failed.');
                showToast('Google Sign-In failed.', 'error');
              }}
              theme="outline"
              size="large"
              shape="rectangular"
              type="standard"
              text="continue_with"
              logo_alignment="left"
              useOneTap={false}
            />
          </div>
        </div>
      </div>

      {/* Register Footer */}
      <div className="text-center mt-6 pt-6 border-t border-[#eae8d8] text-xs">
        <span className="text-gray-500 font-medium mr-1.5">New to Fabish?</span>
        <Link
          to="/account/register"
          className="font-bold text-[#729855] hover:text-black tracking-widest uppercase transition-colors no-underline"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;