import { NavLink } from 'react-router-dom';

const navigationItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Projects', path: '/projects' },

  // { label: 'Workflows', path: '/workflows' },
  // { label: 'Runs', path: '/runs' },
  // { label: 'Settings', path: '/settings' },
];

function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full flex-col border-r border-white/10 bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
          Workflow
        </p>
        <h2 className="mt-2 text-lg font-bold text-white">Orchestrator</h2>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigationItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              [
                'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-cyan-300 text-slate-950'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
            end={item.path === '/'}
            key={item.path}
            onClick={onNavigate}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs leading-5 text-slate-400">
        Secure workspace access powered by persisted JWT sessions.
      </div>
    </aside>
  );
}

export default Sidebar;
