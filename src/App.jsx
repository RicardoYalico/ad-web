import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, BookOpen, Building,
  ClipboardList, Settings, Bell, UserCircle, Menu, X, ChevronDown,
  Search, LogOut, Briefcase, Clock, FileText, CalendarRange, Layers3, BookMarked
} from 'lucide-react';

import LoginPage from './components/LoginPage';
import ScheduleModal from './components/ScheduleModal';
import { NavItem } from './components/CommonComponents';

import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import DisponibilidadAcompaniamientoPage from './pages/SpecialistsPage';
import ProgramacionHorariaPage from './pages/ProgramacionHorariaPage';
import SchedulesPage from './pages/SchedulesPage';
import EsasPage from './pages/EsasPage';
import TablaDinamica from './components/TablaDinamica';
import ReporteUnicoDocentePage from './pages/ReporteUnicoDocentePage';
import SuperMallaPage from './pages/SuperMallaPage';
import GestorDeRubricas from './pages/GestorDeRubricas';
import PlanIntegralDocentePage from './pages/PlanIntegralDocentePage';
import DisponibilidadPage from './pages/DisponibilidadPage';
import DashboardAdminPage from './pages/DashboardAdminPage';
import DashboardResultados from './pages/DashboardResultados';
import AsignacionDocenteEp from './pages/AsignacionDocenteEp';
import SeleccionDocenteSeguimiento from './pages/SeleccionDocenteSeguimiento';

// <-- MEJORA: Se definen constantes para los roles para evitar errores de tipeo.
const ROLES = {
  ADMIN: 'Administrador',
  COORDINATOR: 'Coordinadora de Desarrollo',
  SPECIALIST: 'Especialista Pedagógico',
};

// <-- CAMBIO CLAVE: Se modifica mockUsers para usar 'dni' en lugar de 'email'.
// La contraseña puede ser cualquiera para propósitos de este cambio.
const mockUsers = [
  { dni: '12345678', password: 'anypassword', name: 'Admin General', role: ROLES.ADMIN, avatar: 'https://placehold.co/40x40/777777/FFFFFF?text=AG' },
  { dni: '18130461', password: 'anypassword', name: 'Dr. Ana Torres', role: ROLES.SPECIALIST, avatar: 'https://placehold.co/40x40/3498DB/FFFFFF?text=AT' },
  { dni: '40019902', password: 'anypassword', name: 'EP. 2', role: ROLES.SPECIALIST, avatar: 'https://placehold.co/40x40/3498DB/FFFFFF?text=AT' },
  { dni: '11223344', password: 'anypassword', name: 'Laura Pérez', role: ROLES.COORDINATOR, avatar: 'https://placehold.co/40x40/F39C12/FFFFFF?text=LP' },
];

