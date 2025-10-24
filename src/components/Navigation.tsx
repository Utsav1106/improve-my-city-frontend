import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
<span className="text-xl font-bold text-black">
                Improve My City
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex space-x-1">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/report"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/report') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Report Issue
                </Link>
                <Link
                  to="/my-issues"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/my-issues') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  My Issues
                </Link>
                <Link
                  to="/resolved"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive('/resolved') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Resolved
                </Link>
                {user.isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive('/admin') ? 'bg-purple-50 text-purple-700' : 'text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-blue-500"
                  />
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.isAdmin && (
                      <p className="text-xs text-purple-600 font-semibold">Admin</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 rounded-lg hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
