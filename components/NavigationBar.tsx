
import React from 'react';
import { View } from '../types';

interface NavigationBarProps {
  currentView: View;
  onSelectView: (view: View) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ currentView, onSelectView }) => {
  const navItems = [
    { id: 'feed', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
      </svg>
    ), label: 'Feed' },
    { id: 'upload', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
      </svg>
    ), label: 'Upload' },
    { id: 'profile', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"></path>
      </svg>
    ), label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around items-center h-16 z-20">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`flex flex-col items-center justify-center p-2 text-sm font-medium transition-colors duration-200
            ${currentView === item.id ? 'text-red-500' : 'text-gray-400 hover:text-gray-200'}`}
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