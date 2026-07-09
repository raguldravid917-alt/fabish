/**
 * MainLayout — Wraps public pages with AnnouncementBar + Header + Footer.
 * Uses React Router's <Outlet> for nested route rendering.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // <-- Auth state check panna
import AnnouncementBar from '../components/AnnouncementBar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from '../components/ui/Loader'; // <-- PUTHU LOADER IMPORT

const MainLayout = () => {
  const { loading } = useAuth(); // Initial auth state loading

  // Show branded full-screen loader while auth state initialises
  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;