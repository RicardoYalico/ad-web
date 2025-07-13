import React, { useState, useEffect, useMemo } from 'react';
import { User, CalendarDays, RefreshCw, Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle } from 'lucide-react';

// --- Constantes de API ---
// Se elimina el DNI harcodeado. Se obtendrá desde localStorage.
const API_URL = 'https://kali-ad-web.beesoftware.net/api/asignacion-especialista-docentes';
const HISTORY_API_URL = 'https://kali-ad-web.beesoftware.net/api/historial-asignaciones';

// --- Mock Data (usado como fallback en caso de error de API) ---
// Estructura de datos para desarrollo o si la API falla.
const initialApiData = {
  "data": [
    {
      "_id": { "$oid": "685ae84a5c47091261010a33" },
      "periodo": "225413", "idDocente": "N00340533", "docente": "FIORENTINI/ALVAREZ, DIEGO JOSE HUMBERTO", "RolColaborador": "DOCENTE DICTANTE", "programa": "UG", "modalidad": "Presencial",
      "cursos": [
        { "nombreCurso": "FÍSICA 1", "codCurso": "FISI1207", "seccion": "FISI.1207.225413.16221.P", "periodo": "225413", "nrc": "16221", "metEdu": "P", "horarios": [{ "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM", "dia": "LUNES", "hora": "1750 - 1920", "campus": "TSI", "aula": "B308", "estadoHistorico": "NUEVO" }, { "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM", "dia": "LUNES", "hora": "1930 - 2100", "campus": "TSI", "aula": "B308", "estadoHistorico": "NUEVO" }], "estadoHistorico": "NUEVO" },
      ],
      "promedioEsa": 0.8038, "pidd": null, "estadoHistorico": "NUEVO", "semestre": "2025-1",
      "especialistaDni": "18130461",
      "nombreEspecialista": "MIRANDA GARCÍA CARMEN DOLORES",
      "fechaHoraEjecucion": "2025-06-24T19:02:02.086Z" 
    },
    {
        "_id": { "$oid": "685ae8975c47091261011735" },
      "periodo": "225413", "idDocente": "N00010858", "docente": "AGUILAR/ENRIQUEZ, CARLOS MANUEL", "RolColaborador": "DOCENTE A TIEMPO PARCIAL", "programa": "UG", "modalidad": "Presencial",
      "cursos": [
        { "nombreCurso": "CONTRATACIÓN PUBLICA", "codCurso": "DEPU1622A", "seccion": "DEPU.1622A.225413.14278.P", "periodo": "225413", "nrc": "14278", "metEdu": "P", "horarios": [ { "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM", "dia": "JUEVES", "hora": "1930 - 2100", "campus": "TML", "aula": "C301", "estadoHistorico": "NUEVO" } ], "estadoHistorico": "NUEVO" },
      ],
      "promedioEsa": 0.5783, "pidd": null, "estadoHistorico": "MODIFICADO", "semestre": "2025-1",
      "especialistaDni": "18130461",
      "nombreEspecialista": "MIRANDA GARCÍA CARMEN DOLORES",
      "fechaHoraEjecucion": "2025-06-25T17:18:14.623Z"
    }
  ]
};

// --- Helper Functions ---

/**
 * Formatea un valor numérico de ESA a un porcentaje.
 * @param {number|null|undefined} value - El valor de ESA (ej. 0.8038).
 * @returns {string} - El valor formateado como "80.38%" o "SIN ESA".
 */
const formatEsa = (value) => {
    const num = parseFloat(value);
    if (value === null || value === undefined || isNaN(num)) {
        return "SIN ESA";
    }
    return `${(num * 100).toFixed(2)}%`;
};

/**
 * Retorna clases de Tailwind CSS basadas en el estado del registro (Nuevo, Modificado).
 * @param {string} status - El estado (ej. "NUEVO", "MODIFICADO").
 * @returns {object} - Un objeto con clases para fondo, borde y resaltado.
 */
