import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Menu, X, Plus, LogOut, LayoutDashboard } from 'lucide-react'

const Navigation = () => {
  const navigate = useNavigate()
  const { user, isAuth, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setUserMenuOpen(false)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-2xl text-blue-600 hover:text-blue-700 transition"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              B
            </div>
            Build2Hire
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/projects"
              className="text-slate-700 hover:text-blue-600 font-medium text-sm transition"
            >
              Projects
            </Link>

            {isAuth && user?.role === 'Student' && (
              <Link
                to="/student-dashboard"
                className="text-slate-700 hover:text-blue-600 font-medium text-sm transition flex items-center gap-1"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}

            {isAuth && user?.role === 'Hr' && (
              <Link
                to="/hr-dashboard"
                className="text-slate-700 hover:text-blue-600 font-medium text-sm transition flex items-center gap-1"
              >
                <LayoutDashboard size={16} />
                Talent Discovery
              </Link>
            )}

            {isAuth && user?.role === 'Admin' && (
              <Link
                to="/admin-dashboard"
                className="text-slate-700 hover:text-blue-600 font-medium text-sm transition flex items-center gap-1"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}

            {isAuth && user?.role === 'Student' && (
              <Link
                to="/my-requests"
                className="text-slate-700 hover:text-blue-600 font-medium text-sm transition"
              >
                My Requests
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuth ? (
              <>

                {user?.role === 'Student' && (
                  <Link
                    to="/create-project"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                  >
                    <Plus size={18} />
                    New Project
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {user?.email}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">
                          {user?.role}
                        </p>
                      </div>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition font-medium text-sm flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-blue-600 font-medium text-sm transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-slate-900" />
            ) : (
              <Menu size={24} className="text-slate-900" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-3 pb-4">
            <Link
              to="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              Projects
            </Link>

            {isAuth && user?.role === 'Student' && (
              <Link
                to="/student-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}

            {isAuth && user?.role === 'Hr' && (
              <Link
                to="/hr-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                Talent Discovery
              </Link>
            )}

            {isAuth && user?.role === 'Admin' && (
              <Link
                to="/admin-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium flex items-center gap-2"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}

            {isAuth && user?.role === 'Student' && (
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium"
              >
                My Requests
              </Link>
            )}

            <div className="border-t border-slate-200 pt-3 space-y-2">
              {isAuth ? (
                <>
                  {user?.role === 'Student' && (
                    <Link
                      to="/create-project"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm text-center flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      New Project
                    </Link>
                  )}

                  {/* User Info */}
                  <div className="px-4 py-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {user?.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">
                      {user?.role}
                    </p>
                  </div>

           
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation