import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Briefcase, CalendarDays, Clock, User, Building, ChevronLeft, ChevronRight, X, BookOpen, Clock4, MapPin, Search, Calendar, ChevronDown, RefreshCw } from 'lucide-react';

// --- SUB-COMPONENTES Y HELPERS ---

// Componente de Tarjeta de Estadísticas
const StatCard = ({ title, value, icon, bgColor, textColor }) => (
  <div className={`p-6 rounded-xl shadow-lg flex items-center justify-between ${bgColor}`}>
    <div>
      <p className={`text-sm font-medium ${textColor}`}>{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-50">
      {icon}
    </div>
  </div>
);

// Componente de Paginación Mejorada
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 9;
    const halfPages = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage > halfPages + 1) pageNumbers.push('...');
      let start = Math.max(2, currentPage - (halfPages - 2));
      let end = Math.min(totalPages - 1, currentPage + (halfPages - 2));
      if (currentPage <= halfPages) end = maxPagesToShow - 2;
      if (currentPage > totalPages - halfPages) start = totalPages - (maxPagesToShow - 3);
      for (let i = start; i <= end; i++) pageNumbers.push(i);
      if (currentPage < totalPages - halfPages) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
        <ChevronLeft className="w-5 h-5 mr-2" /> Anterior
      </button>
      <nav className="hidden md:flex items-center space-x-1">
        {pages.map((page, index) => (
          <button key={`${page}-${index}`} onClick={() => typeof page === 'number' && onPageChange(page)} disabled={typeof page !== 'number'} className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'} ${typeof page !== 'number' ? 'cursor-default' : ''}`}>
            {page}
          </button>
        ))}
      </nav>
      <span className="md:hidden text-sm text-gray-700">Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span></span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
        Siguiente <ChevronRight className="w-5 h-5 ml-2" />
      </button>
    </div>
  );
};

