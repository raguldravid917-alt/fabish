import React from 'react';
import { Bell, CheckCheck, Package, Tag, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useNotificationsQuery } from '../../hooks/queries/useNotificationsQuery';
import { notificationService } from '../../api/notificationService';
import { useQueryClient } from '@tanstack/react-query';

const AccountNotifications = () => {
  const { data: notifications = [], isLoading, isError, refetch } = useNotificationsQuery();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const handleMarkAllRead = async () => {
    queryClient.setQueryData(['notifications'], (old = []) =>
      Array.isArray(old) ? old.map((n) => ({ ...n, isRead: true })) : []
    );
    try {
      await notificationService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    queryClient.setQueryData(['notifications'], (old = []) =>
      Array.isArray(old)
        ? old.map((n) => ((n._id || n.id) === id ? { ...n, isRead: true } : n))
        : []
    );
    try {
      await notificationService.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  return (
    <div className="space-y-6 select-none">
      
      {/* Header & Controls */}
      <div className="bg-white border border-[#E8E6D9] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-extrabold uppercase tracking-wider text-[#1C2415]">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-heading font-extrabold">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 font-body">Updates on your orders, reward milestones, and restock alerts</p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="h-9 px-4 rounded-full bg-[#FAF9F5] border border-[#E8E6D9] hover:border-[#729855] text-[#1C2415] hover:text-[#729855] text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-[#729855]" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-8 h-8 text-[#729855] animate-spin mx-auto mb-2" />
          <span className="text-xs font-heading font-bold text-gray-500 uppercase tracking-widest">
            Loading Notifications...
          </span>
        </div>
      ) : isError ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-rose-200 p-8">
          <Bell className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-[#1C2415] mb-1">Failed to load notifications</h3>
          <p className="text-xs text-gray-500 font-body mb-4">Something went wrong while fetching your notifications.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-9 px-5 rounded-full bg-[#729855] text-white text-xs font-heading font-bold hover:bg-[#5f8045] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#E8E6D9] p-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-base text-[#1C2415] mb-1">No Notifications</h3>
          <p className="text-xs text-gray-500 font-body">You're all caught up! Important account updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isUnread = !item.isRead;
            const Icon = item.type === 'ORDER' ? Package : item.type === 'REWARD' ? Tag : item.type === 'STOCK' ? Heart : Bell;

            return (
              <div
                key={item._id || item.id}
                onClick={() => handleMarkAsRead(item._id || item.id, item.isRead)}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-4 transition-all cursor-pointer ${
                  isUnread ? 'border-[#729855] bg-[#EEF3E8]/30' : 'border-[#E8E6D9] opacity-80'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUnread ? 'bg-[#EEF3E8] text-[#3A4D23] border border-[#D2E2C5]' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`font-heading text-sm ${isUnread ? 'font-extrabold text-[#1C2415]' : 'font-semibold text-gray-700'}`}>
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-body shrink-0">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-body leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AccountNotifications;
