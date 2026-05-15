import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore.js';

function Navbar({ onMenuClick }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-200 transition hover:border-cyan-300/60 hover:bg-cyan-300/10 lg:hidden"
            onClick={onMenuClick}
            type="button"
          >
            <span className="block h-0.5 w-5 bg-current before:mt-[-6px] before:block before:h-0.5 before:w-5 before:bg-current after:mt-[10px] after:block after:h-0.5 after:w-5 after:bg-current" />
          </button>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              Dashboard
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.email || user?.name || 'Authenticated user'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-white">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-emerald-300">Online</p>
          </div>

          <button
            className="rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-rose-300/60 hover:bg-rose-400/10 hover:text-rose-100 sm:px-4"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
