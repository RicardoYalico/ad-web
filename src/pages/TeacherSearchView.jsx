import React, { useState, useMemo } from 'react';
import { Search, User, Calendar, Clock, Building, BookOpen, GraduationCap, MapPin, XCircle, Tag, X } from 'lucide-react';

// --- Datos de ejemplo (Mock Data) ---
const mockTeachers = [
  {
    id: 'N00023241',
    name: 'Ana García',
    programs: [
        { program: 'UG', modality: 'PRESENCIAL' },
        { program: 'WA', modality: 'SÍNCRONO' }
    ],
    schedule: [
      { day: 'Lunes', startTime: '08:00', endTime: '10:00', course: 'Algoritmos Avanzados', campus: 'LN1', cycle: 'Ciclo 3', program: 'UG', modality: 'PRESENCIAL' },
      { day: 'Miércoles', startTime: '11:00', endTime: '13:00', course: 'Bases de Datos II', campus: 'TI0', cycle: 'Ciclo 4', program: 'UG', modality: 'PRESENCIAL' },
      { day: 'Viernes', startTime: '09:00', endTime: '11:00', course: 'Proyecto de Software', campus: 'LN1', cycle: 'Ciclo 5', program: 'WA', modality: 'SÍNCRONO' },
      { day: 'Sábado', startTime: '10:00', endTime: '13:00', course: 'Taller de Liderazgo', campus: 'TI0', cycle: 'Ciclo 2', program: 'WA', modality: 'SÍNCRONO' },
    ],
  },
  {
    id: 'N00018753',
    name: 'Carlos Rodriguez',
    programs: [ { program: 'UG', modality: 'VIRTUAL' } ],
    schedule: [
      { day: 'Martes', startTime: '18:00', endTime: '20:00', course: 'Introducción a la Gestión', campus: 'VIR', cycle: 'Ciclo 1', program: 'UG', modality: 'VIRTUAL' },
      { day: 'Jueves', startTime: '19:00', endTime: '21:00', course: 'Matemática Básica', campus: 'VIR', cycle: 'Ciclo 1', program: 'UG', modality: 'VIRTUAL' },
    ],
  },
  {
    id: 'N00031298',
    name: 'Laura Martinez',
    programs: [
        { program: 'CPEL', modality: 'PRESENCIAL' },
        { program: 'UG', modality: 'PRESENCIAL' }
    ],
    schedule: [
      { day: 'Lunes', startTime: '14:00', endTime: '16:00', course: 'Dibujo I', campus: 'LN1', cycle: 'Ciclo 1', program: 'UG', modality: 'PRESENCIAL' },
      { day: 'Miércoles', startTime: '16:00', endTime: '18:00', course: 'Teoría del Color', campus: 'TI0', cycle: 'Ciclo 1', program: 'CPEL', modality: 'PRESENCIAL' },
      { day: 'Jueves', startTime: '14:00', endTime: '16:00', course: 'Historia del Arte', campus: 'LN1', cycle: 'Ciclo 2', program: 'UG', modality: 'PRESENCIAL' },
    ],
  },
];

// --- Mapeo de colores para las sedes ---
const campusColors = {
  'LN1': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'TI0': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  'LS1': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  'VIR': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
};


// --- Componentes Auxiliares ---

const BadgeGroup = ({ icon, label, items, availableItems, activeFilter, onFilterClick }) => (
    <div className="flex items-start text-gray-700">
        {icon}
        <div className="ml-3">
            <span className="font-semibold">{label}:</span>
            <div className="flex flex-wrap gap-2 mt-1">
                {items.map((item, index) => {
                    const isAvailable = availableItems.includes(item);
                    const isActive = activeFilter === item;
                    return (
                        <span 
                            key={index} 
                            onClick={() => isAvailable && onFilterClick(item)}
                            className={`text-sm font-medium px-3 py-1 rounded-full border transition-all duration-200 ${
                                isActive
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-md' 
                                : isAvailable
                                ? 'cursor-pointer bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
                                : 'cursor-not-allowed bg-gray-50 text-gray-400 border-gray-100'
                            }`}
                        >
                            {item}
                        </span>
                    );
                })}
            </div>
        </div>
    </div>
);


