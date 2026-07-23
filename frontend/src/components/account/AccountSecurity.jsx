import React, { useState } from 'react';
import { Shield, Lock, Key, LogOut, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AccountSecurity = ({ user, onUpdateProfile, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateProfile({ password: newPassword });
      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'None', width: '0%', color: 'bg-gray-200' };
    if (pwd.length < 6) return { label: 'Weak', width: '30%', color: 'bg-rose-500' };
    if (pwd.length < 10) return { label: 'Medium', width: '65%', color: 'bg-amber-500' };
    return { label: 'Strong', width: '100%', color: 'bg-[#729855]' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs">
        <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
          Security &amp; Account Protection
        </h2>
        <p className="text-xs text-gray-500 font-body">Manage account authentication, password credentials, and active session logout</p>
      </div>

      {/* Auth Status Banner */}
      <div className="bg-[#FAF9F5] border border-[#E8E6D9] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF3E8] border border-[#D2E2C5] flex items-center justify-center text-[#3A4D23]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-[#1C2415]">
              Authentication Status
            </h4>
            <p className="text-xs text-gray-500 font-body">
              {user?.googleId || user?.isGoogleAuth ? 'Connected via Google OAuth 2.0 Secure Sign-In' : 'Standard Password Authentication Active'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-heading font-extrabold uppercase">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Session Encrypted (256-bit SSL)
        </span>
      </div>

      {/* Change Password Form */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-heading font-extrabold text-base text-[#1C2415] mb-1">
            Change Account Password
          </h3>
          <p className="text-xs text-gray-500 font-body">Choose a strong, unique password to secure your personal address and order data.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div>
            <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs font-body text-[#1C2415] outline-none focus:border-[#729855]"
                placeholder="At least 6 characters"
              />
            </div>
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-heading font-bold text-gray-500">
                  <span>Password Strength</span>
                  <span className="text-[#1C2415]">{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs font-body text-[#1C2415] outline-none focus:border-[#729855]"
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-xl bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs border-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Logout Session Container */}
      <div className="bg-rose-50/50 border border-rose-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-heading font-bold text-sm text-rose-900 mb-0.5">
            Log Out of Session
          </h4>
          <p className="text-xs text-rose-700 font-body">Sign out of your Fabish customer account on this browser device.</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs border-none cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Log Out Now
        </button>
      </div>

    </div>
  );
};

export default AccountSecurity;
