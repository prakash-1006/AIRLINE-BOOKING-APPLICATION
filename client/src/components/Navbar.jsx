import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-flight-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-flight-500 p-2 rounded-lg group-hover:bg-flight-400 transition-colors">
                <Plane className="h-6 w-6 text-white transform -rotate-45" />
              </div>
              <span className="font-bold text-xl tracking-tight">AeroFlow</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 hover:text-flight-100 transition-colors px-3 py-2 rounded-md font-medium"
                >
                  <User className="h-5 w-5" />
                  <span>{user.full_name?.split(' ')[0] || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-flight-800 hover:bg-flight-700 px-4 py-2 rounded-md transition-colors font-medium border border-flight-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:text-flight-100 px-3 py-2 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-flight-500 hover:bg-flight-400 text-white px-5 py-2 rounded-md font-medium transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
