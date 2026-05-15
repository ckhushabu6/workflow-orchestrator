import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Navbar from '../components/layout/Navbar.jsx';
import Sidebar from '../components/layout/Sidebar.jsx';

function AppLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <Sidebar />
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
            type="button"
          />
          <div className="relative h-full w-80 max-w-[85vw] shadow-2xl shadow-black/40">
            <Sidebar onNavigate={closeMobileMenu} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
