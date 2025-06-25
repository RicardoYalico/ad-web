import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle } from 'lucide-react';

// --- Mock Data (usado como fallback en caso de error de API) ---
// --- ACTUALIZADO para reflejar la estructura de historial de la API ---
const initialApiData = {
  "data": [
    {
      "_id": { "$oid": "685ae84a5c47091261010a33" },
      "periodo": "225413", "idDocente": "N00340533", "docente": "FIORENTINI/ALVAREZ, DIEGO JOSE HUMBERTO", "RolColaborador": "DOCENTE DICTANTE", "programa": "UG", "modalidad": "Presencial",
      "cursos": [
        { "nombreCurso": "FÍSICA 1", "codCurso": "FISI1207", "seccion": "FISI.1207.225413.16221.P", "periodo": "225413", "nrc": "16221", "metEdu": "P", "horarios": [{ "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM", "dia": "LUNES", "hora": "1750 - 1920", "campus": "TSI", "aula": "B308", "estadoHistorico": "NUEVO" }, { "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM", "dia": "LUNES", "hora": "1930 - 2100", "campus": "TSI", "aula": "B308", "estadoHistorico": "NUEVO" }], "estadoHistorico": "NUEVO" },
      ],
      "promedioEsa": 0.8038, "pidd": null, "estadoHistorico": "NUEVO", "semestre": "2025-1",
      "fechaHoraEjecucion": "2025-06-24T19:02:02.086Z" 
    },
    {
       "_id": { "$oid": "685ae8975c47091261011735" },
      "periodo": "225413", "idDocente": "N00340533", "docente": "FIORENTINI/ALVAREZ, DIEGO JOSE HUMBERTO", "RolColaborador": "DOCENTE DICTANTE", "programa": "UG", "modalidad": "Presencial",
      "cursos": [
         { "nombreCurso": "FÍSICA 3", "codCurso": "FISI1209", "seccion": "FISI.1209.225413.6168.P", "periodo": "225413", "nrc": "6168", "metEdu": "P", "horarios": [ { "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM", "dia": "MARTES", "hora": "1610 - 1740", "campus": "TSI", "aula": "A301", "estadoHistorico": "NUEVO" } ], "estadoHistorico": "NUEVO" },
      ],
       "promedioEsa": 0.8038, "pidd": null, "estadoHistorico": "MODIFICADO", "semestre": "2025-1",
       "fechaHoraEjecucion": "2025-06-24T18:51:49.620Z"
    }
  ]
};

// --- Helper para formatear ESA ---
const formatEsa = (value) => {
    const num = parseFloat(value);
    if (value === null || value === undefined || isNaN(num)) {
        return "SIN ESA";
    }
    return `${(num * 100).toFixed(2)}%`;
};

// --- NUEVO: Componente para badges de estado ---
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

// --- CORREGIDO: Convertido de Hook a función auxiliar ---
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


// --- Componente de superposición de carga ---
const LoadingOverlay = ({ message, progress, hasError = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex flex-col justify-center items-center text-white p-4">
        {!hasError && <Loader className="animate-spin h-12 w-12 text-white mb-6" />}
        {hasError && <AlertTriangle className="h-12 w-12 text-red-500 mb-6" />}
        <h2 className="text-2xl font-bold mb-2 text-center">{hasError ? "Error en el Proceso" : "Generando Asignación..."}</h2>
        <p className="text-gray-300 mb-6 text-center max-w-md">{hasError ? "Ocurrió un problema." : "Este proceso puede tardar. Por favor, no cierres esta ventana."}</p>
        <div className="w-full max-w-lg text-center p-6 bg-gray-800/60 rounded-xl shadow-lg">
            <p className="mb-4 font-medium text-lg min-h-[56px] flex items-center justify-center">{message}</p>
             {!hasError && (
                <>
                    <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}>
                        </div>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{progress}% completado</p>
                </>
            )}
        </div>
    </div>
);