// Componente de Calendario Semanal
const CalendarView = ({ courses, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dayNameToNumber = (name) => {
        if (!name) return -1;
        const lowerName = name.toLowerCase();
        const map = { 'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6 };
        return map[lowerName] ?? -1;
    };
    
    const getFormattedDateKey = (date) => date.toISOString().split('T')[0];

    const scheduledEvents = useMemo(() => {
        const events = {};
        if (!courses) return events;
        courses.forEach(course => {
            course.horarios?.forEach(horario => {
                if (!horario.fechaInicio || !horario.fechaFin || !horario.dia) return;
                
                const startDate = new Date(horario.fechaInicio);
                const endDate = new Date(horario.fechaFin);
                const dayIndex = dayNameToNumber(horario.dia);
                if (dayIndex === -1) return;

                let currentDateInLoop = new Date(startDate);
                while(currentDateInLoop <= endDate) {
                    if (currentDateInLoop.getDay() === dayIndex) {
                        const dateKey = getFormattedDateKey(currentDateInLoop);
                        if (!events[dateKey]) events[dateKey] = [];
                        
                        events[dateKey].push({
                            name: course.nombreCurso,
                            code: course.codCurso,
                            section: course.seccion,
                            nrc: course.nrc,
                            periodo: course.periodo,
                            metEdu: course.metEdu,
                            time: horario.hora,
                            campus: horario.campus,
                            aula: horario.aula,
                            fechaInicio: horario.fechaInicio,
                            fechaFin: horario.fechaFin,
                        });
                    }
                    currentDateInLoop.setDate(currentDateInLoop.getDate() + 1);
                }
            });
        });
        return events;
    }, [courses]);

    const changeWeek = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (offset * 7));
            return newDate;
        });
    };

    const timeStringToMinutes = (timeStr) => {
        if(!timeStr) return 0;
        const [start] = timeStr.split('-').map(t => t.trim());
        const cleanedTime = start.replace(/\s/g, '').replace(":", "");
        if (cleanedTime.length < 4) return 0;
        const hours = parseInt(cleanedTime.substring(0, 2), 10);
        const minutes = parseInt(cleanedTime.substring(2, 4), 10);
        return hours * 60 + minutes;
    };

    const EventCard = ({ event, onClick }) => {
        if(!event.time) return null;
        const [start, end] = event.time.split('-').map(t => t.trim());
        if(!start || !end) return null;
        
        const startMinutes = timeStringToMinutes(start);
        const endMinutes = timeStringToMinutes(end);
        if (isNaN(startMinutes) || isNaN(endMinutes)) return null;

        const top = ((startMinutes - (7 * 60)) / 60) * 5; // 5rem por hora, empezando a las 7am
        const height = ((endMinutes - startMinutes) / 60) * 5;

        return (
            <button onClick={() => onClick(event)} className="absolute w-[96%] left-[2%] p-2 text-left text-xs rounded-lg shadow-md overflow-hidden transition-colors bg-indigo-100 border-l-4 border-indigo-500 text-indigo-900 hover:bg-indigo-200" style={{ top: `${top}rem`, height: `${height}rem`, zIndex: 10 }}>
                <p className="font-bold truncate">{event.name}</p>
                <p className="truncate">{event.time}</p>
                <p className="truncate">@{event.campus}</p>
            </button>
        );
    };

    const weekDayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <div className="flex items-center">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
                </div>
            </div>
            <div className="flex">
                <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">
                    <div className="h-16 border-r border-b"></div> {/* Espacio para cabecera de días */}
                    {Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`).map(time => (
                        <div key={time} className="h-20 pr-2 border-r border-t flex justify-end items-start pt-1">{time}</div>
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-7">
                    {weekDayNames.map((dayName, index) => {
                        const currentColumnDate = new Date(startOfWeek);
                        currentColumnDate.setDate(startOfWeek.getDate() + index);
                        const dateKey = getFormattedDateKey(currentColumnDate);
                        const eventsForDay = scheduledEvents[dateKey] || [];
                        return (
                            <div key={index} className="border-r relative">
                                <div className="text-center p-2 border-b-2 h-16 flex flex-col justify-center">
                                    <span className="font-semibold text-gray-500 text-sm">{dayName}</span>
                                    <span className="text-2xl font-light">{currentColumnDate.getDate()}</span>
                                </div>
                                <div className="relative h-full">
                                    {Array.from({ length: 16 }, (_, i) => <div key={i} className="h-20 border-t"></div>)}
                                    <div className="absolute inset-0 p-1">
                                        {eventsForDay.map((event, eventIndex) => (
                                            <EventCard key={eventIndex} event={event} onClick={onEventClick} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const ScheduleDetailModal = ({ event, onClose }) => {
    if (!event) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-800">{event.name}</h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                    </div>
                    <div className="mt-6 space-y-3 text-gray-700">
                        <p><strong>Sección:</strong> {event.section}</p>
                        <p><strong>NRC:</strong> {event.nrc}</p>
                        <p><strong>Horario:</strong> {event.dia}, {event.time}</p>
                        <p><strong>Campus:</strong> {event.campus}</p>
                        <p><strong>Aula:</strong> {event.aula}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal de Detalle de Asignación con Pestañas
const AssignmentDetailModal = ({ assignment, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  const matchedCourses = useMemo(() => {
    if (!assignment || !assignment.cursos) return [];
    return assignment.cursos.map(course => {
      const matchedSchedules = course.horarios.filter(h => h.acompanamiento);
      if (matchedSchedules.length > 0) {
        return { ...course, horarios: matchedSchedules };
      }
      return null;
    }).filter(Boolean);
  }, [assignment]);

  const TabButton = ({ tabName, label, icon }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}>
      {icon} <span className="ml-2">{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
        <div className="bg-slate-100 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <header className="sticky top-0 bg-slate-100/80 backdrop-blur-sm p-4 border-b border-slate-200 flex justify-between items-center z-10">
            <h2 className="text-xl font-bold text-gray-800">Detalles de Asignación</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-300 transition-colors"><X size={24}/></button>
          </header>

          <div className="p-4 sm:p-6 lg:p-8 flex-grow overflow-y-auto">
            <section className="mb-6 bg-white p-6 rounded-2xl shadow-md">
              <div className="flex items-start space-x-6">
                <div className="bg-indigo-600 text-white rounded-full h-16 w-16 flex-shrink-0 flex items-center justify-center text-3xl font-bold">
                  {assignment.docente.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{assignment.docente}</h1>
                  <p className="text-md text-gray-500">ID: {assignment.idDocente} | Semestre: {assignment.semestre}</p>
                </div>
              </div>
            </section>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <TabButton tabName="details" label="Detalles" icon={<BookOpen size={16}/>}/>
                    <TabButton tabName="calendar" label="Calendario" icon={<Calendar size={16}/>}/>
                </nav>
            </div>
            
            <div className="mt-6">
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        {matchedCourses.length > 0 ? matchedCourses.map((curso) => (
                            <div key={curso.seccion} className="bg-white p-6 rounded-2xl shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-800 flex items-center"><BookOpen size={20} className="mr-2 text-indigo-500"/>{curso.nombreCurso}</h4>
                                        <p className="text-sm text-gray-500">Sección: {curso.seccion}</p>
                                    </div>
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800">NRC: {curso.nrc}</span>
                                </div>
                                <div className="space-y-3">
                                    {curso.horarios.map((horario, index) => (
                                    <div key={index} className="border-t border-gray-200 pt-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
                                        <p className="flex items-center"><CalendarDays size={16} className="mr-2 text-gray-500"/> <strong>Día:</strong> <span className="ml-1">{horario.dia}</span></p>
                                        <p className="flex items-center"><Clock4 size={16} className="mr-2 text-gray-500"/> <strong>Hora:</strong> <span className="ml-1">{horario.hora}</span></p>
                                        <p className="flex items-center"><MapPin size={16} className="mr-2 text-gray-500"/> <strong>Campus:</strong> <span className="ml-1">{horario.campus} - {horario.aula}</span></p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">No se encontraron horarios de acompañamiento específicos para este docente.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'calendar' && (
                    <CalendarView courses={matchedCourses} onEventClick={setSelectedSchedule} />
                )}
            </div>
          </div>
        </div>
      </div>
      {selectedSchedule && <ScheduleDetailModal event={selectedSchedule} onClose={() => setSelectedSchedule(null)} />}
    </>
  );
};

// Componente reutilizable para los filtros de selección
const FilterSelect = ({ name, value, onChange, options, placeholder, icon }) => (
    <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full py-3 border border-gray-300 rounded-lg transition appearance-none ${icon ? 'pl-10' : 'pl-4'} pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
    </div>
);


// --- Lógica del Panel de Control para el Especialista ---
const DashboardPage = () => {
  const SPECIALIST_DNI = '18130461';
  const API_URL = 'https://kali-ad-web.beesoftware.net/api/asignacion-especialista-docentes';
  const PAGE_LIMIT = 10;

  const [allAssignments, setAllAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [executionDate, setExecutionDate] = useState(null);
  
  // --- Estados para los filtros ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    programa: '',
    modalidad: '',
    campus: ''
  });

  const fetchSpecialistData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    
    const url = `${API_URL}?latest=true&dniEspecialista=${SPECIALIST_DNI}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      const result = await response.json();
      const assignments = result.data || [];
      setAllAssignments(assignments);

      if (assignments.length > 0 && assignments[0].fechaHoraEjecucion) {
        setExecutionDate(assignments[0].fechaHoraEjecucion);
      }

    } catch (err) {
      console.error("Error fetching specialist data:", err);
      setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.");
      setAllAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [SPECIALIST_DNI]);

  // Carga inicial de datos
  useEffect(() => {
    fetchSpecialistData();
  }, [fetchSpecialistData]);

  // Extraer opciones para los filtros del conjunto de datos
  const filterOptions = useMemo(() => {
    const programs = new Set();
    const modalities = new Set();
    const campuses = new Set();

    allAssignments.forEach(assignment => {
        if (assignment.programa) programs.add(assignment.programa);
        if (assignment.modalidad) modalities.add(assignment.modalidad);
        assignment.cursos?.forEach(curso => {
            curso.horarios?.forEach(horario => {
                if (horario.campus) campuses.add(horario.campus);
            });
        });
    });

    return {
        programs: [...programs].sort(),
        modalities: [...modalities].sort(),
        campuses: [...campuses].sort()
    };
  }, [allAssignments]);
  
  // Lógica de filtrado y paginación en el frontend
  const filteredAssignments = useMemo(() => {
      return allAssignments.filter(assignment => {
        // Filtro de búsqueda por texto
        const matchesSearch = 
            (assignment.docente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (assignment.idDocente?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        // Filtro por programa
        const matchesProgram = !filters.programa || assignment.programa === filters.programa;
        
        // Filtro por modalidad
        const matchesModality = !filters.modalidad || assignment.modalidad === filters.modalidad;

        // Filtro por campus (comprueba si ALGUNO de los horarios coincide)
        const matchesCampus = !filters.campus || 
            (assignment.cursos?.some(curso => 
                curso.horarios?.some(horario => horario.campus === filters.campus)
            ));

        return matchesSearch && matchesProgram && matchesModality && matchesCampus;
      });
  }, [allAssignments, searchTerm, filters]);

  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_LIMIT;
    return filteredAssignments.slice(startIndex, startIndex + PAGE_LIMIT);
  }, [filteredAssignments, currentPage]);

  const totalPages = Math.ceil(filteredAssignments.length / PAGE_LIMIT);

  const statsCards = useMemo(() => {
    const totalTeachers = filteredAssignments.length;
    const currentSemester = allAssignments[0]?.semestre || 'N/A';
    const lastUpdated = executionDate
      ? new Date(executionDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

    return [
      { id: 1, title: "Docentes Asignados", value: totalTeachers, icon: <User className="w-8 h-8 text-indigo-500" />, bgColor: "bg-indigo-100", textColor: "text-indigo-700" },
      { id: 2, title: "Semestre", value: currentSemester, icon: <CalendarDays className="w-8 h-8 text-teal-500" />, bgColor: "bg-teal-100", textColor: "text-teal-700" },
      { id: 3, title: "Fecha de Actualización", value: lastUpdated, icon: <RefreshCw className="w-8 h-8 text-rose-500" />, bgColor: "bg-rose-100", textColor: "text-rose-700" },
    ];
  }, [filteredAssignments, allAssignments, executionDate]);
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
    }));
    setCurrentPage(1); // Reiniciar paginación al cambiar un filtro
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Mi Panel de Acompañamiento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map(card => <StatCard key={card.id} {...card} />)}
      </div>
      
      {/* --- SECCIÓN DE FILTROS --- */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* --- Filtro de Búsqueda --- */}
            <div className="relative md:col-span-2 lg:col-span-2">
                <label htmlFor="teacher-search" className="sr-only">Buscar Docente</label>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    id="teacher-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset page on search
                    }}
                    placeholder="Buscar por nombre o ID del docente..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
            {/* --- Filtros de Selección --- */}
            <FilterSelect 
                name="programa"
                value={filters.programa}
                onChange={handleFilterChange}
                options={filterOptions.programs}
                placeholder="Por Programa"
                icon={<BookOpen size={16} />}
            />
            <FilterSelect 
                name="modalidad"
                value={filters.modalidad}
                onChange={handleFilterChange}
                options={filterOptions.modalities}
                placeholder="Por Modalidad"
                icon={<Briefcase size={16} />}
            />
            <FilterSelect 
                name="campus"
                value={filters.campus}
                onChange={handleFilterChange}
                options={filterOptions.campuses}
                placeholder="Por Campus"
                icon={<MapPin size={16} />}
            />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Mis Docentes Asignados</h3>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando asignaciones...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 bg-red-100 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3"><User className="inline-block w-4 h-4 mr-1"/>Docente</th>
                    <th scope="col" className="px-6 py-3">ID Docente</th>
                    <th scope="col" className="px-6 py-3"><Building className="inline-block w-4 h-4 mr-1"/>Programa</th>
                    <th scope="col" className="px-6 py-3">Modalidad</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ver Detalles</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.map((assignment) => (
                    <tr key={assignment._id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{assignment.docente}</td>
                      <td className="px-6 py-4">{assignment.idDocente}</td>
                      <td className="px-6 py-4">{assignment.programa}</td>
                      <td className="px-6 py-4">{assignment.modalidad}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedAssignment(assignment)} className="font-medium text-indigo-600 hover:underline">
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAssignments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-gray-500">
                        No se encontraron docentes que coincidan con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>

      {selectedAssignment && (
        <AssignmentDetailModal 
          assignment={selectedAssignment} 
          onClose={() => setSelectedAssignment(null)} 
        />
      )}
    </div>
  );
};

export default DashboardPage;
