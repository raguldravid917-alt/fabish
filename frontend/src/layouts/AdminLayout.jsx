import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader'; // <-- PUTHU LOADER IMPORT
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  UserCheck,
  Ticket,
  Star,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Headphones,
  Users2,
  Handshake,
  FileText,
} from 'lucide-react';

const ADMIN_LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/users', label: 'Staff Roles', icon: UserCheck },
  { path: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/blogs', label: 'Blogs', icon: BookOpen },
  { path: '/admin/contacts', label: 'Contacts', icon: MessageSquare },
  { path: '/admin/support', label: 'Support Tickets', icon: Headphones },
  { path: '/admin/team', label: 'Our Team', icon: Users2 },
  { path: '/admin/partnerships', label: 'Partnerships', icon: Handshake },
  { path: '/admin/footer-pages', label: 'Footer Pages', icon: FileText },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  React.useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('body-scroll-lock');
    } else {
      document.body.classList.remove('body-scroll-lock');
    }
    return () => {
      document.body.classList.remove('body-scroll-lock');
    };
  }, [isSidebarOpen]);

  // Listen for Escape key to close mobile sidebar
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Guard: redirect non-admin users (only after auth state is fully resolved)
  React.useEffect(() => {
    if (loading) return; // Don't redirect while auth state is being resolved
    if (user === null) {
      navigate('/account/login?redirect=/admin/dashboard');
    } else if (user && !user.isAdmin) {
      navigate('/unauthorized');
    }
  }, [user, loading, navigate]);

  // Show branded full-screen loader while auth state resolves
  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  const handleLogoutClick = async () => {
    await logout();
    navigate('/');
  };

  const NavLinkItem = ({ link }) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.path;
    return (
      <Link
        to={link.path}
        onClick={() => setIsSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-none no-underline ${isActive
            ? 'bg-[#2f3e10] text-[#F9F9EB]'
            : 'text-gray-600 hover:text-black hover:bg-[#eae8d8]/30'
          }`}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <div className="bg-[#f7f6f0] min-h-screen flex font-body">
      {/* Sidebar Panel - Desktop (Always Visible) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-[#eae8d8] shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="h-[66px] px-6 border-b border-[#eae8d8] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="serif-title text-xl font-bold uppercase tracking-widest text-[#2f3e10]">Fabish Admin</span>
          </Link>
          <Sparkles className="w-4 h-4 text-[#729855]" />
        </div>

        {/* Links Navigation */}
        <nav className="flex-grow py-6 overflow-y-auto space-y-1 pr-2 no-scrollbar">
          {ADMIN_LINKS.map((link) => (
            <NavLinkItem key={link.path} link={link} />
          ))}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[#eae8d8] mt-auto">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer rounded-none"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Slide-out Sidebar - Mobile & Tablet */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[1100] lg:hidden flex">
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          ></div>
          <aside className="relative flex flex-col w-64 bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-brand-border">
              <span className="serif-title text-lg font-bold text-[#2f3e10] uppercase tracking-wider">Store Operations</span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-black bg-transparent border-none cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-grow space-y-1.5">
              {ADMIN_LINKS.map((link) => (
                <NavLinkItem key={link.path} link={link} />
              ))}
            </nav>

            <div className="border-t border-[#eae8d8] pt-6 mt-6">
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#eae8d8] h-[66px] px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-black hover:text-[#729855] p-2 bg-transparent border-none cursor-pointer"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-3">
              {user.avatar && (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${user.avatar}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#eae8d8]"
                />
              )}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Admin Panel</span>
                <h2 className="text-sm font-semibold text-black uppercase tracking-wider mt-0.5 select-none">
                  Hello, {user.name}
                </h2>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 select-none">
            <Link to="/" className="text-xs font-bold text-gray-500 hover:text-[#729855] uppercase tracking-wider no-underline">
              View Storefront
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-grow p-6 md:p-12">
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;