// --- Componente de Notificación ---
const Notification = ({ type, title, message, onDismiss }) => {
    const baseClasses = "p-4 rounded-lg shadow-md flex items-start";
    const typeClasses = {
    error: "bg-red-50 border-l-4 border-red-500 text-red-800",
    success: "bg-green-50 border-l-4 border-green-500 text-green-800",
    };
    const icon = {
    error: <AlertTriangle className="mr-3 h-5 w-5" />,
    success: <CheckCircle className="mr-3 h-5 w-5" />,
    };

    return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
        {icon[type]}
        <div className="flex-1">
        <p className="font-bold">{title}</p>
        <p className="text-sm">{message}</p>
        </div>
        <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-black/10"><X size={18} /></button>
    </div>
    );
};

// --- Componente de Modal de Confirmación ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isProcessing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                <p className="text-gray-600 mt-2 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} disabled={isProcessing} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center">
                        {isProcessing && <Loader className="animate-spin mr-2 h-4 w-4" />}
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
const StatCard = ({ icon, label, value, colorClass = 'text-gray-700', isHighlighted = false }) => (
  <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center shadow-sm ${isHighlighted ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-gray-100/80'}`}>
    <div className={`${isHighlighted ? 'text-blue-700' : 'text-blue-600'} mb-2`}>{icon}</div>
    <div className="text-sm font-medium text-gray-500">{label}</div>
    <div className={`font-bold ${colorClass} ${isHighlighted ? 'text-2xl text-blue-800' : 'text-xl'}`}>{value}</div>
  </div>
);
const InfoPill = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center bg-slate-200/60 p-3 rounded-lg text-center">
        <div className="flex items-center text-xs text-gray-500 font-semibold mb-1">
            {icon}
            <span className="ml-1.5">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{value || 'N/A'}</span>
    </div>
);
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

        const top = ((startMinutes - (7 * 60)) / 60) * 5;
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
const TeacherDetailModal = ({ teacher, onClose }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { pidd, cursos, RolColaborador, promedioEsa, idDocente, programa, modalidad, estadoHistorico } = teacher;
  const docenteNombre = teacher.docente || (pidd ? pidd.docente : `Docente ${idDocente}`);
  const hasPiddCourse = pidd && pidd.nombreCurso;

  const especialistaNombres = ["Ana Gómez", "Luis Fernández", "Carla Ruiz", "Juan Torres", "María López"];
  const especialistaAsignado = useMemo(() => especialistaNombres[Math.floor(Math.random() * especialistaNombres.length)], [idDocente]);

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
                    <InfoPill icon={<Briefcase size={14}/>} label="Especialista Pedagógico" value={especialistaAsignado} />
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

// --- Componente Principal ---
export default function AssignmentsPage() {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [piddFilter, setPiddFilter] = useState('Todos');
    const [statusFilter, setStatusFilter] = useState('Todos'); // NUEVO estado para el filtro de estado
    const [programFilter, setProgramFilter] = useState('Todos');
    const [modalityFilter, setModalityFilter] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const [periodoAsignacion, setPeriodoAsignacion] = useState('2025-1');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState({ message: '', progress: 0, error: false });
    const [isTableLoading, setIsTableLoading] = useState(true);

    const [showReport, setShowReport] = useState(false);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [expandedSemesters, setExpandedSemesters] = useState({});
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    const mockReportData = {
        "2025-1": [
            { id: "rep1", fechaCarga: "15/06/2025", cantidad: 1250, ultimaActualizacion: new Date().toISOString() },
            { id: "rep2", fechaCarga: "01/06/2025", cantidad: 1245, ultimaActualizacion: "2025-06-01T10:00:00.000Z" },
        ],
        "2024-2": [
            { id: "rep4", fechaCarga: "10/12/2024", cantidad: 1180, ultimaActualizacion: "2024-12-10T10:00:00.000Z" },
        ]
    };

    const formatDateTime = (isoString) => {
      if (!isoString) return 'N/A';
      try {
        return new Date(isoString).toLocaleString('es-ES', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit',
        });
      } catch (e) {
        return 'Fecha inválida';
      }
    };

    const fetchReportHistory = async () => {
        setIsReportLoading(true);
        setReportError(null);
        try {
            await new Promise(res => setTimeout(res, 1500));
            setReportData(mockReportData);
        } catch (error) {
            setReportError(error.message);
        } finally {
            setIsReportLoading(false);
        }
    };

    const toggleReport = () => {
        const newShowState = !showReport;
        setShowReport(newShowState);
        if (newShowState && !reportData) {
            fetchReportHistory();
        }
    };

    const handleDeleteReportClick = (report) => {
        setReportToDelete(report);
    };

    const handleConfirmDelete = async () => {
        if (!reportToDelete) return;
        setIsProcessingDelete(true);
        try {
            await new Promise(res => setTimeout(res, 1000));
            const updatedData = { ...reportData };
            for (const semester in updatedData) {
                const initialLength = updatedData[semester].length;
                updatedData[semester] = updatedData[semester].filter(r => r.id !== reportToDelete.id);
                if (updatedData[semester].length !== initialLength) {
                    if (updatedData[semester].length === 0) {
                        delete updatedData[semester];
                    }
                    break;
                }
            }
            setReportData(updatedData);
        } catch (error) {
            console.error("Error al eliminar:", error);
            setReportError("No se pudo eliminar el registro. Intente de nuevo.");
        } finally {
            setIsProcessingDelete(false);
            setReportToDelete(null);
        }
    };

    const toggleSemesterExpansion = (semester) => {
        setExpandedSemesters(prev => ({
            ...prev,
            [semester]: !prev[semester]
        }));
    };


    const fetchData = async () => {
        setIsTableLoading(true);
        try {
            const response = await fetch('https://kali-ad-web.beesoftware.net/api/asignaciones/latest');
            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }
            const data = await response.json();
            setTeachers(data.data || []);
        } catch (error) {
            console.error("Error al cargar los datos de docentes:", error);
            setTeachers(initialApiData.data || []);
        } finally {
            setIsTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const periodOptions = useMemo(() => {
        const options = [];
        for (let year = 2023; year <= 2027; year++) {
            options.push(`${year}-1`);
            options.push(`${year}-2`);
        }
        return options;
    }, []);

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
  
    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTeachers, currentPage, itemsPerPage]);

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
  
    const getRoleBadge = (role) => {
        if (!role) return 'bg-gray-200 text-gray-800';
        if (role.toLowerCase().includes('tiempo completo')) return 'bg-green-100 text-green-800';
        if (role.toLowerCase().includes('tiempo parcial')) return 'bg-blue-100 text-blue-800';
        if (role.toLowerCase().includes('jefe de práctica')) return 'bg-yellow-100 text-yellow-800';
        return 'bg-gray-200 text-gray-800';
    }

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationStatus({ message: 'Iniciando proceso...', progress: 0, error: false });

        try {
            setGenerationStatus({ message: `Generando asignación para el periodo ${periodoAsignacion}...`, progress: 25, error: false });
            
            const response = await fetch('https://kali-ad-web.beesoftware.net/api/sp-da002-limpiar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ semestre: periodoAsignacion }),
            });

            if (!response.ok) {
                let errorMessage = `La API respondió con un error ${response.status}`;
                try {
                    const errorJson = await response.json();
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            setGenerationStatus({ message: `Proceso completado. ${result.total || 0} registros procesados. Actualizando...`, progress: 75, error: false });
            await new Promise(res => setTimeout(res, 1500)); 

            await fetchData();
            if (showReport) await fetchReportHistory();
            
            setGenerationStatus({ message: '¡Actualización completada con éxito!', progress: 100, error: false });
            await new Promise(res => setTimeout(res, 2000));

        } catch (error) {
            console.error("Error al generar asignación:", error);
            setGenerationStatus({ message: error.message, progress: 100, error: true });
            await new Promise(res => setTimeout(res, 5000));
        } finally {
            setIsGenerating(false);
        }
    };


    return (
        <div className="bg-slate-100 font-sans min-h-screen p-4 sm:p-6 lg:p-8">
            {isGenerating && <LoadingOverlay message={generationStatus.message} progress={generationStatus.progress} hasError={generationStatus.error} />}
            <ConfirmationModal 
                isOpen={!!reportToDelete}
                onClose={() => setReportToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el reporte de carga del ${reportToDelete?.fechaCarga}? Esta acción no se puede deshacer.`}
                isProcessing={isProcessingDelete}
            />

            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Panel de Docentes</h1>
                    <p className="text-lg text-gray-500 mt-1">Busca, visualiza y genera las asignaciones de los colaboradores.</p>
                </header>
                
                <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Generar Nueva Asignación</h2>
                    <fieldset disabled={isGenerating || isTableLoading} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-blue-50 p-6 rounded-xl border border-blue-200">
                            <div className="md:col-span-2">
                                <label htmlFor="assignment-period" className="block text-sm font-medium text-blue-800 mb-1">
                                    Periodo de Asignación a Generar
                                </label>
                                <select 
                                    id="assignment-period" 
                                    value={periodoAsignacion} 
                                    onChange={e => setPeriodoAsignacion(e.target.value)} 
                                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-semibold text-blue-900"
                                >
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <button 
                                onClick={handleGenerate} 
                                disabled={isGenerating || isTableLoading}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-full"
                            >
                                GENERAR ASIGNACIÓN
                            </button>
                        </div>
                    </fieldset>
                </div>
                
                <div className="mb-6 bg-white rounded-xl shadow-md">
                    <button onClick={toggleReport} className="w-full flex justify-between items-center p-4 text-left">
                        <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                            <History className="mr-3 text-purple-600" /> Historial de Cargas
                        </h2>
                        <ChevronDown className={`transform transition-transform duration-300 ${showReport ? 'rotate-180' : ''}`} />
                    </button>
                    {showReport && (
                        <div className="p-4 md:p-6 border-t">
                            {isReportLoading ? (
                                <div className="flex items-center justify-center p-5"><Loader className="animate-spin h-6 w-6 text-purple-600" /></div>
                            ) : reportError ? (
                                <Notification type="error" title="Error de Reporte" message={reportError} onDismiss={() => setReportError(null)} />
                            ) : (
                                <div className="space-y-8">
                                    {reportData && Object.keys(reportData).length > 0 ? Object.keys(reportData).map(semestre => {
                                        const [mostRecent, ...olderReports] = reportData[semestre];
                                        return (
                                            <div key={semestre}>
                                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Semestre: {semestre}</h3>
                                                <div className="relative bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4 mb-4 shadow-sm">
                                                    <p className="font-bold text-purple-800">Carga más reciente</p>
                                                    <p><span className="font-semibold">Fecha de Carga:</span> {mostRecent.fechaCarga}</p>
                                                    <p><span className="font-semibold">Registros:</span> {mostRecent.cantidad.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600 mt-1">Actualizado: {formatDateTime(mostRecent.ultimaActualizacion)}</p>
                                                    <button onClick={() => handleDeleteReportClick(mostRecent)} disabled={isProcessingDelete} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16}/></button>
                                                </div>
                                                
                                                {olderReports.length > 0 && (
                                                    <div>
                                                        <button onClick={() => toggleSemesterExpansion(semestre)} className="text-sm text-purple-600 hover:text-purple-800 flex items-center mb-2">
                                                            {expandedSemesters[semestre] ? 'Ocultar historial' : `Ver ${olderReports.length} cargas anteriores`}
                                                            <ChevronDown className={`ml-1 transform transition-transform duration-200 ${expandedSemesters[semestre] ? 'rotate-180' : ''}`} size={16}/>
                                                        </button>
                                                        {expandedSemesters[semestre] && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {olderReports.map((item, index) => (
                                                                    <div key={index} className="relative bg-gray-50 border rounded-lg p-3 text-sm">
                                                                        <p className="font-bold">{item.fechaCarga}</p>
                                                                        <p>Registros: {item.cantidad.toLocaleString()}</p>
                                                                        <p className="text-xs text-gray-500 mt-1">Actualizado: {formatDateTime(item.ultimaActualizacion)}</p>
                                                                        <button onClick={() => handleDeleteReportClick(item)} disabled={isProcessingDelete} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={14}/></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }) : <p className="text-center text-gray-500 py-4">No hay reportes de carga disponibles.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">Filtrar Docentes</h2>
                  <fieldset disabled={isGenerating || isTableLoading} className="space-y-4">
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
                            <p className="text-gray-500 text-center">No se encontraron docentes.<br/>Intenta ajustar los filtros o genera una nueva asignación.</p>
                        </div>
                    )}
                </div>

                {totalPages > 0 && !isTableLoading && (
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isGenerating}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isGenerating}
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
}
