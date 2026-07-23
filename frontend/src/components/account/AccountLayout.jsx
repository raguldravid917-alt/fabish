import React from 'react';
import AccountHeader from './AccountHeader';
import AccountNavigation from './AccountNavigation';

const AccountLayout = ({
  user,
  activeTab,
  onTabChange,
  onAvatarUploadClick,
  counts,
  workspaceRef,
  children
}) => {
  return (
    <div className="w-full bg-[#FAF9F5] font-body min-h-screen text-left select-none pt-6 sm:pt-10 pb-28 lg:pb-12">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10">
        
        {/* Top Customer Summary Header */}
        <AccountHeader
          user={user}
          onTabChange={(tab) => onTabChange(tab, true)}
          onAvatarUploadClick={onAvatarUploadClick}
        />

        {/* Responsive Workspace Grid */}
        <div ref={workspaceRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative pt-4 scroll-mt-24">
          
          {/* Navigation Area (3 cols desktop, top scrollbar mobile) */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <AccountNavigation
              activeTab={activeTab}
              onTabChange={(tab) => onTabChange(tab, true)}
              counts={counts}
            />
          </div>

          {/* Main Active Tab Content Workspace (9 cols desktop) */}
          <main className="lg:col-span-9 min-w-0">
            {children}
          </main>

        </div>

      </div>
    </div>
  );
};

export default AccountLayout;
