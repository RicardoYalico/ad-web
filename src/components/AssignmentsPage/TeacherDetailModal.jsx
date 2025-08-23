import React, { useState, useMemo } from 'react';
// import { X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import HorarioCardComponent from './HorarioCardComponent';
import CalendarView from './CalendarView';
import PiddCourseCard from './PiddCourseCard';
import InfoPill from './InfoPill';
import ScheduleDetailModal from './ScheduleDetailModal';
import Rubrica from '../Rubrica'; // Assuming you have a Rubrica component
// import { formatEsa } from '../../utils/esaUtils'; // Assuming you have a utility function for formatting ESA
// import { Users } from 'lucide-react';
import { Mail, BookOpen, Calendar, Users, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin, Edit, UploadCloud, Download, XCircle, ListChecks, CalendarClock, FileText, BookUser } from 'lucide-react';

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

const formatEsa = (value) => {
    const num = parseFloat(value);
    if (value === null || value === undefined || isNaN(num)) {
        return "SIN ESA";
    }
    return `${(num * 100).toFixed(2)}%`;
};

const TeacherDetailModal = ({ teacher, onClose, onRegistrarRubrica }) => {
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const { pidd, cursos, RolColaborador, promedioEsa, idDocente, programa, modalidad, estadoHistorico, nombreEspecialista } = teacher;
    const docenteNombre = teacher.docente || (pidd ? pidd.docente : `Docente ${idDocente}`);
    const hasPiddCourse = pidd && pidd.nombreCurso;

    const uniqueCampuses = useMemo(() => {
        if (!cursos) return 'N/A';
        const allCampuses = cursos.flatMap(curso =>
            curso.horarios?.map(h => h.campus).filter(Boolean) || []
        );
        const distinctCampuses = [...new Set(allCampuses)];
        return distinctCampuses.length > 0 ? distinctCampuses.join(', ') : 'N/A';
    }, [cursos]);

    const [isTemplateLoading, setIsTemplateLoading] = useState(false);
    const [typeModalState, setTypeModalState] = useState({ isOpen: false });
    const [rubricTemplates, setRubricTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('list');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedRubric, setSelectedRubric] = useState(null);
    


        const onBackToList = () => {
        // setSelectedRubric(null);
        // setSelectedTemplate(null);
        // setCurrentView('list');
    };


        // --- Lógica de Guardado ---
    const onSave = async (payload) => {
        // const isUpdating = selectedRubric && selectedRubric._id;
        // const url = isUpdating ? `${API_URL_RUBRICAS}/${selectedRubric._id}` : API_URL_RUBRICAS;
        // const method = isUpdating ? 'PUT' : 'POST';

        // setIsLoading(true);
        // try {
        //     const response = await fetch(url, {
        //         method: method,
        //         headers: { 'Content-Type': 'application/json' },
        //         body: JSON.stringify(payload),
        //     });
        //     if (!response.ok) {
        //         const errorData = await response.json();
        //         throw new Error(errorData.message || `Error al ${isUpdating ? 'actualizar' : 'guardar'} la rúbrica.`);
        //     }
        //     handleBackToList(); // Volver a la lista si todo fue bien
        // } catch (err) {
        //     console.error("Error en la operación de guardado:", err);
        //     setError(err.message); // Podrías mostrar este error en una notificación
        // } finally {
        //     setIsLoading(false);
        // }
    };

    // const onRegistrarRubrica = (rubricaID, horario) => {
    //     console.log(rubricaID);
    //     console.log("Horario seleccionado:", horario);
    // }

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
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-300 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-4 sm:p-6 lg:p-8 flex-grow overflow-y-auto">
                    <header className="mb-6 bg-white p-6 rounded-2xl shadow-md">
                        <div className="flex items-start space-x-6 mb-5">
                            <div className="bg-blue-600 text-white rounded-full h-20 w-20 flex-shrink-0 flex items-center justify-center text-4xl font-bold">{docenteNombre.charAt(0)}</div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{docenteNombre}</h1>
                                <p className="text-md font-semibold text-blue-700 mt-1">ID: {idDocente}</p>
                                <p className="text-md text-gray-500 mt-1">{RolColaborador || 'Cargo no disponible'}</p>
                                <div className="mt-2">
                                    <StatusBadge status={estadoHistorico} />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                            <InfoPill icon={<Building size={14} />} label="Modalidad" value={modalidad} />
                            <InfoPill icon={<BookOpen size={14} />} label="Programa" value={programa} />
                            <InfoPill icon={<MapPin size={14} />} label="Campus" value={uniqueCampuses} />
                            <InfoPill icon={<UserCheck size={14} />} label="Especialista" value={nombreEspecialista || 'No asignado'} />
                            <InfoPill icon={<TrendingUp size={14} />} label="ESA Modalidad" value={formatEsa(promedioEsa)} />
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
                            <div className="space-y-6">
                                {hasPiddCourse && <PiddCourseCard piddData={pidd} />}
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-700 border-b-2 border-blue-200 pb-2">Todos los Cursos Programados</h3>
                                    {cursos?.map((curso, i) => {
                                        const cursoStyles = getStatusStyles(curso.estadoHistorico);
                                        return (
                                            <div
                                                key={curso.seccion || i}
                                                className={`bg-white border-2 ${cursoStyles.border} rounded-2xl shadow-lg mt-6 overflow-hidden`}
                                            >
                                                {/* --- ENCABEZADO DEL CURSO --- */}
                                                {/* Contiene la información principal del curso con un fondo de color suave. */}
                                                <header className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center ${cursoStyles.background} border-b-2 ${cursoStyles.border}`}>
                                                    {/* Información principal: Nombre y detalles con íconos */}
                                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                        <BookOpen className="text-blue-600 flex-shrink-0" size={32} />
                                                        <div>
                                                            <h4 className="text-xl font-bold text-gray-800">{curso.nombreCurso}</h4>
                                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Tag size={14} /> Sección: {curso.seccion || 'N/A'}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar size={14} /> Periodo: {curso.periodo || 'N/A'}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Users size={14} /> Met. Edu.: {curso.metEdu || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Indicador de estado a la derecha */}
                                                    <div className="flex items-center gap-3 self-start sm:self-center">
                                                        <StatusBadge status={curso.estadoHistorico} />
                                                    </div>
                                                </header>

                                                {/* --- CONTENIDO: LISTA DE HORARIOS --- */}
                                                {/* Esta sección contiene los horarios asociados al curso. */}
                                                <div className="p-4">
                                                    <h5 className="text-base font-semibold text-gray-700 mb-2">Horarios Programados:</h5>
                                                    <div className="space-y-4">
                                                        {/* Aquí se renderizan los componentes de HorarioCardComponent */}
                                                        {curso.horarios?.map((h, hi) => (
                                                            <HorarioCardComponent
                                                                key={hi}
                                                                curso={curso}
                                                                teacher={teacher} // Pasamos el docente para que HorarioCardComponent pueda usarlo
                                                                horario={h}
                                                                onRegistrarRubrica={onRegistrarRubrica}
                                                                onClose={onClose}
                                                                 // La funcionalidad del botón dentro de HorarioCardComponent
                                                            // La funcionalidad del botón dentro de HorarioCardComponent
                                                            // se conecta a través de la prop `onRegistrarRubrica`. Por ejemplo:
                                                            // onRegistrarRubrica={tuFuncionParaManejarElClick}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
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


export default TeacherDetailModal;