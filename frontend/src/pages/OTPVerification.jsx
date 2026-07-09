import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { useToast } from '../context/ToastContext';
import Loader from '../components/ui/Loader';

const OTPVerification = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setShake(false);

    if (code.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      setShake(true);
      return;
    }

    setLoading(true);
    // Simulating token checks
    setTimeout(() => {
      setLoading(false);
      showToast('OTP verified successfully!', 'success');
      navigate('/');
    }, 1200);
  };

  return (
    <AuthCard title="Verify Code" subtitle="Security Check" error={error} shake={shake}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-xs text-gray-500 leading-relaxed text-center">
          We have sent a 6-digit verification code to your registered device. Enter the code below to complete authorization.
        </p>

        <div>
          <label className="font-heading text-[10px] font-bold uppercase tracking-[0.15em] text-[#555] mb-2 block">
            Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full bg-[#fcfcfa] border border-[#eae8d8] px-4 py-3.5 text-center font-mono text-lg font-bold tracking-[0.5em] text-black focus:outline-none focus:border-[#729855] focus:bg-white transition-all rounded-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-sm"
        >
          {loading ? (
              <Loader size="small" />
          ) : (
            'Verify OTP Code'
          )}
        </button>

        <div className="text-center text-xs font-bold text-gray-500 select-none pt-4 border-t border-[#eae8d8]">
          Didn't receive it?{' '}
          <button 
            type="button" 
            onClick={() => showToast('Verification code resent!', 'success')} 
            className="text-[#729855] hover:text-black uppercase tracking-wider ml-1 bg-transparent border-none cursor-pointer transition-colors"
          >
            Resend Code
          </button>
        </div>
      </form>
    </AuthCard>
  );
};

export default OTPVerification;
