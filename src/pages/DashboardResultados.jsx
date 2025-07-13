// --- Componente Principal ---
import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';

import CalendarView from "../components/AssignmentsPage/CalendarView"
import HorarioCardComponent from "../components/AssignmentsPage/HorarioCardComponent"
import InfoPill from '../components/AssignmentsPage/InfoPill';
import PiddCourseCard from '../components/AssignmentsPage/PiddCourseCard';

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

const TeacherDetailModal = ({ teacher, onClose }) => {
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

const ScheduleDetailModal = ({ event, onClose }) => {
    if (!event) return null;
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
                        <hr className="my-3" />
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

export default function DashboardResultados() {
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
    const [reportData, setReportData] = useState(null);
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
            const response = await fetch('https://kali-ad-web.beesoftware.net/api/asignacion-especialista-docentes?latest=true');
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

            <div className="mx-auto">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Asignación Docente - Especialista</h1>
                    <p className="text-lg text-gray-500 mt-1">Busca, visualiza y genera las asignaciones de los colaboradores.</p>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-1">Buscar Docentes</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Este filtro te permite buscar un docente en particular.
                    </p>
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
                            {/* <div>
                                <label htmlFor="pidd-filter" className="block text-sm font-medium text-gray-700 mb-1">Estado PIDD</label>
                                <select id="pidd-filter" value={piddFilter} onChange={e => handleFilterChange(setPiddFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Todos">Todos</option>
                                    <option value="Con PIDD">Con PIDD</option>
                                    <option value="Sin PIDD">Sin PIDD</option>
                                </select>
                            </div> */}
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Cambios en carga horaria docente</label>
                                <select id="status-filter" value={statusFilter} onChange={e => handleFilterChange(setStatusFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Todos">Todos</option>
                                    <option value="NUEVO">Con Cambio en la Programación Horaria</option>
                                    <option value="MODIFICADO">Docente Modificado</option>
                                </select>
                            </div>
                            {/* <div>
                                <label htmlFor="program-filter" className="block text-sm font-medium text-gray-700 mb-1">Programa</label>
                                <select id="program-filter" value={programFilter} onChange={e => handleFilterChange(setProgramFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    {programOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div> */}
                            {/* <div>
                                <label htmlFor="modality-filter" className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                                <select id="modality-filter" value={modalityFilter} onChange={e => handleFilterChange(setModalityFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    {modalityOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div> */}
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
                                                    <span>{teacher.docente || (teacher.pidd ? pidd.docente : 'Nombre no disponible')}</span>
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
                            <p className="text-gray-500 text-center">No se encontraron docentes.<br />Intenta ajustar los filtros o genera una nueva asignación.</p>
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