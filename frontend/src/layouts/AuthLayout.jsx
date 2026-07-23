/**
 * AuthLayout — Full-viewport centering shell for all authentication pages.
 *
 * WHY THIS EXISTS:
 * - Auth pages (Login, Register, ForgotPassword, etc.) must NOT render
 * inside the MainLayout (which adds Navbar, Footer, AnnouncementBar).
 * - This layout provides a clean, centered, full-screen environment.
 *
 * DESIGN DECISIONS:
 * - `min-h-screen` + `flex items-center justify-center` centers the card.
 * - `overflow-y-auto` allows tall cards (Register) to scroll on small screens.
 * - `py-12 px-4` provides comfortable breathing room on all screen sizes.
 * - Background uses brand beige (#f7f6f0) consistent with the Fabish design system.
 * - `select-none` prevents text selection on the layout shell.
 *
 * IMPORTANT: Auth page components (Login, Register, etc.) must NOT have their
 * own full-page wrapper. They must render only the card element as their root.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader'; // <-- PUTHU LOADER IMPORT

const AuthLayout = () => {
  const { loading } = useAuth(); // Auth load aagutha nu check panna

  // Show branded full-screen loader while auth state resolves
  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f7f6f0] flex items-center justify-center py-12 px-4 font-body select-none">
      <Outlet />
    </div>
  );
};

export default AuthLayout;