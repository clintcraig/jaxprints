import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const leaveTimeout = useRef<number | null>(null);

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `text-sm font-medium transition-colors hover:text-jax-blue ${isActive ? 'text-jax-blue' : 'text-gray-600'}`;

  const handleMouseEnter = () => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
    }
    setIsDropdownOpen(true);
  };
  
  const handleMouseLeave = () => {
    leaveTimeout.current = window.setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200); // Delay to allow cursor to move to the dropdown
  };

  useEffect(() => {
    // Close dropdown on route change
    setIsDropdownOpen(false);
  }, [location]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (leaveTimeout.current) {
        clearTimeout(leaveTimeout.current);
      }
    };
  }, []);


  const isAiLabActive = location.pathname.startsWith('/ai-lab');

  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-heading font-bold text-jax-black tracking-tighter">
              JAX<span className="text-jax-blue">PRINT</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClasses}>Home</NavLink>
            <NavLink to="/services" className={navLinkClasses}>Services</NavLink>
            <NavLink to="/gallery" className={navLinkClasses}>Jersey Gallery</NavLink>
            
            {/* AI Lab Dropdown */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`text-sm font-medium transition-colors hover:text-jax-blue flex items-center ${isAiLabActive ? 'text-jax-blue' : 'text-gray-600'}`}>
                AI Lab
                <svg className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute -left-4 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                  <NavLink to="/ai-lab/photo-restoration" className={({ isActive }) => `block px-4 py-2 text-sm ${isActive ? 'text-jax-blue bg-blue-50' : 'text-gray-700'} hover:bg-blue-50`}>
                    Photo Restoration
                  </NavLink>
                  <NavLink to="/ai-lab/tarp-generator" className={({ isActive }) => `block px-4 py-2 text-sm ${isActive ? 'text-jax-blue bg-blue-50' : 'text-gray-700'} hover:bg-blue-50`}>
                    Tarp Generator
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center">
            <Link 
              to="/quote" 
              className="ml-4 inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white bg-jax-blue rounded-xl shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;