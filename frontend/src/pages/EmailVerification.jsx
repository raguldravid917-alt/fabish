import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import { useToast } from '../context/ToastContext';
import { MailCheck } from 'lucide-react';
import Loader from '../components/ui/Loader';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Email verified successfully!', 'success');
      navigate('/');
    }, 1500);
  };

  return (
    <AuthCard title="Verify Email" subtitle="Customer Validation">
      <div className="space-y-6 text-center">
        <div className="flex justify-center text-[#729855]">
          <MailCheck className="w-16 h-16 stroke-1 animate-pulse" />
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Please click the validation button below to confirm your subscription and complete registration requirements.
        </p>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-[#2f3e10] hover:bg-black text-white py-4 px-6 font-heading font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border-none rounded-none shadow-sm"
        >
          {loading ? (
              <Loader size="small" />
          ) : (
            'Verify Email Address'
          )}
        </button>
      </div>
    </AuthCard>
  );
};

export default EmailVerification;
