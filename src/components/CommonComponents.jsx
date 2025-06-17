import React from 'react';
// Asegúrate de importar Lucide icons si son usados directamente aquí,
// aunque en este caso se pasan como props desde App.js o las páginas.

export const NavItem = ({ icon, text, active, onClick, isSidebarOpen }) => (
  <li
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
                ${active ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' : 'hover:bg-gray-700 hover:text-gray-100 text-gray-300'}`}
    onClick={onClick}
  >
    {icon}
    {isSidebarOpen && <span className="ml-4 text-sm font-medium">{text}</span>}
  </li>
);

export const StatCard = ({ title, value, change, icon, bgColor, textColor }) => (
  <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${bgColor}`}>
    <div className="flex-shrink-0 p-3 bg-white rounded-full shadow-md">
      {icon}
    </div>
    <div>
      <p className={`text-sm font-medium text-gray-500`}>{title}</p>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
      {change && <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{change}</p>}
    </div>
  </div>
);