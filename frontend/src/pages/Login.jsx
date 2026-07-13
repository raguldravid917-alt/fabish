import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeOff, Eye } from 'lucide-react';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin, user } = useAuth(); // Destructured secure googleLogin context method
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/';

  React.useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      setLoading(false);
      if (result?.success !== false) {
        showToast('Welcome back!', 'success');
        navigate(redirect, { replace: true });
      } else {
        const msg = result?.message || 'Invalid email or password.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Login failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  // Google OAuth Success Trigger
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      setLoading(false);
      if (result?.success !== false) {
        showToast('Welcome back with Google!', 'success');
        navigate(redirect, { replace: true });
      } else {
        const msg = result?.message || 'Google Sign-In authentication failed.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Google login connection failed.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="bg-white w-full max-w-lg shadow-sm relative" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
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
            Registered Customer
          </span>
          <h1 className="text-3xl md:text-4xl font-heading font-semibold text-[#111] leading-tight">
            CUSTOMER SIGN IN
          </h1>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
              Email Address
            </label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="block text-xs font-bold text-[#333] tracking-widest uppercase mb-3">
              Password
            </label>
            <div className="relative w-full">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f4f7f8] border border-transparent focus:border-[#729855] focus:bg-white px-5 py-4 pr-14 text-base text-[#333] outline-none transition-colors placeholder:text-gray-400"
                required
                autoComplete="current-password"
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
          </div>

          {/* Forgot Password Link */}
          <div className="text-right -mt-2">
            <Link
              to="/account/forgot-password"
              className="text-xs font-bold text-[#729855] hover:text-[#111] tracking-widest uppercase transition-colors no-underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3e4e20] hover:bg-black text-white py-4 text-sm font-bold tracking-[0.2em] uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer border-none"
          >
            {loading ? (
              <Loader size="small" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Dynamic Google Sign-In mounting block matching your exact premium rectangular theme */}
        <div className="pt-6 flex flex-col items-center border-t border-gray-100/50 mt-6">
          <span className="block text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 text-center">
            Or Sign In with
          </span>
          <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setError('Google Sign-In failed.');
                showToast('Google Sign-In failed.', 'error');
              }}
              theme="outline"
              size="large"
              shape="rectangular"
              width="340px"
            />
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-100">
          <span className="text-sm text-[#555] font-medium mr-2">New Customer?</span>
          <Link
            to="/account/register"
            className="text-sm font-bold text-[#729855] hover:text-[#111] tracking-widest uppercase transition-colors no-underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;