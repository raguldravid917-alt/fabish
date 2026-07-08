import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import AuthCard from '../components/AuthCard';
import { Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShake(false);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setShake(true);
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setShake(true);
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setLoading(false);
      
      if (res.success !== false) {
        setSuccess(true);
        showToast('Password updated successfully!', 'success');
      } else {
        setError(res.message || 'Reset link invalid or expired');
        setShake(true);
        showToast(res.message || 'Reset link invalid or expired', 'error');
      }
    } catch (err) {
      setLoading(false);
      setShake(true);
      setError(err.message || 'Reset link invalid or expired');
      showToast(err.message || 'Reset link invalid or expired', 'error');
    }
  };

  return (
    <AuthCard title="Choose New Password" subtitle="Account Reset" error={error} shake={shake}>
      {success ? (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-[#729855] text-black p-5 text-xs font-semibold leading-relaxed">
            Your password has been reset successfully. You can now log in using your new credentials.
          </div>
          <Link 
            to="/account/login" 
            className="w-full inline-flex items-center justify-center bg-black text-white hover:bg-[#729855] py-4 px-6 font-heading font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 no-underline"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">New Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] focus:bg-white transition-all rounded-none"
            />
          </div>

          <div>
            <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">Confirm Password</label>
            <input
              type="password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 font-body text-sm text-black focus:outline-none focus:border-[#729855] focus:bg-white transition-all rounded-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