const getStatusStyles = (status) => {
    switch (status) {
        case 'NUEVO':
            return {
                background: 'bg-green-50',
                border: 'border-l-4 border-green-400',
                highlight: 'bg-green-100 border-green-500 text-green-900 hover:bg-green-200',
            };
        case 'MODIFICADO':
            return {
                background: 'bg-yellow-50',
                border: 'border-l-4 border-yellow-400',
                highlight: 'bg-yellow-100 border-yellow-500 text-yellow-900 hover:bg-yellow-200',
            };
        default:
            return {
                background: 'bg-white',
                border: 'border-l-4 border-transparent',
                highlight: 'bg-blue-100 border-blue-500 text-blue-900 hover:bg-blue-200',
            };
    }
};

// --- Sub-Components ---

/**
 * Muestra una insignia de estado con colores distintivos.
 */
const StatusBadge = ({ status }) => {
    if (!status) return null;
    
    const styles = {
        NUEVO: 'bg-green-100 text-green-800',
        MODIFICADO: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};

/**
 * Tarjeta para mostrar una estadística clave en el encabezado.
 */
const HeaderStatCard = ({ icon, title, value, bgColor, textColor }) => (
    <div className={`flex items-center p-4 rounded-xl shadow-sm ${bgColor}`}>
        <div className="p-3 rounded-full bg-white bg-opacity-50">
            {icon}
        </div>
        <div className="ml-4">
            <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
    </div>
);


/**
 * Tarjeta para mostrar una estadística clave.
 */
const StatCard = ({ icon, label, value, colorClass = 'text-gray-700', isHighlighted = false }) => (
  <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center shadow-sm ${isHighlighted ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-gray-100/80'}`}>
    <div className={`${isHighlighted ? 'text-blue-700' : 'text-blue-600'} mb-2`}>{icon}</div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className={`font-bold ${colorClass} ${isHighlighted ? 'text-2xl text-blue-800' : 'text-xl'}`}>{value}</div>
  </div>
);

/**
 * Píldora de información compacta con ícono, etiqueta y valor.
 */
const InfoPill = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center bg-slate-200/60 p-3 rounded-lg text-center">
        <div className="flex items-center text-xs text-gray-500 font-semibold mb-1">
            {icon}
            <span className="ml-1.5">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{value || 'N/A'}</span>
    </div>
);

/**
 * Tarjeta especial para mostrar información de un curso PIDD.
 */
const PiddCourseCard = ({ piddData }) => (
    <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-2xl shadow-md mb-6">
        <div className="flex items-center mb-4">
            <AlertTriangle className="text-amber-600 mr-3" size={24} />
            <h4 className="text-xl font-bold text-amber-800">{piddData.nombreCurso}</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoPill icon={<Tag size={14}/>} label="Cód. Curso" value={piddData.codCurso} />
            <InfoPill icon={<TrendingUp size={14}/>} label="ESA Curso" value={formatEsa(piddData.esaCurso)} />
            <InfoPill icon={<Star size={14}/>} label="Rúbrica Curso" value={piddData.rubricaCurso || 'N/A'} />
            <InfoPill icon={<Briefcase size={14}/>} label="Dispersión" value={piddData.dispersionCurso || 'N/A'} />
        </div>
    </div>
);

/**
 * Modal para mostrar los detalles de un evento del calendario (una clase).
 */
const ScheduleDetailModal = ({ event, onClose }) => {
    if (!event) return null;
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'});
        } catch (e) { return 'Fecha inválida'; }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-800">{event.name}</h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20} /></button>
                    </div>
                   <div className="flex items-center space-x-2 mt-2">
                        <StatusBadge status={event.estadoHistorico} />
                        {event.isPidd && <p className={`px-3 py-1 text-sm font-semibold rounded-full inline-block bg-amber-100 text-amber-800`}>Curso en Plan de Mejora</p>}
                   </div>
                    <div className="mt-6 space-y-3 text-gray-700">
                        <p><strong>Sección:</strong> {event.section || 'No especificada'}</p>
                        <p><strong>NRC:</strong> {event.nrc || 'No especificado'}</p>
                        <p><strong>Código del Curso:</strong> {event.code || 'No especificado'}</p>
                        <p><strong>Periodo:</strong> {event.periodo || 'No especificado'}</p>
                        <p><strong>Metodología:</strong> {event.metEdu || 'No especificada'}</p>
                        <hr className="my-3"/>
                        <p><strong>Horario:</strong> {event.time || 'No especificado'}</p>
                        <p><strong>Campus:</strong> {event.campus || 'No especificado'}</p>
                        <p><strong>Aula:</strong> {event.aula || 'No especificada'}</p>
                        <p><strong>Fechas:</strong> {formatDate(event.fechaInicio)} - {formatDate(event.fechaFin)}</p>
                        {event.isPidd && <p><strong>ESA Curso:</strong> {formatEsa(event.esaCurso)}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Componente de vista de calendario semanal.
 */
const CalendarView = ({ courses, pidd, onEventClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dayNameToNumber = (name) => {
        if (!name) return -1;
        const lowerName = name.toLowerCase();
        const map = { 'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6 };
        for (const key in map) {
            if (lowerName.includes(key)) return map[key];
        }
        return -1;
    };
    
    const getFormattedDateKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const scheduledEvents = useMemo(() => {
        const events = {};
        if (!courses) return events;
        courses.forEach(course => {
            course.horarios?.forEach(horario => {
                if (!horario.fechaInicio || !horario.fechaFin) return;
                
                const startDate = new Date(horario.fechaInicio);
                const endDate = new Date(horario.fechaFin);
                const dayIndex = dayNameToNumber(horario.dia);

                if (dayIndex === -1) return;

                let currentDateInLoop = new Date(startDate);
                while(currentDateInLoop <= endDate) {
                    if (currentDateInLoop.getDay() === dayIndex) {
                        const dateKey = getFormattedDateKey(currentDateInLoop);
                        if (!events[dateKey]) events[dateKey] = [];
                        const isPiddCourse = pidd?.codCurso === course.codCurso;
                        
                        const eventStatus = horario.estadoHistorico || course.estadoHistorico;

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
                            isPidd: isPiddCourse,
                            esaCurso: isPiddCourse ? pidd.esaCurso : null,
                            estadoHistorico: eventStatus
                        });
                    }
                    currentDateInLoop.setDate(currentDateInLoop.getDate() + 1);
                }
            });
        });
        return events;
    }, [courses, pidd]);

    const changeWeek = (offset) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + (offset * 7));
            return newDate;
        });
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const weekDayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    
    const timeStringToMinutes = (timeStr) => {
        if(!timeStr) return 0;
        const cleanedTime = timeStr.replace(/\s/g, '').replace(":", "");
        if (cleanedTime.length < 4) return 0;
        const hours = parseInt(cleanedTime.substring(0, 2), 10);
        const minutes = parseInt(cleanedTime.substring(2, 4), 10);
        return hours * 60 + minutes;
    };

    const EventCard = ({ event, onClick }) => {
        const styles = getStatusStyles(event.estadoHistorico);
        
        if(!event.time) return null;
        const [start, end] = event.time.split('-').map(t => t.trim());
        if(!start || !end) return null;
        
        const startMinutes = timeStringToMinutes(start);
        const endMinutes = timeStringToMinutes(end);
        if (isNaN(startMinutes) || isNaN(endMinutes)) return null;

        const top = ((startMinutes - (7 * 60)) / 60) * 5; // 5rem per hour, starting from 7am
        const height = ((endMinutes - startMinutes) / 60) * 5;

        return (
            <button
                onClick={() => onClick(event)}
                className={`absolute w-[96%] left-[2%] p-2 text-left text-xs rounded-lg shadow-md overflow-hidden transition-colors ${event.isPidd ? 'bg-amber-100 border-l-4 border-amber-500 text-amber-900 hover:bg-amber-200' : styles.highlight}`}
                style={{ top: `${top}rem`, height: `${height}rem`, zIndex: 10 }}
            >
                <p className="font-bold truncate">{event.name}</p>
                <p className="font-semibold truncate">NRC: {event.nrc}</p>
                <p className="truncate">Cód: {event.code}</p>
                <p className="truncate">Mod: {event.metEdu ? `${event.metEdu.charAt(0)}.` : ''} ({event.time})</p>
                {event.estadoHistorico && <StatusBadge status={event.estadoHistorico} />}
            </button>
        );
    };

    const renderWeeklyView = () => {
        const timeSlots = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1));

        return (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="flex">
                    <div className="w-20 text-right text-xs text-gray-500 flex-shrink-0">
                        <div className="h-20 border-r border-b"></div>
                        {timeSlots.map(time => <div key={time} className="h-20 pr-2 border-r border-t flex justify-end items-start pt-1">{time}</div>)}
                    </div>
                    <div className="flex-1 grid grid-cols-7">
                        {weekDayNames.map((dayName, index) => {
                            const currentColumnDate = new Date(startOfWeek);
                            currentColumnDate.setDate(startOfWeek.getDate() + index);
                            const dateKey = getFormattedDateKey(currentColumnDate);
                            const eventsForDay = scheduledEvents[dateKey] || [];
                            return (
                                <div key={index} className="border-r relative">
                                    <div className="text-center p-2 border-b-2 h-20 flex flex-col justify-center">
                                        <span className="font-semibold text-gray-500 text-sm">{dayName}</span>
                                        <span className="text-3xl font-light mt-1">{currentColumnDate.getDate()}</span>
                                    </div>
                                    <div className="relative h-full">
                                        {timeSlots.map((_, i) => <div key={i} className="h-20 border-t"></div>)}
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
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft /></button>
                    <h3 className="text-xl font-bold mx-4">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight /></button>
                </div>
                <p className="text-sm text-gray-600">Vista Semanal</p>
            </div>
            {renderWeeklyView()}
        </div>
    );
};

/**
 * Tarjeta para mostrar los detalles de un horario específico.
 */
const HorarioCardComponent = ({ horario }) => {
    const styles = getStatusStyles(horario.estadoHistorico);
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'}); } catch (e) { return 'Fecha inválida'; }
    };
    return(
        <div className={`border-t border-gray-200 mt-3 pt-3 p-2 rounded-md ${styles.border} relative`}>
             {horario.estadoHistorico && (
                   <div className="absolute top-2 right-2">
                       <StatusBadge status={horario.estadoHistorico} />
                   </div>
             )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                  <p><strong>Campus:</strong> {horario.campus || 'N/A'}</p>
                  <p><strong>Aula:</strong> {horario.aula || 'N/A'}</p>
                  <p><strong>Día:</strong> {horario.dia || 'N/A'}</p>
                  <p><strong>Hora:</strong> {horario.hora || 'N/A'}</p>
                  <p className="sm:col-span-2"><strong>Periodo:</strong> {formatDate(horario.fechaInicio)} - {formatDate(horario.fechaFin)}</p>
              </div>
        </div>
    );
};

/**
 * Modal que muestra toda la información detallada de un docente.
 */
const TeacherDetailModal = ({ teacher, onClose }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { pidd, cursos, RolColaborador, promedioEsa, idDocente, programa, modalidad, estadoHistorico, nombreEspecialista } = teacher;
  const docenteNombre = teacher.docente || (pidd ? pidd.docente : `Docente ${idDocente}`);
  const hasPiddCourse = pidd && pidd.nombreCurso;

  const TabButton = ({ tabName, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-slate-100 rounded-2xl shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-slate-100/80 backdrop-blur-sm p-4 border-b border-slate-200 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Detalles del Docente</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-300 transition-colors"><X size={24}/></button>
        </div>
        
        <div className="p-4 sm:p-6 lg:p-8 flex-grow overflow-y-auto">
            <header className="mb-6 bg-white p-6 rounded-2xl shadow-md">
                <div className="flex items-start space-x-6 mb-5">
                    <div className="bg-blue-600 text-white rounded-full h-20 w-20 flex-shrink-0 flex items-center justify-center text-4xl font-bold">{docenteNombre.charAt(0)}</div>
                    <div>
                        <div className="flex items-center space-x-3">
                            <h1 className="text-3xl font-bold text-gray-800">{docenteNombre}</h1>
                            <StatusBadge status={estadoHistorico} />
                        </div>
                        <p className="text-md text-gray-500">{RolColaborador || 'Cargo no disponible'}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <InfoPill icon={<Shield size={14}/>} label="ID Docente" value={idDocente} />
                    <InfoPill icon={<Briefcase size={14}/>} label="Especialista Pedagógico" value={nombreEspecialista || 'No Asignado'} />
                    <InfoPill icon={<Tag size={14}/>} label="Programa" value={programa} />
                    <InfoPill icon={<Tag size={14}/>} label="Modalidad" value={modalidad} />
                </div>
            </header>

            <div className="bg-slate-100 -mx-8 px-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <TabButton tabName="calendar" label="Calendario" />
                        <TabButton tabName="details" label="Detalles" />
                    </nav>
                </div>
            </div>
            
            <div className="mt-6">
                {activeTab === 'details' && (
                    <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {hasPiddCourse && <PiddCourseCard piddData={pidd} />}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-blue-200 pb-2">Todos los Cursos Programados</h3>
                                {cursos?.map((curso, i) => {
                                  const cursoStyles = getStatusStyles(curso.estadoHistorico);
                                  return(
                                    <div key={curso.seccion || i} className={`p-6 rounded-2xl shadow-md mt-4 ${cursoStyles.background} ${cursoStyles.border}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                  <h4 className="text-xl font-semibold text-gray-800">{curso.nombreCurso}</h4>
                                                  <StatusBadge status={curso.estadoHistorico} />
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">Sección: {curso.seccion || 'No especificada'}</p>
                                            </div>
                                            <div className="text-right text-xs">
                                                <p><strong>Periodo:</strong> {curso.periodo}</p>
                                                <p><strong>Met. Edu.:</strong> {curso.metEdu}</p>
                                            </div>
                                        </div>
                                        {curso.horarios?.map((h, hi) => <HorarioCardComponent key={hi} horario={h} />)}
                                    </div>
                                  )
                                })}
                            </div>
                        </div>
                        <aside className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-blue-200 pb-2">Métricas Generales</h3>
                            <div className="bg-white p-4 rounded-2xl shadow-md">
                                <div className="grid grid-cols-1 gap-4">
                                    <StatCard icon={<TrendingUp size={28}/>} label="Promedio ESA Modalidad" value={formatEsa(promedioEsa)} isHighlighted={true} />
                                    {pidd && (
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
                                            <StatCard icon={<TrendingUp size={24}/>} label="ESA General (PIDD)" value={formatEsa(pidd.esa)} />
                                            <StatCard icon={<Star size={24}/>} label="Rúbrica" value={pidd.rubrica} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </main>
                )}
                {activeTab === 'calendar' && (
                    <CalendarView courses={cursos} pidd={pidd} onEventClick={setSelectedSchedule} />
                )}
            </div>
        </div>
        {selectedSchedule && <ScheduleDetailModal event={selectedSchedule} onClose={() => setSelectedSchedule(null)} />}
      </div>
    </div>
  );
};

/**
 * Componente para mostrar notificaciones de historial de cambios.
 */
const Notifications = ({ history, currentDni, onDismiss, isLoading }) => {
    // Muestra un loader mientras se carga el historial
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex items-center justify-center min-h-[100px]">
                <Loader className="animate-spin h-6 w-6 text-blue-600 mr-3" />
                <span className="text-gray-500">Cargando historial de cambios...</span>
            </div>
        );
    }

    // No renderiza nada si no hay historial para mostrar
    if (!history || history.length === 0) {
        return null;
    }

    /**
     * Determina el mensaje, ícono y color de la notificación basado en el tipo de cambio.
     * @param {object} item - El objeto de historial.
     * @returns {object} - Un objeto con ícono, mensaje y clases de estilo.
     */
    const getNotificationInfo = (item) => {
        const { docente, detalleAnterior, nombreEspecialista, especialistaDni, estadoCambio } = item;
        
        if (estadoCambio === 'REASIGNADO') {
            // Caso 1: El docente fue asignado AL especialista actual.
            if (especialistaDni === currentDni) {
                return {
                    icon: <CheckCircle className="text-green-500" size={20} />,
                    message: (
                        <span>
                            Se te ha asignado el docente <strong className="font-semibold">{docente}</strong>. Anteriormente estaba a cargo de {detalleAnterior?.nombreEspecialista || 'N/A'}.
                        </span>
                    ),
                    bgColor: 'bg-green-50/70 border-green-200'
                };
            }
            // Caso 2: El docente fue reasignado DESDE el especialista actual a otro.
            if (detalleAnterior?.especialistaDni === currentDni) {
                 return {
                    icon: <AlertTriangle className="text-orange-500" size={20} />,
                    message: (
                       <span>
                          El docente <strong className="font-semibold">{docente}</strong> ha sido reasignado a <strong className="font-semibold">{nombreEspecialista || 'N/A'}</strong>.
                       </span>
                    ),
                    bgColor: 'bg-orange-50/70 border-orange-200'
                 };
            }
        }
        
        // Fallback para otros cambios que podrían ser relevantes para el especialista consultado
        return {
            icon: <History className="text-blue-500" size={20} />,
            message: `Hubo una actualización para el docente ${docente}.`,
            bgColor: 'bg-blue-50/70 border-blue-200'
        };
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div className="flex items-center mb-4">
                <History className="text-blue-600 mr-3" size={24}/>
                <h2 className="text-xl font-bold text-gray-800">Notificaciones de Cambios</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {history.map(item => {
                    const { icon, message, bgColor } = getNotificationInfo(item);
                    return (
                        <div key={item._id} className={`p-4 rounded-lg flex items-start justify-between border ${bgColor} transition-all`}>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-4 mt-0.5">
                                    {icon}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-800">{message}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                                        <Clock size={12} className="mr-1.5" />
                                        {new Date(item.createdAt || item.fechaHoraEjecucion).toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => onDismiss(item._id)} className="p-1 -mr-1 -mt-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 flex-shrink-0 ml-2">
                               <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Lógica del Panel de Control para el Especialista ---
const DashboardPage = () => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [piddFilter, setPiddFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [programFilter, setProgramFilter] = useState('Todos');
    const [modalityFilter, setModalityFilter] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [currentSemester, setCurrentSemester] = useState('N/A');
    const [executionDate, setExecutionDate] = useState(null);
    const [history, setHistory] = useState([]);
    const [dismissedNotifications, setDismissedNotifications] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [specialistDni, setSpecialistDni] = useState(null); // Estado para el DNI del especialista
    const itemsPerPage = 10;
    
    /**
     * Obtiene los datos de los docentes asignados desde la API.
     * @param {string} dni - El DNI del especialista para la consulta.
     */
    const fetchData = async (dni) => {
        if (!dni) {
            console.warn("No DNI provided to fetchData, skipping API call.");
            setTeachers([]);
            setIsTableLoading(false);
            return;
        }
        setIsTableLoading(true);
        try {
            const url = `${API_URL}?latest=true&dniEspecialista=${dni}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }
            const data = await response.json();
            const assignments = data.data || [];
            setTeachers(assignments);

            if (assignments.length > 0) {
                setCurrentSemester(assignments[0].semestre || 'N/A');
                setExecutionDate(assignments[0].fechaHoraEjecucion || null);
            } else {
                setCurrentSemester('N/A');
                setExecutionDate(null);
            }
        } catch (error) {
            console.error("Error al cargar los datos de docentes:", error);
            const fallbackAssignments = initialApiData.data || [];
            setTeachers(fallbackAssignments);
            if (fallbackAssignments.length > 0) {
                 setCurrentSemester(fallbackAssignments[0].semestre || 'N/A');
                 setExecutionDate(fallbackAssignments[0].fechaHoraEjecucion || null);
            }
        } finally {
            setIsTableLoading(false);
        }
    };

    /**
     * Obtiene el historial de cambios para el especialista.
     * @param {string} dni - El DNI del especialista para la consulta.
     */
    const fetchHistory = async (dni) => {
        if (!dni) {
            console.warn("No DNI provided to fetchHistory, skipping API call.");
            setHistory([]);
            setIsHistoryLoading(false);
            return;
        }
        setIsHistoryLoading(true);
        try {
            const url = `${HISTORY_API_URL}?dniEspecialista=${dni}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error en la API de historial: ${response.status}`);
            }
            const data = await response.json();
            // La API debería devolver un array de cambios relevantes para el DNI consultado.
            setHistory(data || []);
        } catch (error) {
            console.error("Error al cargar el historial de cambios:", error);
            setHistory([]); // En caso de error, el historial queda vacío.
        } finally {
            setIsHistoryLoading(false);
        }
    };

    // Efecto para obtener el DNI del usuario desde localStorage y cargar los datos iniciales.
    useEffect(() => {
        const loadInitialData = async () => {
            let dniFromStorage = null;
            try {
                const currentUserJSON = localStorage.getItem('currentUser');
                if (currentUserJSON) {
                    const currentUser = JSON.parse(currentUserJSON);
                    dniFromStorage = currentUser?.dni;
                    setSpecialistDni(dniFromStorage); 
                } else {
                    console.warn("currentUser no se encontró en localStorage. No se cargarán datos.");
                }
            } catch (error) {
                console.error("Error al leer el DNI desde localStorage:", error);
            }
            
            // Llama a las funciones de fetch con el DNI obtenido.
            // Estas funciones ya manejan el caso en que dniFromStorage sea nulo.
            await fetchData(dniFromStorage);
            await fetchHistory(dniFromStorage);
        };
        
        loadInitialData();
    }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar el componente.

    const programOptions = useMemo(() => ['Todos', ...new Set(teachers.map(t => t.programa).filter(Boolean))], [teachers]);
    const modalityOptions = useMemo(() => ['Todos', ...new Set(teachers.map(t => t.modalidad).filter(Boolean))], [teachers]);

    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const pidd = teacher.pidd;
            const teacherName = teacher.docente || (pidd ? pidd.docente : '');
            const teacherId = teacher.idDocente || '';
            
            const searchTermMatch = teacherName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    teacherId.toLowerCase().includes(searchTerm.toLowerCase());
            const piddMatch = piddFilter === 'Todos' ||
                                (piddFilter === 'Con PIDD' && teacher.pidd !== null) ||
                                (piddFilter === 'Sin PIDD' && teacher.pidd === null);
            const programMatch = programFilter === 'Todos' || teacher.programa === programFilter;
            const modalityMatch = modalityFilter === 'Todos' || teacher.modalidad === modalityFilter;
            const statusMatch = statusFilter === 'Todos' || teacher.estadoHistorico === statusFilter;
            
            return searchTermMatch && piddMatch && programMatch && modalityMatch && statusMatch;
        });
    }, [teachers, searchTerm, piddFilter, programFilter, modalityFilter, statusFilter]);

    const statsCards = useMemo(() => {
        const totalTeachers = filteredTeachers.length;
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
          { id: 1, title: "Docentes Asignados", value: totalTeachers, icon: <User className="w-8 h-8 text-indigo-500" />, bgColor: "bg-indigo-100", textColor: "text-indigo-800" },
          { id: 2, title: "Semestre Actual", value: currentSemester, icon: <CalendarDays className="w-8 h-8 text-teal-500" />, bgColor: "bg-teal-100", textColor: "text-teal-800" },
          { id: 3, title: "Última Actualización", value: lastUpdated, icon: <RefreshCw className="w-8 h-8 text-rose-500" />, bgColor: "bg-rose-100", textColor: "text-rose-800" },
        ];
    }, [filteredTeachers.length, currentSemester, executionDate]);
    
    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTeachers, currentPage, itemsPerPage]);
    
    const visibleHistory = useMemo(() => {
        // Ordena por fecha (más nuevo primero) y filtra los descartados.
        return history
            .sort((a, b) => new Date(b.createdAt || b.fechaHoraEjecucion) - new Date(a.createdAt || a.fechaHoraEjecucion))
            .filter(item => !dismissedNotifications.includes(item._id));
    }, [history, dismissedNotifications]);

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };
    
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
    const handleDismissNotification = (id) => {
        setDismissedNotifications(prev => [...prev, id]);
    };

    const getRoleBadge = (role) => {
        if (!role) return 'bg-gray-200 text-gray-800';
        if (role.toLowerCase().includes('tiempo completo')) return 'bg-green-100 text-green-800';
        if (role.toLowerCase().includes('tiempo parcial')) return 'bg-blue-100 text-blue-800';
        if (role.toLowerCase().includes('jefe de práctica')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-200 text-gray-800';
    }

    return (
        <div className="bg-slate-100 font-sans min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="mx-auto">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Mis Docentes Asignados</h1>
                    <p className="text-lg text-gray-500 mt-1">Visualiza los docentes a tu cargo, junto con sus indicadores clave y el estado de su asignación para el semestre.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {statsCards.map(card => (
                        <HeaderStatCard 
                            key={card.id}
                            icon={card.icon}
                            title={card.title}
                            value={card.value}
                            bgColor={card.bgColor}
                            textColor={card.textColor}
                        />
                    ))}
                </div>
                
                {/* --- Nueva sección de notificaciones --- */}
                <Notifications 
                    history={visibleHistory}
                    currentDni={specialistDni}
                    onDismiss={handleDismissNotification}
                    isLoading={isHistoryLoading}
                />
                
                <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                   <h2 className="text-xl font-bold text-gray-800 mb-4">Filtrar Docentes</h2>
                    <fieldset disabled={isTableLoading} className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o ID del docente..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="pidd-filter" className="block text-sm font-medium text-gray-700 mb-1">Estado PIDD</label>
                                <select id="pidd-filter" value={piddFilter} onChange={e => handleFilterChange(setPiddFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Todos">Todos</option>
                                    <option value="Con PIDD">Con PIDD</option>
                                    <option value="Sin PIDD">Sin PIDD</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Estado Histórico</label>
                                <select id="status-filter" value={statusFilter} onChange={e => handleFilterChange(setStatusFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Todos">Todos</option>
                                    <option value="NUEVO">Nuevo</option>
                                    <option value="MODIFICADO">Modificado</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 mb-1">Programa</label>
                                <select id="program-filter" value={programFilter} onChange={e => handleFilterChange(setProgramFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    {programOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="modality-filter" className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                                <select id="modality-filter" value={modalityFilter} onChange={e => handleFilterChange(setModalityFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    {modalityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                        </fieldset>
                </div>
                
                <div className="overflow-x-auto bg-white rounded-2xl shadow-md min-h-[400px]">
                    {isTableLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[400px]">
                            <Loader className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                            <span className="text-gray-600 font-medium">Cargando datos de docentes...</span>
                        </div>
                    ) : paginatedTeachers.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Docente</th>
                                    <th scope="col" className="px-6 py-3">ID Docente</th>
                                    <th scope="col" className="px-6 py-3">Rol</th>
                                    <th scope="col" className="px-6 py-3">Programa</th>
                                    <th scope="col" className="px-6 py-3">Modalidad</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ver Detalles</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTeachers.map((teacher) => {
                                  const rowStyles = getStatusStyles(teacher.estadoHistorico);
                                  return (
                                    <tr key={teacher._id?.$oid || teacher.idDocente} className={`border-b hover:bg-gray-50 ${rowStyles.border}`}>
                                        <td className={`px-6 py-4 font-medium text-gray-900 whitespace-nowrap`}>
                                            <div className="flex items-center gap-2">
                                                {teacher.estadoHistorico && <div className={`w-2.5 h-2.5 rounded-full ${teacher.estadoHistorico === 'NUEVO' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>}
                                                <span>{teacher.docente || (teacher.pidd ? teacher.pidd.docente : 'Nombre no disponible')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{teacher.idDocente}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 font-semibold text-xs rounded-full ${getRoleBadge(teacher.RolColaborador)}`}>
                                                {teacher.RolColaborador}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{teacher.programa}</td>
                                        <td className="px-6 py-4">{teacher.modalidad}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedTeacher(teacher)} className="font-medium text-blue-600 hover:underline">
                                                Ver Detalles
                                            </button>
                                        </td>
                                    </tr>
                                  )
                                })}
                            </tbody>
                        </table>
                    ) : (
                         <div className="flex justify-center items-center h-full min-h-[400px]">
                            <p className="text-gray-500 text-center">No se encontraron docentes.<br/>Intenta ajustar los filtros o verifica que has iniciado sesión.</p>
                         </div>
                    )}
                </div>

                {totalPages > 0 && !isTableLoading && (
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {selectedTeacher && (
                <TeacherDetailModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />
            )}
        </div>
    );
};

export default DashboardPage;