// <-- MEJORA: Configuración centralizada para roles, permisos y página de inicio.
const pageAccessConfig = {
  [ROLES.ADMIN]: {
    allowed: [
      'Dashboard de Resultados',
      'Gestión de Asignación',
      'Programación Horaria',
      'ESA',
      'Reporte Unico Docente',
      'Plan Integral Docente',
      'Gestión Disponibilidad EP',
      'Super Malla',
      'Instrumentos de observación',
      'Registros de cumplimiento',
      'Dashboard de Resultados2',
      'Asignación Docente EP',
      'Selección Docente Seguimiento',
    ],
    defaultPage: 'Dashboard de Resultados',
  },
  [ROLES.COORDINATOR]: {
    allowed: ['Dashboard de Resultados', 'Instrumentos de observación', 'Registros de cumplimiento', 'Asignación Docente EP'],
    defaultPage: 'Dashboard de Resultados',
  },
  [ROLES.SPECIALIST]: {
    allowed: ['Panel de Control', 'Instrumentos de observación', 'Disponibilidad', 'Selección Docente Seguimiento'],
    defaultPage: 'Panel de Control',
  },
};


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState(''); // <-- Inicia vacío, se define en login/useEffect
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const [selectedPersonForSchedule, setSelectedPersonForSchedule] = useState(null);
  const [scheduleModalType, setScheduleModalType] = useState('specialist');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentScheduleModalWeekDate, setCurrentScheduleModalWeekDate] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.role && pageAccessConfig[user.role]) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          // <-- MEJORA: Al recargar, se asegura de ir a la página por defecto del rol.
          setActivePage(pageAccessConfig[user.role].defaultPage);
        } else {
          localStorage.removeItem('currentUser');  
        }
      } catch (error) {
        console.error("Error al parsear datos de usuario:", error);
        localStorage.removeItem('currentUser');  
      }
    }
  }, []);

  // <-- CAMBIO CLAVE: Se modifica handleLogin para buscar por DNI y aceptar cualquier contraseña.
  const handleLogin = (dni, password) => { // Cambia 'email' a 'dni'
    const user = mockUsers.find(u => u.dni === dni); // Busca solo por DNI
    if (user) {
      // Como se requiere cualquier contraseña, no se verifica 'password' aquí.
      setIsAuthenticated(true);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));  

      // <-- CAMBIO: Se establece la página de inicio usando la configuración centralizada.
      const defaultPage = pageAccessConfig[user.role]?.defaultPage || 'Panel de Control';
      setActivePage(defaultPage);
      
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActivePage('');
    localStorage.removeItem('currentUser');  
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  
  const handleOpenSchedule = (person, type) => {
    setSelectedPersonForSchedule(person);
    setScheduleModalType(type);
    setCurrentScheduleModalWeekDate(new Date());  
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedPersonForSchedule(null);
  };

  const renderContent = () => {
    // <-- MEJORA: Lógica de seguridad simplificada. Redirige si la página activa no está permitida.
    const allowedPages = pageAccessConfig[currentUser?.role]?.allowed || [];
    const defaultPage = pageAccessConfig[currentUser?.role]?.defaultPage || '';

    if (activePage && !allowedPages.includes(activePage)) {
      // Si por alguna razón se intenta acceder a una página no permitida, redirigir.
      setActivePage(defaultPage);
      // El render se corregirá en el siguiente ciclo. Podemos retornar el componente por defecto de inmediato.
      return renderPage(defaultPage);
    }
    
    return renderPage(activePage);
  };
  
  // <-- MEJORA: Se extrae la lógica del switch a su propia función para mayor claridad.
  const renderPage = (page) => {
    switch (page) {
      case 'Dashboard de Resultados': // <-- CAMBIO: Nombre actualizado
        return <DashboardAdminPage />;
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
      case 'Instrumentos de observación':
        return <GestorDeRubricas />;
      case 'Registros de cumplimiento':
        return <TablaDinamica />;
      case 'Disponibilidad':
        return <DisponibilidadPage />;
      case 'Dashboard de Resultados2':
        return <DashboardResultados />;
      case 'Asignación Docente EP':
        return <AsignacionDocenteEp />;
      case 'Selección Docente Seguimiento':
        return <SeleccionDocenteSeguimiento />;
      default:
        // Si la página activa está vacía (ej. al inicio antes del useEffect), no mostrar nada o un loader.
        if (!page) return null;  
        return <div className="bg-white p-8 rounded-xl shadow-lg"><h2 className="text-2xl font-semibold text-gray-700">Página no encontrada o en desarrollo</h2></div>;
    }
  };

  const allMenuItems = [
    { name: 'Dashboard de Resultados', icon: <LayoutDashboard size={20} /> }, // <-- CAMBIO: Nombre actualizado
    { name: 'Panel de Control', icon: <LayoutDashboard size={20} /> },
    { name: 'Gestión de Asignación', icon: <UserCheck size={20} /> },
    { name: 'Programación Horaria', icon: <CalendarRange size={20} /> },
    { name: 'ESA', icon: <Users size={20} /> },
    { name: 'Reporte Unico Docente', icon: <FileText size={20} /> },
    { name: 'Plan Integral Docente', icon: <CalendarDays size={20} /> },
    { name: 'Gestión Disponibilidad EP', icon: <Briefcase size={20} /> },
    { name: 'Super Malla', icon: <Layers3 size={20} /> },
    { name: 'Instrumentos de observación', icon: <BookMarked size={20} /> },
    { name: 'Registros de cumplimiento', icon: <ClipboardList size={20} /> },
    { name: 'Disponibilidad', icon: <Clock size={20} /> },
    { name: 'Dashboard de Resultados2', icon: <Building size={20} /> }, // <-- CAMBIO: Nombre actualizado
    { name: 'Asignación Docente EP', icon: <UserCheck size={20} /> },
    { name: 'Selección Docente Seguimiento', icon: <UserCircle size={20} /> }, // <-- CAMBIO: Nombre actualizado
  ];

  // <-- MEJORA: El menú se filtra de forma robusta y centralizada.
  const menuItems = currentUser  
    ? allMenuItems.filter(item => pageAccessConfig[currentUser.role]?.allowed.includes(item.name))
    : [];

  if (!isAuthenticated) {
    // Es crucial que el componente LoginPage acepte 'dni' en lugar de 'email'
    // y lo pase correctamente a handleLogin.
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
          <ul>
            {menuItems.map(item => (
              <NavItem key={item.name} icon={item.icon} text={item.name} active={activePage === item.name} onClick={() => setActivePage(item.name)} isSidebarOpen={isSidebarOpen}/>
            ))}
          </ul>
        </nav>
        <div className={`p-4 border-t border-gray-700 ${isSidebarOpen ? '' : 'flex justify-center'}`}>
          <NavItem icon={<LogOut size={20} />} text="Cerrar Sesión" active={false} onClick={handleLogout} isSidebarOpen={isSidebarOpen} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-8 py-4">
          <div className="flex items-center">
            {/* El input de búsqueda se mantiene igual */}
          </div>
          <div className="flex items-center space-x-5">
            <button className="relative text-gray-600 hover:text-blue-500 transition-colors">
              <Bell size={24} />
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="relative">
              <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 focus:outline-none">
                <img src={currentUser?.avatar} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-300 hover:border-blue-500 transition-all"/>
                <span className="hidden md:inline text-sm font-medium text-gray-700">{currentUser?.name}</span>
                <ChevronDown size={18} className={`text-gray-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                    {/* CAMBIO: Mostrar DNI en lugar de email en el perfil */}
                    <p className="text-xs text-gray-500">{currentUser?.dni}</p> 
                    <p className="text-xs text-gray-500 mt-1 italic">{currentUser?.role}</p>
                  </div>
                  {/* Los links del dropdown se mantienen igual */}
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

      {isScheduleModalOpen && selectedPersonForSchedule && (
        <ScheduleModal  
          personData={selectedPersonForSchedule}  
          personType={scheduleModalType}
          onClose={handleCloseScheduleModal}
          currentWeekDate={currentScheduleModalWeekDate}
          setCurrentWeekDate={setCurrentScheduleModalWeekDate}
        />
      )}
    </div>
  );
};

export default App;