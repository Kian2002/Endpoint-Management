'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Shield, Activity, AlertTriangle, User, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage?: 'dashboard' | 'endpoints' | 'alerts';
  showAuthButtons?: boolean;
}

export default function Navbar({ currentPage, showAuthButtons = false }: NavbarProps) {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const getActiveClass = (page: string) => {
    return currentPage === page 
      ? 'text-blue-600 border-b-2 border-blue-600' 
      : 'text-gray-700 hover:text-blue-600';
  };

  const getMobileActiveClass = (page: string) => {
    return currentPage === page 
      ? 'text-blue-600 bg-blue-50' 
      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50';
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Shield className="h-8 w-8 text-blue-600" />
            <span>Endpoint Manager</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${getActiveClass('dashboard')}`}
            >
              <Activity className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
            <Link
              href="/endpoints"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${getActiveClass('endpoints')}`}
            >
              <Shield className="h-4 w-4 mr-1" />
              Endpoints
            </Link>
            <Link
              href="/alerts"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${getActiveClass('alerts')}`}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Alerts
            </Link>
          </nav>

          {/* Right side - Auth buttons or User menu */}
          <div className="hidden md:flex items-center space-x-4">
            {showAuthButtons ? (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Get Started
                </Link>
              </>
            ) : session ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>Welcome, {session.user?.name || session.user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign out
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/dashboard"
                className={`block px-3 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors ${getMobileActiveClass('dashboard')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/endpoints"
                className={`block px-3 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors ${getMobileActiveClass('endpoints')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                <span>Endpoints</span>
              </Link>
              <Link
                href="/alerts"
                className={`block px-3 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors ${getMobileActiveClass('alerts')}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Alerts</span>
              </Link>
              
              {showAuthButtons ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block mx-3 mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              ) : session ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-700 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{session.user?.name || session.user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-2 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 