

import React from 'react';
import { View } from '../types';

interface NavigationBarProps {
  currentView: View;
  onSelectView: (view: View) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ currentView, onSelectView }) => {
  const navItems = [
    { id: 'feed', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
      </svg>
    ), label: 'Feed' },
    { id: 'upload', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 13h-3V18h-2v-5H9V10h2V5h2v5h3v3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path>
      </svg>
    ), label: 'Upload' },
    { id: 'profile', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
      </svg>
    ), label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center h-16 z-20">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`flex flex-col items-center justify-center p-2 text-sm font-medium transition-all duration-300 ease-in-out
            ${currentView === item.id ? 'text-red-500 transform scale-105' : 'text-gray-400 hover:text-gray-200'}`}
          onClick={() => onSelectView(item.id as View)}
          aria-current={currentView === item.id ? 'page' : undefined}
          aria-label={`Go to ${item.label} view`}
        >
          {item.icon}
          <span className="mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default NavigationBar;
