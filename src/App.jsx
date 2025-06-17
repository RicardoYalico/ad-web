// src/App.js
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, BookOpen, Building,
  ClipboardList, Settings, Bell, UserCircle, Menu, X, ChevronDown,
  Search, LogOut, Briefcase, Clock, FileText, CalendarRange, Layers3, BookMarked
} from 'lucide-react';


import LoginPage from './components/LoginPage';
import ScheduleModal from './components/ScheduleModal'; // Modal generalizado
import { NavItem } from './components/CommonComponents'; 

import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import DisponibilidadAcompaniamientoPage from './pages/SpecialistsPage';
import ProgramacionHorariaPage from './pages/ProgramacionHorariaPage';
import SchedulesPage from './pages/SchedulesPage';
import EsasPage from './pages/EsasPage'; // Página de ESA
import TablaDinamica from './components/TablaDinamica'; // Componente de tabla dinámica
import ReporteUnicoDocentePage from './pages/ReporteUnicoDocentePage'; // Página de Reporte Único Docente
import SuperMallaPage from './pages/SuperMallaPage'; // Página de Super Malla
import GestorDeRubricas from './pages/GestorDeRubricas';
import PlanIntegralDocentePage from './pages/PlanIntegralDocentePage';

const mockUsers = [
  { email: 'admin@sistemaedu.com', password: 'password123', name: 'Admin General', role: 'Administrador', avatar: 'https://placehold.co/40x40/777777/FFFFFF?text=AG' },
  { email: 'ep.ana.torres@sistemaedu.com', password: 'ana123', name: 'Dr. Ana Torres', role: 'Especialista Pedagógico', avatar: 'https://placehold.co/40x40/3498DB/FFFFFF?text=AT' },
];

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('Panel de Control');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
 
  // Estado para el modal de horario (generalizado)
  const [selectedPersonForSchedule, setSelectedPersonForSchedule] = useState(null);
  const [scheduleModalType, setScheduleModalType] = useState('specialist'); // 'specialist' o 'teacher'
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentScheduleModalWeekDate, setCurrentScheduleModalWeekDate] = useState(new Date());


  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.email && user.name) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('currentUser'); 
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('currentUser'); 
      }
    }
  }, []);

  const handleLogin = (email, password) => {
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user)); 
      setActivePage('Panel de Control');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser'); 
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
 
  // Función generalizada para abrir el modal de horario
  const handleOpenSchedule = (person, type) => {
    setSelectedPersonForSchedule(person);
    setScheduleModalType(type); // 'specialist' o 'teacher'
    setCurrentScheduleModalWeekDate(new Date()); 
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedPersonForSchedule(null);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'Panel de Control':
        return <DashboardPage />;
      case 'Gestión de Asignación':
        return <AssignmentsPage />; 
      case 'Gestión Disponibilidad EP':
        return <DisponibilidadAcompaniamientoPage />;
      case 'Reporte Unico Docente':
        return <ReporteUnicoDocentePage />;
      case 'Programación Horaria': 
        return <ProgramacionHorariaPage onOpenTeacherSchedule={(teacher) => handleOpenSchedule(teacher, 'teacher')} />; 
      case 'Horarios':
        return <SchedulesPage />;
      case 'Plan Integral Docente':
        return <PlanIntegralDocentePage />;
      case 'ESA':
        return <EsasPage />;
      case 'Super Malla':
        return <SuperMallaPage />;
      case 'Gestor de Rúbricas':
        return <GestorDeRubricas />;
      case 'Consolidados de Registro':
        return <TablaDinamica />;
      default:
        if (['Sedes', 'Rúbricas', 'Configuración'].includes(activePage)) {
            return <div className="bg-white p-8 rounded-xl shadow-lg"><h2 className="text-2xl font-semibold text-gray-700">{activePage}</h2><p className="text-gray-600 mt-2">Este módulo está actualmente en desarrollo o comentado.</p></div>;
        }
        return <div className="bg-white p-8 rounded-xl shadow-lg"><h2 className="text-2xl font-semibold text-gray-700">Página no encontrada</h2></div>;
    }
  };

  const menuItems = [
    { name: 'Panel de Control', icon: <LayoutDashboard size={20} /> },
    { name: 'Gestión de Asignación', icon: <UserCheck size={20} /> },
    { name: 'Programación Horaria', icon: <CalendarRange size={20} /> },
    { name: 'ESA', icon: <Users size={20} /> },
    { name: 'Reporte Unico Docente', icon: <FileText  size={20} /> },
    { name: 'Plan Integral Docente', icon: <CalendarDays size={20} /> },
    { name: 'Gestión Disponibilidad EP', icon: <Briefcase size={20} /> },
    { name: 'Super Malla', icon: <Layers3 size={20} /> },
    { name: 'Gestor de Rúbricas', icon: <BookMarked size={20} /> },
    { name: 'Consolidados de Registro', icon: <ClipboardList size={20} /> },
    { name: 'Horarios', icon: <CalendarDays size={20} /> },

  ];

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className={`transition-all duration-300 ease-in-out bg-gray-800 text-white flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className={`flex items-center ${isSidebarOpen ? 'p-6 justify-between' : 'p-4 justify-center'} border-b border-gray-700 h-20`}>
          {isSidebarOpen && <span className="text-xl font-semibold">Gestión de Acompañamiento</span>}
          <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
          <ul>{menuItems.map(item => ( <NavItem key={item.name} icon={item.icon} text={item.name} active={activePage === item.name} onClick={() => setActivePage(item.name)} isSidebarOpen={isSidebarOpen}/>))}</ul>
        </nav>
        <div className={`p-4 border-t border-gray-700 ${isSidebarOpen ? '' : 'flex justify-center'}`}>
          <NavItem icon={<LogOut size={20} />} text="Cerrar Sesión" active={false} onClick={handleLogout} isSidebarOpen={isSidebarOpen} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-8 py-4">
          <div className="flex items-center">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={20} className="text-gray-400" /></span>
              <input type="text" placeholder="Buscar en el sistema..." className="w-full md:w-96 pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out"/>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <button className="relative text-gray-600 hover:text-blue-500 transition-colors">
              <Bell size={24} />
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="relative">
              <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 focus:outline-none">
                <img src={currentUser?.avatar || `https://placehold.co/40x40/007BFF/FFFFFF?text=${currentUser?.name?.substring(0,1) || 'U'}`} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-300 hover:border-blue-500 transition-all" onError={(e) => e.target.src=`https://placehold.co/40x40/CCCCCC/FFFFFF?text=${currentUser?.name?.substring(0,1) || 'U'}`}/>
                <span className="hidden md:inline text-sm font-medium text-gray-700">{currentUser?.name || 'Usuario'}</span>
                <ChevronDown size={18} className={`text-gray-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'Usuario'}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email || 'email@example.com'}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">{currentUser?.role || 'Rol no definido'}</p>
                  </div>
                  <a href="#profile" onClick={(e) => {e.preventDefault(); setIsProfileDropdownOpen(false); alert("Ir a Mi Perfil (simulado)")}} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors">
                    <UserCircle size={18} className="mr-2.5"/> Mi Perfil
                  </a>
                  <a href="#settings" onClick={(e) => {e.preventDefault(); setIsProfileDropdownOpen(false); alert("Ir a Ajustes de Cuenta (simulado)")}} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-500 hover:text-white transition-colors">
                    <Settings size={18} className="mr-2.5"/> Ajustes de Cuenta
                  </a>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-500 hover:text-white transition-colors">
                    <LogOut size={18} className="mr-2.5"/> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          {renderContent()}
        </main>
      </div>
      {isScheduleModalOpen && selectedPersonForSchedule && ( // Condición generalizada
        <ScheduleModal 
            personData={selectedPersonForSchedule} 
            personType={scheduleModalType} // Pasamos el tipo
            onClose={handleCloseScheduleModal}
            currentWeekDate={currentScheduleModalWeekDate}
            setCurrentWeekDate={setCurrentScheduleModalWeekDate}
        />
      )}
    </div>
  );
};

export default App;