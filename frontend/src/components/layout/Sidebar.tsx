import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const navItems = [
  { to: '/',            label: 'Dashboard',   icon: '📊' },
  { to: '/vehicles',    label: 'Vehicles',    icon: '🚛' },
  { to: '/drivers',     label: 'Drivers',     icon: '👤' },
  { to: '/trips',       label: 'Trips',       icon: '📍' },
  { to: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { to: '/fuel',        label: 'Fuel & Costs',icon: '⛽' },
  { to: '/reports',     label: 'Reports',     icon: '📈' },
];

export function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-lg font-bold text-brand-500">🚌 TransitOps</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Role badge */}
      {user && (
        <div className="px-6 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-500">{user.name}</p>
          <p className="text-xs text-brand-400 font-medium mt-0.5">{user.role.replace(/_/g, ' ')}</p>
        </div>
      )}
    </aside>
  );
}
