import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/districts', label: 'Districts', icon: '🗺️' },
  { to: '/grants', label: 'Grant Reports', icon: '📋' },
  { to: '/review', label: 'Review', icon: '📝' },
];

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              M4
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">Mantra4Change</span>
              <span className="hidden sm:inline text-gray-400 text-xs ml-2">PBL Intelligence Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <span className="hidden sm:inline">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
