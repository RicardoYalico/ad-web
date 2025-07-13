import React, { useState, useMemo, useEffect } from 'react';

// --- Iconos SVG para una mejor visualización ---
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const CheckCircleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const LoadingSpinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CloseIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const timeSlots = Array.from({ length: 16 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);
const today = new Date();
today.setHours(0, 0, 0, 0);

// --- Helpers de Fechas y Horas ---
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const getWeekId = (d) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return date.getFullYear() + '-W' + (1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7));
};

const getWeekDateRange = (date) => {
    const startOfWeek = getMonday(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const options = { month: 'long', day: 'numeric' };
    return `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}`;
};

const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// --- Simulación de API de confirmación ---
const simulateConfirmation = (selectedSessions) => {
  const teacherIds = new Set(Object.keys(selectedSessions));
  return new Promise(resolve => {
    setTimeout(() => {
      const successful = [];
      const failed = [];
      teacherIds.forEach(id => {
          if (id === 'N00342578' && Math.random() > 0.4) {
              failed.push(id);
          } else {
              successful.push(id);
          }
      });
      
      if (failed.length > 0) {
        resolve({ status: 'partial', successful, failed });
      } else {
        resolve({ status: 'success', successful });
      }
    }, 1500);
  });
};

// --- Componentes Modales ---
const SessionDetailModal = ({ sessionData, onClose }) => {
    if (!sessionData) return null;
    const { teacher, session } = sessionData;
    const startMinutes = timeToMinutes(session.startTime);
    const endMinutes = startMinutes + session.duration;
    const endHour = Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Detalle de la Sesión</h2>
                    <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-700">&times;</button>
                </div>
                <div className="mb-6 pb-6 border-b">
                    <h3 className="text-2xl font-bold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">ID: {teacher.id}</p>
                    <p className="text-lg text-gray-600 mt-1">{teacher.programa} - {teacher.modalidad}</p>
                </div>
                <div className="space-y-3 text-gray-700">
                    <div className="flex items-center gap-3"><BookOpenIcon className="text-indigo-500"/> <span><strong>Curso:</strong> {session.course}</span></div>
                    <div className="flex items-center gap-3"><MapPinIcon className="text-indigo-500"/> <span><strong>Sede:</strong> {session.sede}</span></div>
                    <div className="flex items-center gap-3"><ClockIcon className="text-indigo-500"/> <span><strong>Horario:</strong> {session.day}, {session.startTime} - {endTime}</span></div>
                </div>
                 <div className="mt-8 text-right">
                    <button onClick={onClose} className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

const SessionSelectionModal = ({ teacher, compatibleSessions, onSelectSession, onClose, occupiedSlots, mondayOfCurrentWeek }) => {
    if (!teacher) return null;

    const sessionsBySede = compatibleSessions.reduce((acc, session) => {
        (acc[session.sede] = acc[session.sede] || []).push(session);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl transform transition-all">
                <div className="flex justify-between items-start">
                    <div><h2 className="text-2xl font-bold text-gray-800">Seleccionar Sesión Compatible</h2><p className="text-lg text-gray-600">para {teacher.name}</p></div>
                    <button onClick={onClose} className="p-2 -mt-2 -mr-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-700">&times;</button>
                </div>
                <p className="mt-4 mb-6 text-gray-600">Elija una de las siguientes sesiones disponibles para realizar el acompañamiento.</p>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {Object.keys(sessionsBySede).length > 0 ? Object.entries(sessionsBySede).map(([sede, sessions]) => (
                        <div key={sede}>
                            <h3 className="font-bold text-lg text-gray-700 border-b pb-2 mb-3">{sede}</h3>
                            <div className="space-y-3">
                                {sessions.map((session, index) => {
                                    const startMinutes = timeToMinutes(session.startTime);
                                    const endMinutes = startMinutes + session.duration;
                                    const isOccupied = occupiedSlots.some(slot => 
                                        slot.day === session.day && Math.max(slot.start, startMinutes) < Math.min(slot.end, endMinutes)
                                    );
                                    
                                    const dayIndex = daysOfWeek.indexOf(session.day);
                                    const sessionDate = new Date(mondayOfCurrentWeek);
                                    sessionDate.setDate(mondayOfCurrentWeek.getDate() + dayIndex);
                                    const isPast = sessionDate < today;

                                    return (
                                        <div key={index} 
                                             onClick={() => !isOccupied && !isPast && onSelectSession(teacher.id, session)} 
                                             className={`p-4 border rounded-lg transition-all ${(isOccupied || isPast) ? 'bg-gray-200 opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50 hover:border-indigo-500 cursor-pointer'}`}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-gray-800">{session.day} - {session.startTime} ( {Math.round(session.duration/60)}h )</p>
                                                    <p className="text-gray-600">Curso: {session.course}</p>
                                                </div>
                                                {isOccupied && <span className="text-sm font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">Ocupado</span>}
                                                {isPast && !isOccupied && <span className="text-sm font-semibold text-gray-600 bg-gray-300 px-2 py-1 rounded">Pasado</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )) : (<p className="text-center text-gray-500 py-8">No se encontraron sesiones compatibles para este docente.</p>)}
                </div>
            </div>
        </div>
    );
};
const ConfirmationModal = ({ show, onClose, selectedSessions, onConfirm, allTeachers }) => {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const handleConfirm = async () => {
    setStatus('loading');
    const apiResult = await simulateConfirmation(selectedSessions);
    setResult(apiResult);
    setStatus('result');
    onConfirm(apiResult);
  };
  
  const resetAndClose = () => {
    setStatus('idle');
    setResult(null);
    onClose();
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl transform transition-all">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {status === 'idle' && 'Confirmar Selección'}
            {status === 'loading' && 'Procesando...'}
            {status === 'result' && 'Resultado de la Confirmación'}
        </h2>
        {status === 'idle' && (
          <>
            <p className="text-gray-600 mb-6">Está a punto de confirmar el seguimiento para las siguientes sesiones. Esta acción no se puede deshacer.</p>
            <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-6">
              {Object.entries(selectedSessions).map(([teacherId, session]) => {
                  const teacher = allTeachers.find(t => t.id === teacherId);
                  return <p key={teacherId} className="font-medium text-gray-700">{teacher?.name || teacherId} - <span className="text-indigo-600 font-semibold">{session.sede}: {session.day}, {session.startTime}</span></p>
              })}
            </div>
            <div className="flex justify-end gap-4"><button onClick={resetAndClose} className="py-2 px-6 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancelar</button><button onClick={handleConfirm} className="py-2 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center">Confirmar Selección Final</button></div>
          </>
        )}
        {status === 'loading' && <div className="text-center py-12"><LoadingSpinner /><p className="text-lg font-semibold text-gray-700 mt-4">Verificando disponibilidad...</p></div>}
        {status === 'result' && (
          <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-green-700 mb-2">Asignaciones Exitosas ({result.successful?.length || 0})</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-green-50 p-3 rounded-lg">
                    {result.successful?.length > 0 ? result.successful.map(id => {
                        const teacher = allTeachers.find(t => t.id === id);
                        return <p key={id} className="text-green-800 text-sm">{teacher?.name || id}</p>
                    }) : <p className="text-gray-500 text-sm">No hubo asignaciones exitosas.</p>}
                </div>
            </div>
             {result.failed?.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Asignaciones Fallidas ({result.failed.length})</h3>
                    <p className="text-sm text-gray-600 mb-2">Estos docentes ya fueron seleccionados por otro especialista. Permanecerán en su calendario para que pueda re-asignarlos.</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto bg-red-50 p-3 rounded-lg">
                        {result.failed.map(id => {
                            const teacher = allTeachers.find(t => t.id === id);
                            return <p key={id} className="text-red-800 text-sm">{teacher?.name || id}</p>
                        })}
                    </div>
                </div>
            )}
            <div className="mt-8 text-right">
                <button onClick={resetAndClose} className="py-2 px-8 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Entendido</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Componente Principal ---
const SeleccionDocenteSeguimiento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allSelectedSessions, setAllSelectedSessions] = useState({});
  const [teacherForSessionSelection, setTeacherForSessionSelection] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [viewingSessionDetail, setViewingSessionDetail] = useState(null);
  
  const [allTeachers, setAllTeachers] = useState([]);
  const [allSchedules, setAllSchedules] = useState({});
  const [epConfig, setEpConfig] = useState({ MONTHLY_HOUR_LIMIT: 92, AVAILABILITY: [], PREFERRED_SEDES: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar SheetJS dinámicamente y Fetch de datos
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';
    script.async = true;
    document.head.appendChild(script);

    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { dni: "9977858" }; // Fallback DNI for testing

    const transformTeacherApiData = (apiData) => {
        const teachers = [];
        const schedules = {};
        const teacherIdSet = new Set();
        const colors = ['bg-red-200', 'bg-blue-200', 'bg-lime-200', 'bg-orange-200', 'bg-purple-200', 'bg-emerald-200', 'bg-pink-200', 'bg-sky-200'];
        let colorIndex = 0;
    
        apiData.forEach(teacherData => {
            if (!teacherData.idDocente || teacherIdSet.has(teacherData.idDocente)) return;
    
            const nameParts = teacherData.docente.split(', ');
            const formattedName = nameParts.length > 1 ? `${nameParts[1]} ${nameParts[0]}` : teacherData.docente;
    
            teachers.push({
                id: teacherData.idDocente,
                name: formattedName,
                programa: teacherData.programa,
                modalidad: teacherData.modalidad,
                color: colors[colorIndex % colors.length]
            });
            teacherIdSet.add(teacherData.idDocente);
            colorIndex++;
    
            schedules[teacherData.idDocente] = [];
            teacherData.cursos.forEach(curso => {
                curso.horarios.forEach(horario => {
                    if (!horario.dia || !horario.hora || !horario.hora.includes('-')) return; 
    
                    const dayMap = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
                    const normalizedDay = dayMap[horario.dia.toLowerCase().trim()];
                    if (!normalizedDay) return;
    
                    try {
                        const [start, end] = horario.hora.replace(/\s/g, '').split('-');
                        const startH = parseInt(start.substring(0, 2), 10);
                        const startM = parseInt(start.substring(2, 10));
                        const endH = parseInt(end.substring(0, 2), 10);
                        const endM = parseInt(end.substring(2), 10);
                        
                        if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return;
    
                        const durationInMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
                        if (durationInMinutes <= 0) return;
    
                        schedules[teacherData.idDocente].push({
                            sede: horario.campus,
                            day: normalizedDay,
                            startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
                            duration: durationInMinutes,
                            course: curso.nombreCurso
                        });
                    } catch (e) {
                        console.error("Error parsing time:", horario.hora);
                    }
                });
            });
        });
    
        return { teachers, schedules };
    };
    
    const transformEpApiData = (apiData) => {
        if (!apiData || apiData.length === 0) {
            return { MONTHLY_HOUR_LIMIT: 92, AVAILABILITY: [], PREFERRED_SEDES: [] };
        }
        const monthlyLimit = parseInt(apiData[0].horasDisponiblesParaRealizarAcompaniamientoPresencial, 10) || 92;
        const preferredSedes = [...new Set(apiData.map(item => item.sede1DePreferenciaPresencial).filter(Boolean))];
        const availability = apiData.map(item => {
            const [start, end] = item.franja.replace(/\s/g, '').split('-');
            const startH = parseInt(start.substring(0, 2), 10);
            const startM = parseInt(start.substring(2), 10);
            const endH = parseInt(end.substring(0, 2), 10);
            const endM = parseInt(end.substring(2), 10);
            const durationInMinutes = (endH * 60 + endM) - (startH * 60 + startM);
            const dayMap = { lunes: 'Lunes', martes: 'Martes', miércoles: 'Miércoles', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sábado: 'Sábado', domingo: 'Domingo' };
            const normalizedDay = dayMap[item.dia.toLowerCase().trim()];
            return {
                day: normalizedDay,
                startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
                duration: durationInMinutes
            };
        }).filter(item => item.day && item.duration > 0);

        return { MONTHLY_HOUR_LIMIT: monthlyLimit, AVAILABILITY: availability, PREFERRED_SEDES: preferredSedes };
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [teachersResponse, epResponse] = await Promise.all([
                fetch('https://kali-ad-web.beesoftware.net/api/asignaciones?latest=true'),
                fetch(`https://kali-ad-web.beesoftware.net/api/disponibilidad-acompaniamiento?dniEspecialista=${currentUser.dni}`)
            ]);

            if (!teachersResponse.ok) throw new Error(`Error fetching teachers: ${teachersResponse.status}`);
            if (!epResponse.ok) throw new Error(`Error fetching EP availability: ${epResponse.status}`);

            const teachersApiData = await teachersResponse.json();
            const epApiData = await epResponse.json();

            const { teachers, schedules } = transformTeacherApiData(teachersApiData.data);
            const epData = transformEpApiData(epApiData);

            setAllTeachers(teachers);
            setAllSchedules(schedules);
            setEpConfig(epData);

        } catch (e) {
            console.error("Failed to fetch or transform data:", e);
            setError("No se pudieron cargar los datos. Por favor, intente de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();

    return () => {
        if(document.head.querySelector('script[src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"]')) {
           document.head.removeChild(document.head.querySelector('script[src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"]'));
        }
    };
  }, []);

  const mondayOfCurrentWeek = useMemo(() => getMonday(currentDate), [currentDate]);
  const currentWeekId = getWeekId(currentDate);
  const selectedSessionsForCurrentWeek = allSelectedSessions[currentWeekId] || {};

  const epAvailabilitySet = useMemo(() => {
      const slots = new Set();
      epConfig.AVAILABILITY.forEach(avail => {
          const start = timeToMinutes(avail.startTime);
          for(let i=0; i < avail.duration; i++){
              const currentMinute = start + i;
              const hour = Math.floor(currentMinute / 60);
              slots.add(`${avail.day}-${String(hour).padStart(2, '0')}:00`);
          }
      });
      return slots;
  }, [epConfig.AVAILABILITY]);

  const epPreferredSedesSet = useMemo(() => new Set(epConfig.PREFERRED_SEDES), [epConfig.PREFERRED_SEDES]);

  const allTimeSelectedTeacherIds = useMemo(() => {
    const ids = new Set();
    Object.values(allSelectedSessions).forEach(weekSessions => {
        Object.keys(weekSessions).forEach(teacherId => {
            ids.add(teacherId);
        });
    });
    return ids;
  }, [allSelectedSessions]);

  const monthlyHours = useMemo(() => {
    const hoursByMonth = {}; 
    const getMondayOfWeek = (weekId) => {
        const [year, weekNum] = weekId.split('-W').map(Number);
        const d = new Date(Date.UTC(year, 0, 1 + (weekNum - 1) * 7));
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setUTCDate(diff));
    };
    for (const weekId in allSelectedSessions) {
        const monday = getMondayOfWeek(weekId);
        const monthKey = `${monday.getFullYear()}-${monday.getMonth()}`;
        if (!hoursByMonth[monthKey]) hoursByMonth[monthKey] = 0;
        Object.values(allSelectedSessions[weekId]).forEach(session => {
            hoursByMonth[monthKey] += session.duration / 60;
        });
    }
    return hoursByMonth;
  }, [allSelectedSessions]);

  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const totalMonthlyHours = Math.round(monthlyHours[currentMonthKey] || 0);
  const atMonthlyLimit = totalMonthlyHours >= epConfig.MONTHLY_HOUR_LIMIT;

  const filteredTeachers = useMemo(() => {
    return allTeachers.filter(teacher => teacher.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allTeachers]);

  const occupiedSlotsForCurrentWeek = useMemo(() => {
    const slots = [];
    Object.values(selectedSessionsForCurrentWeek).forEach(session => {
        slots.push({
            day: session.day,
            start: timeToMinutes(session.startTime),
            end: timeToMinutes(session.startTime) + session.duration,
        });
    });
    return slots;
  }, [selectedSessionsForCurrentWeek]);

  const handleSelectSession = (teacherId, session) => {
    const startMinutes = timeToMinutes(session.startTime);
    const endMinutes = startMinutes + session.duration;

    const isOccupied = occupiedSlotsForCurrentWeek.some(slot => 
        slot.day === session.day && Math.max(slot.start, startMinutes) < Math.min(slot.end, endMinutes)
    );

    if (isOccupied) {
        alert("Este horario ya está ocupado por otro docente en esta semana.");
        return;
    }

    if (atMonthlyLimit && !selectedSessionsForCurrentWeek[teacherId]) {
        alert(`Ha alcanzado el límite de ${epConfig.MONTHLY_HOUR_LIMIT} horas mensuales.`);
        return;
    }
    setAllSelectedSessions(prev => ({
        ...prev,
        [currentWeekId]: {
            ...prev[currentWeekId],
            [teacherId]: session
        }
    }));
    setTeacherForSessionSelection(null);
  };
  
  const handleFullAutoAssignment = () => {
    let newSelectedSessionsForWeek = { ...selectedSessionsForCurrentWeek };
    let assignedSlots = [...occupiedSlotsForCurrentWeek];
    let hoursCanAdd = (epConfig.MONTHLY_HOUR_LIMIT - totalMonthlyHours);

    const assignableTeachers = filteredTeachers.filter(t => !allTimeSelectedTeacherIds.has(t.id));
    
    const sortedAssignable = [...assignableTeachers].sort((a, b) => {
        const aIsPreferred = (allSchedules[a.id] || []).some(s => epPreferredSedesSet.has(s.sede));
        const bIsPreferred = (allSchedules[b.id] || []).some(s => epPreferredSedesSet.has(s.sede));
        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
        return 0;
    });

    sortedAssignable.forEach(teacher => {
        if (newSelectedSessionsForWeek[teacher.id] || hoursCanAdd <= 0) return;
        
        const teacherSchedule = allSchedules[teacher.id] || [];
        const availableSession = teacherSchedule.find(session => {
            const startMinutes = timeToMinutes(session.startTime);
            const endMinutes = startMinutes + session.duration;
            const dayIndex = daysOfWeek.indexOf(session.day);
            if (dayIndex === -1) return false;
            
            const sessionDate = new Date(mondayOfCurrentWeek);
            sessionDate.setDate(mondayOfCurrentWeek.getDate() + dayIndex);
            const isPast = sessionDate < today;

            const isCompatible = epConfig.AVAILABILITY.some(avail => {
                const availStart = timeToMinutes(avail.startTime);
                const availEnd = availStart + avail.duration;
                return avail.day === session.day && startMinutes >= availStart && endMinutes <= availEnd;
            });

            const isAvailable = !assignedSlots.some(slot => 
                slot.day === session.day && Math.max(slot.start, startMinutes) < Math.min(slot.end, endMinutes)
            );

            return isCompatible && isAvailable && !isPast && (hoursCanAdd - (session.duration / 60) >= 0);
        });

        if (availableSession) {
            newSelectedSessionsForWeek[teacher.id] = availableSession;
            assignedSlots.push({
                day: availableSession.day,
                start: timeToMinutes(availableSession.startTime),
                end: timeToMinutes(availableSession.startTime) + availableSession.duration,
            });
            hoursCanAdd -= availableSession.duration / 60;
        }
    });
    
    setAllSelectedSessions(prev => ({ ...prev, [currentWeekId]: newSelectedSessionsForWeek }));
  };

  const handleDeselectTeacher = (teacherId) => {
      setAllSelectedSessions(prev => {
          const newWeekSessions = { ...prev[currentWeekId] };
          delete newWeekSessions[teacherId];
          return { ...prev, [currentWeekId]: newWeekSessions };
      });
  }

  const handleConfirmationResult = (result) => {
      const newWeekSessions = { ...selectedSessionsForCurrentWeek };
      result.successful?.forEach(id => delete newWeekSessions[id]);
      setAllSelectedSessions(prev => ({...prev, [currentWeekId]: newWeekSessions}));
  }
  
  const compatibleSessionsForTeacher = useMemo(() => {
      if (!teacherForSessionSelection) return [];
      const teacherSchedule = allSchedules[teacherForSessionSelection.id] || [];
      return teacherSchedule.filter(session => {
          const startMinutes = timeToMinutes(session.startTime);
          const endMinutes = startMinutes + session.duration;
          return epConfig.AVAILABILITY.some(avail => {
              const availStart = timeToMinutes(avail.startTime);
              const availEnd = availStart + avail.duration;
              return avail.day === session.day && startMinutes >= availStart && endMinutes <= availEnd;
          });
      });
  }, [teacherForSessionSelection, allSchedules, epConfig.AVAILABILITY]);

  const changeWeek = (direction) => {
      setCurrentDate(prevDate => {
          const newDate = new Date(prevDate);
          newDate.setDate(newDate.getDate() + (7 * direction));
          return newDate;
      });
  };
  
  const canGoBack = useMemo(() => {
      const prevWeekMonday = getMonday(new Date(currentDate.getTime()).setDate(currentDate.getDate() - 7));
      const endOfPrevWeek = new Date(prevWeekMonday);
      endOfPrevWeek.setDate(prevWeekMonday.getDate() + 6);
      endOfPrevWeek.setHours(23, 59, 59, 999);
      return endOfPrevWeek >= today;
  }, [currentDate]);
  
  const handleDownloadXLSX = () => {
    if (typeof XLSX === 'undefined') {
        alert('La librería de exportación no está lista, por favor intente de nuevo en un momento.');
        return;
    }

    const allSessionsFlat = [];
    const getMondayOfWeek = (weekId) => {
        const [year, weekNum] = weekId.split('-W').map(Number);
        const d = new Date(Date.UTC(year, 0, 1 + (weekNum - 1) * 7));
        const day = d.getUTCDay();
        const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setUTCDate(diff));
    };

    for (const weekId in allSelectedSessions) {
        const weekSessions = allSelectedSessions[weekId];
        const monday = getMondayOfWeek(weekId);

        for (const teacherId in weekSessions) {
            const session = weekSessions[teacherId];
            const teacher = allTeachers.find(t => t.id === teacherId);
            if (!teacher) continue;

            const dayIndex = daysOfWeek.indexOf(session.day);
            const sessionDate = new Date(monday);
            sessionDate.setDate(monday.getDate() + dayIndex);

            const startMinutes = timeToMinutes(session.startTime);
            const endMinutes = startMinutes + session.duration;
            const endHour = Math.floor(endMinutes / 60);
            const endMinute = endMinutes % 60;
            const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

            allSessionsFlat.push({
                'Día': session.day,
                'Fecha': sessionDate, // Keep as Date object for sorting
                'Hora Inicio': session.startTime,
                'Hora Fin': endTime,
                'Docente': teacher.name,
                'Programa': teacher.programa,
                'Modalidad': teacher.modalidad,
                'Sede': session.sede,
                'Curso': session.course,
            });
        }
    }

    if (allSessionsFlat.length === 0) {
        alert('No hay sesiones seleccionadas en ninguna semana para descargar.');
        return;
    }

    allSessionsFlat.sort((a, b) => a.Fecha - b.Fecha);

    const dataToExport = allSessionsFlat.map(session => ({
        ...session,
        'Fecha': session.Fecha.toLocaleDateString('es-ES'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cronograma Completo");
    XLSX.writeFile(workbook, `cronograma-completo.xlsx`);
  };


  return (
    <>
      <SessionSelectionModal teacher={teacherForSessionSelection} compatibleSessions={compatibleSessionsForTeacher} onSelectSession={handleSelectSession} onClose={() => setTeacherForSessionSelection(null)} occupiedSlots={occupiedSlotsForCurrentWeek} mondayOfCurrentWeek={mondayOfCurrentWeek} />
      <ConfirmationModal show={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} selectedSessions={selectedSessionsForCurrentWeek} onConfirm={handleConfirmationResult} allTeachers={allTeachers} />
      <SessionDetailModal sessionData={viewingSessionDetail} onClose={() => setViewingSessionDetail(null)} />
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
        <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Planificador de Acompañamiento Docente</h1>
            <p className="text-lg text-gray-600 mt-2">Use la asignación automática para llenar su calendario semanal.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-md">
             <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <div className="flex gap-2">
                    <button onClick={handleFullAutoAssignment} disabled={atMonthlyLimit || isLoading} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">Asignación Automática</button>
                    <button onClick={() => setAllSelectedSessions(prev => ({...prev, [currentWeekId]: {}}))} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 text-sm">Limpiar Semana</button>
                    <button onClick={() => setAllSelectedSessions({})} className="py-2 px-4 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 text-sm">Limpiar Todo</button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <span className={`font-bold text-lg ${atMonthlyLimit ? 'text-red-500' : 'text-gray-800'}`}>{totalMonthlyHours}</span>
                        <span className="text-sm text-gray-500"> / {epConfig.MONTHLY_HOUR_LIMIT} hrs (Mes)</span>
                    </div>
                    <button onClick={handleDownloadXLSX} className="py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"><DownloadIcon/> Cronograma</button>
                </div>
             </div>
             <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded-lg">
                <button onClick={() => changeWeek(-1)} disabled={!canGoBack} className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon /></button>
                <h3 className="text-xl font-semibold text-gray-700 text-center">{getWeekDateRange(currentDate)}</h3>
                <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRightIcon /></button>
             </div>
             {isLoading ? (
                <div className="flex justify-center items-center p-20"><LoadingSpinner/> <span className="ml-4 text-lg text-gray-600">Cargando datos...</span></div>
              ) : error ? (
                <div className="text-center p-20 text-red-500">{error}</div>
              ) : (
                <div className="grid grid-cols-[auto_1fr] gap-1 text-center">
                    <div className="font-semibold text-gray-700"></div>
                    <div className="grid grid-cols-7 gap-1">
                        {daysOfWeek.map((day, dayIndex) => {
                            const headerDate = new Date(mondayOfCurrentWeek);
                            headerDate.setDate(mondayOfCurrentWeek.getDate() + dayIndex);
                            return (
                                <div key={day} className="p-3 font-semibold text-gray-700 text-xs sm:text-sm">
                                    {day.substring(0,3)} <span className="block font-normal text-gray-500">{headerDate.getDate()}</span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="pr-2">
                        {timeSlots.map(time => (
                            <div key={time} className="h-12 flex items-start justify-end pt-1 text-xs text-gray-500">{time.split(' ')[0]}</div>
                        ))}
                    </div>
                    <div className="relative grid grid-cols-7 gap-1">
                        {/* Background lines */}
                        {timeSlots.map(time => (
                            <React.Fragment key={`${time}-lines`}>
                                {daysOfWeek.map(day => (
                                    <div key={`${day}-${time}-line`} className="h-12 border-t border-gray-200"></div>
                                ))}
                            </React.Fragment>
                        ))}

                        {/* Events */}
                        {Object.entries(selectedSessionsForCurrentWeek).map(([teacherId, session]) => {
                            const teacher = allTeachers.find(t => t.id === teacherId);
                            if (!teacher) return null;

                            const dayIndex = daysOfWeek.indexOf(session.day);
                            if (dayIndex === -1) return null;

                            const top = (timeToMinutes(session.startTime) - 6 * 60) / 60 * 3; // 3rem per hour
                            const height = (session.duration / 60) * 3;

                            return (
                                <div 
                                    key={teacherId}
                                    onClick={() => setViewingSessionDetail({teacher, session})}
                                    className={`absolute p-1 rounded-md text-left group cursor-pointer ${teacher.color}`} 
                                    style={{
                                        top: `${top}rem`,
                                        height: `${height}rem`,
                                        left: `calc(${(100/7) * dayIndex}% + 2px)`,
                                        width: `calc(${(100/7)}% - 4px)`,
                                        zIndex: 10
                                    }}
                                    title={`${teacher.name} - ${session.course}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-800 truncate">{teacher.name}</span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeselectTeacher(teacher.id); }} className="absolute top-0.5 right-0.5 bg-black/20 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Quitar a ${teacher.name}`}><CloseIcon className="text-white"/></button>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}
               <div className="mt-6 text-center">
                  <button onClick={() => setShowConfirmationModal(true)} disabled={Object.keys(selectedSessionsForCurrentWeek).length === 0} className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-12 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Confirmar Selección ({Object.keys(selectedSessionsForCurrentWeek).length})
                  </button>
                </div>
          </div>
        </div>
    </>
  );
};

export default SeleccionDocenteSeguimiento;
