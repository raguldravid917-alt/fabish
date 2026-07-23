import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Camera, Save, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AccountSettings = ({ user, onUpdateProfile, onUploadAvatar, onRemoveAvatar }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onUpdateProfile({ name, email, phone });
      showToast('Profile information updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB', 'error');
      return;
    }

    setUploadingPhoto(true);
    try {
      await onUploadAvatar(file);
      showToast('Profile avatar uploaded successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const [avatarError, setAvatarError] = useState(false);
  const rawAvatar = user?.avatar || user?.picture || user?.profileImage || null;
  const avatarUrl = !avatarError && rawAvatar
    ? (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:'))
      ? rawAvatar
      : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`
    : null;

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs">
        <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
          Profile Settings
        </h2>
        <p className="text-xs text-gray-500 font-body">Manage your personal details, avatar photo, and contact information</p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* Avatar Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#E8E6D9]">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name || 'User'}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#EEF3E8] shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#EEF3E8] border-2 border-[#D2E2C5] flex items-center justify-center text-[#3A4D23] font-heading text-3xl font-bold ring-4 ring-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-10 h-10 text-[#729855]" />}
              </div>
            )}

            {uploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h4 className="font-heading font-bold text-sm text-[#1C2415]">Profile Picture</h4>
            <p className="text-xs text-gray-500 font-body">JPG, PNG or WEBP up to 5MB. Square ratio recommended.</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
              <label className="h-9 px-4 rounded-xl bg-[#3A4D23] hover:bg-[#1C2415] text-white text-xs font-heading font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                Upload New Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={onRemoveAvatar}
                  disabled={uploadingPhoto}
                  className="h-9 px-3.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-500 hover:text-white text-rose-600 text-xs font-heading font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          <div>
            <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs font-body text-[#1C2415] outline-none focus:border-[#729855]"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs font-body text-[#1C2415] outline-none focus:border-[#729855]"
                placeholder="your.email@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-heading font-bold text-[#1C2415] uppercase tracking-wider block mb-1.5">
              Mobile Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-[#FAF9F5] border border-[#E8E6D9] rounded-xl text-xs font-body text-[#1C2415] outline-none focus:border-[#729855]"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E6D9]">
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-6 rounded-xl bg-[#729855] hover:bg-[#1C2415] text-white text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs border-none cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile Settings
                </>
              )}
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};

export default AccountSettings;