// --- Componente de Calendario ---
const CalendarView = ({ schedule, filters, onEventClick }) => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const hours = Array.from({ length: 15 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`); // 7 AM to 9 PM

  const getScheduleForCell = (day, hour) => {
    const startHour = parseInt(hour.split(':')[0], 10);
    return schedule.find(s => {
      const scheduleStart = parseInt(s.startTime.split(':')[0], 10);
      const scheduleEnd = parseInt(s.endTime.split(':')[0], 10);
      return s.day === day && startHour >= scheduleStart && startHour < scheduleEnd;
    });
  };

  const hasActiveFilter = Object.values(filters).some(f => f !== null);

  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow-inner">
      <h3 className="text-xl font-bold text-gray-800 flex items-center mb-4">
          <Calendar className="mr-2 text-indigo-500" />
          Vista de Calendario Semanal
      </h3>
      <div className="grid grid-cols-8 gap-px text-center text-sm font-medium text-gray-600 bg-gray-200 border border-gray-200">
        <div className="p-2 bg-gray-50"></div>
        {days.map(day => <div key={day} className="p-2 bg-gray-50 text-[10px] sm:text-sm">{day}</div>)}
        
        {hours.map(hour => (
          <React.Fragment key={hour}>
            <div className="p-2 bg-gray-50 flex items-center justify-center text-xs">{hour}</div>
            {days.map(day => {
              const event = getScheduleForCell(day, hour);
              const colors = event ? (campusColors[event.campus] || campusColors.default) : null;
              
              let isVisible = true;
              if (hasActiveFilter && event) {
                if (filters.campus && event.campus !== filters.campus) isVisible = false;
                if (filters.cycle && event.cycle.replace('Ciclo ', '') !== filters.cycle) isVisible = false;
                if (filters.program && event.program !== filters.program) isVisible = false;
                if (filters.modality && event.modality !== filters.modality) isVisible = false;
              }

              return (
                <div 
                  key={`${day}-${hour}`} 
                  onClick={() => event && onEventClick(event)}
                  className={`p-1 h-20 flex items-center justify-center transition-all duration-300 ${event ? `cursor-pointer ${colors.bg} ${colors.text}` : 'bg-white'} ${hasActiveFilter && !isVisible ? 'opacity-20 grayscale' : 'opacity-100'}`}
                >
                  {event && (
                     <div className={`w-full h-full p-1.5 rounded-md flex flex-col justify-center text-center`}>
                        <p className="font-bold text-xs leading-tight">{event.course}</p>
                        <span className="text-[11px] font-medium text-gray-600 mt-1">
                            {event.startTime} - {event.endTime}
                        </span>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// --- Componente de Vista de Detalles del Docente ---
const TeacherDetails = ({ teacher }) => {
  const [filters, setFilters] = useState({ campus: null, cycle: null, program: null, modality: null });

  const handleFilterClick = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: prevFilters[type] === value ? null : value
    }));
  };

  const handleEventClick = (event) => {
    setFilters({
        campus: event.campus,
        cycle: event.cycle.replace('Ciclo ', ''),
        program: event.program,
        modality: event.modality,
    });
  };

  const handleClearFilters = () => {
    setFilters({ campus: null, cycle: null, program: null, modality: null });
  };

  const hasActiveFilter = Object.values(filters).some(f => f !== null);
  
  const availableOptions = useMemo(() => {
    const getAvailable = (keyToOmit) => {
        let tempSchedule = teacher.schedule;
        Object.keys(filters).forEach(filterKey => {
            if (filterKey !== keyToOmit && filters[filterKey]) {
                tempSchedule = tempSchedule.filter(s => {
                    const value = filterKey === 'cycle' ? s[filterKey].replace('Ciclo ', '') : s[filterKey];
                    return value === filters[filterKey];
                });
            }
        });
        return [...new Set(tempSchedule.map(s => keyToOmit === 'cycle' ? s.cycle.replace('Ciclo ', '') : s[keyToOmit]))];
    };

    return {
        campuses: getAvailable('campus'),
        cycles: getAvailable('cycle').sort((a,b) => a-b),
        programs: getAvailable('program'),
        modalities: getAvailable('modality'),
    };
  }, [filters, teacher.schedule]);

  const uniqueCampuses = [...new Set(teacher.schedule.map(item => item.campus))];
  const uniqueCycles = [...new Set(teacher.schedule.map(item => item.cycle.replace('Ciclo ', '')))].sort((a,b) => a-b);
  const uniquePrograms = [...new Set(teacher.programs.map(item => item.program))];
  const uniqueModalities = [...new Set(teacher.programs.map(item => item.modality))];

  const totalHours = teacher.schedule.reduce((acc, s) => {
      const start = parseInt(s.startTime.split(':')[0], 10);
      const end = parseInt(s.endTime.split(':')[0], 10);
      return acc + (end - start);
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
          <User className="w-12 h-12 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{teacher.name}</h1>
          <p className="text-md text-gray-500">ID: {teacher.id} | <span className="font-semibold">{totalHours} horas semanales</span></p>
        </div>
      </div>

      <div className="border-t pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <BadgeGroup icon={<Building size={20} className="text-indigo-500 mt-1" />} label="Sedes" items={uniqueCampuses} availableItems={availableOptions.campuses} activeFilter={filters.campus} onFilterClick={(value) => handleFilterClick('campus', value)} />
          <BadgeGroup icon={<GraduationCap size={20} className="text-indigo-500 mt-1" />} label="Ciclos" items={uniqueCycles} availableItems={availableOptions.cycles} activeFilter={filters.cycle} onFilterClick={(value) => handleFilterClick('cycle', value)} />
          <BadgeGroup icon={<BookOpen size={20} className="text-indigo-500 mt-1" />} label="Programas" items={uniquePrograms} availableItems={availableOptions.programs} activeFilter={filters.program} onFilterClick={(value) => handleFilterClick('program', value)} />
          <BadgeGroup icon={<MapPin size={20} className="text-indigo-500 mt-1" />} label="Modalidades" items={uniqueModalities} availableItems={availableOptions.modalities} activeFilter={filters.modality} onFilterClick={(value) => handleFilterClick('modality', value)} />
        </div>
        {hasActiveFilter && (
            <div className="mt-6 text-right">
                <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-200 text-sm"
                >
                <X size={16} />
                Limpiar Filtros
                </button>
            </div>
        )}
      </div>
      
      <CalendarView schedule={teacher.schedule} filters={filters} onEventClick={handleEventClick} />
    </div>
  );
};


// --- Componente Principal y Exportable ---
export default function TeacherSearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundTeacher, setFoundTeacher] = useState(null);
  const [searchStatus, setSearchStatus] = useState('idle'); // 'idle', 'found', 'notFound'

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const teacher = mockTeachers.find(t => t.id.toLowerCase() === searchQuery.toLowerCase());
    
    if (teacher) {
      setFoundTeacher(teacher);
      setSearchStatus('found');
    } else {
      setFoundTeacher(null);
      setSearchStatus('notFound');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Búsqueda de Docentes</h1>
          <p className="text-gray-500 mb-4">Ingrese el ID del docente para ver su información detallada.</p>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Ej: N00023241"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
              Buscar
            </button>
          </form>
        </div>

        <div>
          {searchStatus === 'idle' && (
            <div className="text-center p-10 bg-white rounded-xl shadow-lg">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600">Listo para buscar</h2>
              <p className="text-gray-500">Utilice el formulario de arriba para encontrar a un docente.</p>
            </div>
          )}

          {searchStatus === 'notFound' && (
            <div className="text-center p-10 bg-white rounded-xl shadow-lg animate-fade-in">
              <XCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600">Docente no encontrado</h2>
              <p className="text-gray-500">No se encontró ningún docente con el ID "{searchQuery}". Por favor, verifique el ID e inténtelo de nuevo.</p>
            </div>
          )}

          {searchStatus === 'found' && foundTeacher && (
            <TeacherDetails teacher={foundTeacher} />
          )}
        </div>
      </div>
    </div>
  );
}
