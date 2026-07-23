import React from 'react';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Heart,
  Clock,
  Award,
  Bell,
  Settings,
  Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: Package, badgeKey: 'ordersCount' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, badgeKey: 'addressesCount' },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, badgeKey: 'wishlistCount' },
  { id: 'recently-viewed', label: 'Recently Viewed', icon: Clock },
  { id: 'rewards', label: 'Reward Points', icon: Award },
  { id: 'notifications', label: 'Notifications', icon: Bell, badgeKey: 'unreadNotificationsCount' },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
];

const AccountNavigation = ({ activeTab, onTabChange, counts = {} }) => {
  return (
    <nav className="w-full select-none">
      
      {/* MOBILE SCROLLABLE PILL NAV (360px - 768px) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none snap-x">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeValue = item.badgeKey ? counts[item.badgeKey] : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`snap-start shrink-0 h-10 px-4 rounded-full text-xs font-heading font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[#729855] text-white border-[#729855] shadow-xs'
                  : 'bg-white text-[#374151] border-[#E8E6D9] hover:border-[#729855] hover:text-[#729855]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#729855]'}`} />
              <span>{item.label}</span>
              {typeof badgeValue === 'number' && badgeValue > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EEF3E8] text-[#3A4D23]'
                }`}>
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DESKTOP VERTICAL SIDEBAR NAV (1024px+) */}
      <div className="hidden lg:flex flex-col gap-1.5 bg-white border border-[#E8E6D9] rounded-3xl p-3 shadow-xs">
        <span className="px-4 pt-3 pb-2 text-[10px] font-heading font-extrabold uppercase tracking-widest text-gray-400">
          Account Menu
        </span>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badgeValue = item.badgeKey ? counts[item.badgeKey] : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full h-11 px-4 rounded-2xl text-xs font-heading font-bold flex items-center justify-between transition-all cursor-pointer border-none text-left ${
                isActive
                  ? 'bg-[#729855] text-white shadow-xs'
                  : 'bg-transparent text-[#374151] hover:bg-[#EEF3E8] hover:text-[#3A4D23]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#729855]'}`} />
                <span>{item.label}</span>
              </div>

              {typeof badgeValue === 'number' && badgeValue > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EEF3E8] text-[#3A4D23]'
                }`}>
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </nav>
  );
};

export default AccountNavigation;
