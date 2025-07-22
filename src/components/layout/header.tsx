import React from 'react';
import logo from '@/assets/images/logo.png';
const Header = () => {
  return (
    <header >
      <div >
        {/* Logo */}
        <div >
          <div >
            <img src={logo} alt="Logo" className="w-8 h-8" />
          </div>
          <span className="text-red-500">새로운 내용입니다!</span>
        </div>

        {/* Navigation */}
        <nav >
          {/* Add navigation links here */}
        </nav>
      </div>
    </header>
  );
};
export default Header;
