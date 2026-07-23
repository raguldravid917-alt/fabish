import React from 'react';
import { User as UserIcon, Camera, Sparkles, Award, Shield, Settings, Heart, Clock } from 'lucide-react';

const AccountHeader = ({ user, onTabChange, onAvatarUploadClick }) => {
  const memberSinceYear = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : '2026';

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}`
    : null;

  const rewardPoints = user?.rewardPoints || user?.points || 450;
  const tier = user?.role === 'admin' ? 'VIP Admin' : (rewardPoints > 500 ? 'Gold Tier' : 'Silver Tier');

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#FAF9F5] via-[#F4F2E6] to-[#FAF9F5] rounded-3xl border border-[#E8E6D9] p-6 sm:p-8 shadow-xs mb-8">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#729855]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#3A4D23]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        
        {/* Left: User Avatar & Main Details */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          
          {/* Avatar Container with Upload Badge */}
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name || 'Customer'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-white shadow-md transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#EEF3E8] border-2 border-[#D2E2C5] flex items-center justify-center text-[#3A4D23] font-heading text-2xl font-bold ring-4 ring-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-10 h-10 text-[#729855]" />}
              </div>
            )}

            <button
              type="button"
              onClick={onAvatarUploadClick}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#3A4D23] text-white flex items-center justify-center shadow-md hover:bg-[#1C2415] transition-all cursor-pointer border-2 border-white"
              title="Upload Profile Picture"
              aria-label="Upload Profile Picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Text Info */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#729855]/15 border border-[#729855]/30 text-[#3A4D23] font-heading font-bold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#729855]" />
                {tier}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-heading font-medium text-gray-500">
                <Clock className="w-3 h-3 text-gray-400" />
                Member since {memberSinceYear}
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1C2415] tracking-tight">
              Welcome back, {user?.name || 'Valued Customer'}!
            </h1>
            <p className="text-xs sm:text-sm font-body text-gray-600 font-normal">
              {user?.email || 'customer@fabish.com'}
            </p>
          </div>
        </div>

        {/* Right: Quick Loyalty Points Summary & Shortcuts */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 border-[#E8E6D9] pt-4 md:pt-0">
          
          {/* Rewards Points Badge */}
          <div className="bg-white/90 backdrop-blur-sm border border-[#E8E6D9] rounded-2xl px-5 py-3 shadow-xs text-center md:text-right w-full sm:w-auto">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-gray-500 block">
              ORGANIC REWARD POINTS
            </span>
            <div className="flex items-center justify-center md:justify-end gap-1.5 mt-0.5">
              <Award className="w-5 h-5 text-[#729855]" />
              <span className="font-heading font-extrabold text-2xl text-[#1C2415]">
                {rewardPoints}
              </span>
              <span className="text-xs font-heading font-bold text-[#729855]">PTS</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onTabChange('settings')}
              className="flex-1 sm:flex-initial h-9 px-4 rounded-xl bg-white border border-[#E8E6D9] hover:border-[#729855] text-[#1C2415] hover:text-[#729855] text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              type="button"
              onClick={() => onTabChange('security')}
              className="flex-1 sm:flex-initial h-9 px-4 rounded-xl bg-[#3A4D23] hover:bg-[#1C2415] text-white text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer border-none"
            >
              <Shield className="w-3.5 h-3.5" />
              Security
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AccountHeader;
