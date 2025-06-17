import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

// --- Mock Data: Datos de ejemplo con la nueva estructura ---
const initialApiData = {
  "data": [
    {
      "_id": "684c865e5e8fed1ea67601d4", "periodo": 225413, "idDocente": "N00112983", "docente": "CAROL IVONNE MORENO SALAZAR", "RolColaborador": "DOCENTE TIEMPO PARCIAL", "programa": "UG", "modalidad": "Tesis",
      "cursos": [
        { "nombreCurso": "TRABAJO DE INVESTIGACIÓN", "codCurso": "INV101", "seccion": "INV101-A", "nrc": "12345", "periodo": 225413, "metEdu": "Blended", "horarios": [{ "dia": "Lunes", "hora": "10:00 - 12:00", "campus": "VIR", "aula": "VIRTUAL-1", "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM" }] },
        { "nombreCurso": "TESIS", "codCurso": "TES202", "seccion": "TES202-B", "nrc": "12346", "periodo": 225413, "metEdu": "Presencial", "horarios": [{ "dia": "Miércoles", "hora": "18:00 - 20:00", "campus": "LIMA CENTRO", "aula": "C-102", "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM" }] }
      ],
      "promedioEsa": 0.39,
      "pidd": { "_id": "684c7f7e1601f166623a674e", "docente": "CAROL IVONNE MORENO SALAZAR", "cargo": "DOCENTE TIEMPO PARCIAL", "correo": "carol.moreno@upn.pe", "esa": 0.4926, "rubrica": "20", "dispersion": "Amarillo Derecha Inferior", "tipoPlanIntegral": "ESA GENERAL", "nombreCurso": "", "esaCurso": 0.4926 }
    },
    {
      "_id": "c4d5e6f7g8h9i0j1k2l3m4n5", "periodo": 225413, "idDocente": "N00340420", "docente": "ELIZABETH DEL CASTILLO CANTORAL", "RolColaborador": "DOCENTE A TIEMPO PARCIAL ", "programa": "UG", "modalidad": "Presencial",
      "cursos": [
        { "nombreCurso": "INFORMÁTICA PARA NEGOCIOS", "codCurso": "INFO1103P", "seccion": "INFO.1103P.225413.9897.P", "nrc": "9897", "periodo": 225413, "metEdu": "Presencial", "horarios": [ { "dia": "JUEVES", "hora": "10:50 - 12:20", "campus": "CAJ", "aula": "LCOM5", "fechaInicio": "Mar 24, 2025 12:00:00 AM", "fechaFin": "Jul 13, 2025 12:00:00 AM" } ] },
        { "nombreCurso": "ADUANAS", "codCurso": "COME1302", "seccion": "COME.1302.225413.10018.P", "nrc": "10018", "periodo": 225413, "metEdu": "Presencial", "horarios": [ { "dia": "MARTES", "hora": "10:50 - 12:20", "campus": "CAJ", "aula": "B302", "fechaInicio": "May 19, 2025 12:00:00 AM", "fechaFin": "May 25, 2025 12:00:00 AM" }, { "dia": "MARTES", "hora": "12:30 - 14:00", "campus": "CAJ", "aula": "B302", "fechaInicio": "Jun 30, 2025 12:00:00 AM", "fechaFin": "Jul 6, 2025 12:00:00 AM" } ] }
      ], "promedioEsa": 0.75, "pidd": null
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

// --- Componentes Auxiliares ---
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
        <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
);


const HorarioCard = ({ horario }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric'});
        } catch (e) { return 'Fecha inválida'; }
    };
    return(
        <div className="border-t border-gray-200 mt-3 pt-3">
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

// --- Nuevo Modal para el detalle del evento del calendario ---
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
                    <p className={`mt-2 px-3 py-1 text-sm font-semibold rounded-full inline-block ${event.isPidd ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                        {event.isPidd ? 'Curso en Plan de Mejora' : 'Curso Regular'}
                    </p>
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


// --- Componente de Calendario ---
const CalendarView = ({ courses, pidd, promedioEsa, onEventClick }) => {
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
                            esaCurso: isPiddCourse ? pidd.esaCurso : null
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
                                            {eventsForDay.map((event, eventIndex) => {
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
                                                        key={eventIndex}
                                                        onClick={() => onEventClick(event)}
                                                        className={`absolute w-[96%] left-[2%] p-2 text-left text-xs rounded-lg shadow-md overflow-hidden ${event.isPidd ? 'bg-amber-100 border-l-4 border-amber-500 text-amber-900 hover:bg-amber-200' : 'bg-blue-100 border-l-4 border-blue-500 text-blue-900 hover:bg-blue-200'} transition-colors`}
                                                        style={{ top: `${top}rem`, height: `${height}rem`, zIndex: 10 }}
                                                    >
                                                        <p className="font-bold truncate">{event.name}</p>
                                                        <p className="font-semibold truncate">NRC: {event.nrc}</p>
                                                        <p className="truncate">Cod. Curso: {event.code}</p>
                                                        <p className="truncate">Mod.: {event.metEdu ? `${event.metEdu.charAt(0)}.` : ''} ({event.time})</p>
                                                        <p className="mt-1"><strong>ESA:</strong> {formatEsa(promedioEsa)}</p>
                                                    </button>
                                                );
                                            })}
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


const TeacherDetailModal = ({ teacher, onClose }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const { pidd, cursos, RolColaborador, promedioEsa, idDocente, programa, modalidad } = teacher;
  const docenteNombre = teacher.docente || (pidd ? pidd.docente : `Docente ${idDocente}`);
  const docenteCorreo = pidd ? pidd.correo : 'No disponible';
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
                        <h1 className="text-3xl font-bold text-gray-800">{docenteNombre}</h1>
                        <p className="text-md text-gray-500">{pidd ? pidd.cargo : 'Cargo no disponible'}</p>
                         <div className="flex items-center mt-2 text-gray-600 text-sm space-x-2"><Mail size={16} /><span>{docenteCorreo}</span></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <InfoPill icon={<Shield size={14}/>} label="ID Docente" value={idDocente} />
                    <InfoPill icon={<Briefcase size={14}/>} label="Rol Colaborador" value={RolColaborador} />
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
                            {hasPiddCourse && (
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-amber-300 pb-2 mb-4">Curso en Plan de Mejora (PIDD)</h3>
                                    <PiddCourseCard piddData={pidd} />
                                </div>
                            )}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-blue-200 pb-2">Todos los Cursos Programados</h3>
                                {cursos?.map((curso, i) => (
                                    <div key={curso.seccion || i} className="bg-white p-6 rounded-2xl shadow-md mt-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="text-xl font-semibold text-gray-800">{curso.nombreCurso}</h4>
                                                <p className="text-sm text-gray-500 -mt-1 mb-3">Sección: {curso.seccion || 'No especificada'}</p>
                                            </div>
                                            <div className="text-right text-xs">
                                                <p><strong>Periodo:</strong> {curso.periodo}</p>
                                                <p><strong>Met. Edu.:</strong> {curso.metEdu}</p>
                                            </div>
                                        </div>
                                        {curso.horarios?.map((h, hi) => <HorarioCard key={hi} horario={h} />)}
                                    </div>
                                ))}
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
                    <CalendarView courses={cursos} pidd={pidd} promedioEsa={promedioEsa} onEventClick={setSelectedSchedule} />
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
  const [programFilter, setProgramFilter] = useState('Todos');
  const [modalityFilter, setModalityFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Simula la llamada a la API. Reemplaza esto con tu fetch.
    fetch('https://kali-ad-web.beesoftware.net/api/asignaciones')
      .then(res => res.json())
      .then(data => setTeachers(data.data))
      .catch(err => console.error("Error fetching data:", err));
    // setTeachers(initialApiData.data);
  }, []);

  const programOptions = useMemo(() => ['Todos', ...new Set(teachers.map(t => t.programa))], [teachers]);
  const modalityOptions = useMemo(() => ['Todos', ...new Set(teachers.map(t => t.modalidad))], [teachers]);

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

      return searchTermMatch && piddMatch && programMatch && modalityMatch;
    });
  }, [teachers, searchTerm, piddFilter, programFilter, modalityFilter]);
  
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

  return (
    <div className="bg-slate-100 font-sans min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Panel de Docentes</h1>
            <p className="text-lg text-gray-500 mt-1">Busca y visualiza los detalles de los colaboradores.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-6 space-y-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="pidd-filter" className="block text-sm font-medium text-gray-700 mb-1">Estado PIDD</label>
                    <select id="pidd-filter" value={piddFilter} onChange={e => handleFilterChange(setPiddFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                        <option value="Todos">Todos</option>
                        <option value="Con PIDD">Con PIDD</option>
                        <option value="Sin PIDD">Sin PIDD</option>
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
        </div>
        
        <div className="overflow-x-auto bg-white rounded-2xl shadow-md">
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
              {paginatedTeachers.map((teacher) => (
                <tr key={teacher._id || teacher.idDocente} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="flex items-center">
                        {teacher.pidd && <AlertTriangle className="text-amber-500 mr-2 flex-shrink-0" size={16} title="Este docente tiene un PIDD"/>}
                        {teacher.docente || (teacher.pidd ? teacher.pidd.docente : 'Nombre no disponible')}
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
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
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
}
