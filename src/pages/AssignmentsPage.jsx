import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Mail, BookOpen, Calendar, Users, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin, Edit, UploadCloud, Download, XCircle, ListChecks, CalendarClock, FileText, BookUser } from 'lucide-react';
import CalendarView from "../components/AssignmentsPage/CalendarView"
import HorarioCardComponent from "../components/AssignmentsPage/HorarioCardComponent"
import InfoPill from '../components/AssignmentsPage/InfoPill';
import PiddCourseCard from '../components/AssignmentsPage/PiddCourseCard';
import LoadingOverlay from '../components/AssignmentsPage/LoadingOverlay';
import Notification from '../components/AssignmentsPage/Notification';
import ConfirmationModal from '../components/AssignmentsPage/ConfirmationModal';
import ScheduleDetailModal from '../components/AssignmentsPage/ScheduleDetailModal';
import TeacherDetailModal from '../components/AssignmentsPage/TeacherDetailModal';
import Rubrica from '../components/Rubrica';

// --- CONFIGURACIÓN GLOBAL ---
const BATCH_SIZE = 1000; // Mantenido por si se usa en otro lugar, pero no para el envío.

const API_BASE_URL_SUPERMALLA = 'http://localhost:3001/api/super-malla';
const SUPER_MALLA_API_KEYS = [
    "semestre", "fechaCarga", "campus", "facultad", "carrera", "codDuenioCurso", "duenioCurso",
    "codCurso", "nombreCurso", "hrsPlanCurso", "nrc", "seccion"]

// --- CONFIGURACIÓN PARA CARGA DE PROGRAMACIÓN ---
const API_BASE_URL_PROGRAMACION = 'http://localhost:3001/api/programacion-horaria';
const PROGRAMACION_HORARIA_API_KEYS = [
    "semestre", "fechaCarga", "periodo", "campus", "facultad", "codDuenioCurso", "duenioCurso",
    "codCurso", "nombreCurso", "hrsPlanCurso", "nrc", "seccion",
    "estatus", "lstCrz", "origenLstCrz", "sobrepasoAula", "tipHor", "metEdu",
    "maximo", "real", "restante", "hrsCredito", "idDocente", "idRrhh",
    "docente", "idPrinc", "tipoJornada", "estadoDocente", "motivo",
    "fechaInicio", "fechaFin", "dia", "hora", "turno", "edificio", "aula",
    "tipoAmbiente", "inExPrograma", "codProgramasCompartidos", "programasCompartidos",
    "inExCampus", "campus2", "tipoRequisito", "requisitos", "bloquesHorarios",
    "inExAtributo", "atributos", "inExCohorte", "cohortes", "atributosBolson"
];

// --- CONFIGURACIÓN PARA CARGA DE ESA ---
const API_BASE_URL_ESA = 'http://localhost:3001/api/esa';
const ESA_API_KEYS = [
    'semestre', 'fechaCarga', 'grupoDocente', 'tipoDeEncuesta', 'modalidad', 'programa', 'modulo', 'campus', 'codBanner', 'codPayroll', 'dni', 'nombreDocente',
    'totalMatriculados', 'totalEncuestados', 'porcentajeCobertura',
    'preguntaNps', 'preguntaContribAprendizaje', 'promedioEsa', 'escala',
    'nDetractoresNps', 'nNeutrosNps', 'nPromotoresNps', 'promedioNps', 'ranking'
];

// --- CONFIGURACIÓN PARA REPORTE ÚNICO DOCENTE ---
const API_BASE_URL_REPORTE = 'http://localhost:3001/api/reporte-unico-docente';
const REPORTE_API_KEYS = [
    'codigoColaborador', 'dni', 'codigoBanner', 'docente',
    'rol2025_1', 'horasPedagogicasM1', 'horasPedagogicasM2', 'alerta',
    'correoDocente', 'sedeDictado', 'facultad', 'carrera', 'responsableProgramacion'
];

// --- CONFIGURACIÓN PARA PLAN INTEGRAL DOCENTE (PIDD) ---
const API_BASE_URL_PIDD = 'http://localhost:3001/api/plan-integral-docente';
const PIDD_API_KEYS_FROM_FILE = [
    'campus', 'facultad', 'carrera', 'programa', 'modalidad', 'payroll', 'dni', 'banner', 'docente',
    'cargo', 'correo', 'esa', 'rubrica', 'dispersion', 'tipoPlanIntegral',
    'modalidadCurso', 'programaCurso', 'codCurso', 'nombreCurso', 'esaCurso',
    'rubricaCurso', 'dispersionCurso', 'encuentraProgramacion', 'modalidadCurso2',
    'programaCurso2', 'codCurso2', 'nombreCurso2', 'esaCurso2', 'rubricaCurso2',
    'dispersionCurso2', 'encuentraProgramacion2', 'planMejora', 'coordinadora',
    'comentarios', 'respuestaDocente', 'columna', 'estadoFinal', 'asignacion'
];

// --- CONFIGURACIÓN PARA INDUCCION DOCENTE ---
const API_BASE_URL_INDUCCION = 'http://localhost:3001/api/induccion-docente';
const INDUCCION_API_KEYS = [
    'semestre', 'fechaCarga', 'dni', 'idDocente', 'nivel', 'tipo_dictado', 'primer_nombre', 'segundo_nombre',
    'apellido_paterno', 'apellido_materno', 'telefono_contacto', 'correo_contacto',
    'cargo_ingreso', 'sede_ingreso', 'facultad', 'carrera_departamento',
    'jefe_inmediato', 'fecha_incorporacion', 'periodo_2024_1', 'periodo_2024_2',
    'periodo_2025_1', 'grupo_modalidad_induccion', 'criterio_induccion_25_2'
];


// --- Mock Data (usado como fallback en caso de error de API) ---
const initialApiData = {
    "data": [
        {
            "_id": "685c57b938acc3ced2904a52",
            "idDocente": "N00215514",
            "docente": "ABAD/DEL AGUILA, JULIO CESAR",
            "RolColaborador": "DOCENTE A TIEMPO PARCIAL",
            "programa": "WA",
            "modalidad": "Presencial",
            "promedioEsa": 0.9125,
            "semestre": "2025-1",
            "estadoHistorico": "NUEVO",
            "especialistaDni": "40302370",
            "nombreEspecialista": "VILCA BORCHANI, VICTOR ERMELO",
            "cursos": [
                {
                    "nombreCurso": "NEGOCIOS DIGITALES",
                    "codCurso": "COME1407A",
                    "seccion": "COME.1407A.225515.2028.P",
                    "periodo": "225515",
                    "nrc": "2028",
                    "metEdu": "P",
                    "horarios": [
                        {
                            "fechaInicio": "May 20, 2025 12:00:00 AM",
                            "fechaFin": "Jul 12, 2025 12:00:00 AM",
                            "dia": "MARTES",
                            "hora": "21:10 - 22:40",
                            "campus": "TML",
                            "aula": "C301",
                            "estadoHistorico": "NUEVO",
                            "acompanamiento": {
                                "especialistaDni": "40302370",
                                "nombreEspecialista": "VILCA BORCHANI, VICTOR ERMELO",
                                "estado": "Planificado",
                            }
                        },
                        {
                            "fechaInicio": "May 20, 2025 12:00:00 AM",
                            "fechaFin": "Jul 12, 2025 12:00:00 AM",
                            "dia": "MARTES",
                            "hora": "19:30 - 21:00",
                            "campus": "TML",
                            "aula": "C301",
                            "estadoHistorico": "NUEVO"
                        }
                    ],
                    "estadoHistorico": "NUEVO"
                }
            ]
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

const StatCard = ({ icon, label, value, colorClass = 'text-gray-700', isHighlighted = false }) => (
    <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center shadow-sm ${isHighlighted ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-gray-100/80'}`}>
        <div className={`${isHighlighted ? 'text-blue-700' : 'text-blue-600'} mb-2`}>{icon}</div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className={`font-bold ${colorClass} ${isHighlighted ? 'text-2xl text-blue-800' : 'text-xl'}`}>{value}</div>
    </div>
);

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

const LatestUploadInfo = ({ latestRecord, isLoading, typeLabel }) => {
    if (isLoading) {
        return (
            <div className="text-sm text-gray-600 flex items-center">
                <Loader className="animate-spin h-4 w-4 mr-2" /> Buscando información...
            </div>
        );
    }

    if (!latestRecord) {
        return (
            <div className="text-sm text-gray-500 italic">
                Sin cargas previas para {typeLabel}.
            </div>
        );
    }

    return (
        <div className="text-sm text-gray-700 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div><strong>Actualizado:</strong> {formatDateTime(latestRecord.ultimaActualizacion)}</div>
            {latestRecord.fechaCarga && <div><strong>Registro:</strong> {latestRecord.fechaCarga}</div>}
        </div>
    );
};

// --- Componente Desplegable para Cargas ---
const CollapsibleUploadSection = ({ title, icon: Icon, latestRecord, isLoading, typeLabel, children, isAnyProcessRunning, themeColor = 'gray' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const themeClasses = {
        gray: { text: 'text-gray-800', icon: 'text-gray-600', border: 'border-gray-200' },
        orange: { text: 'text-orange-800', icon: 'text-orange-600', border: 'border-orange-200' },
        teal: { text: 'text-teal-800', icon: 'text-teal-600', border: 'border-teal-200' },
        purple: { text: 'text-purple-800', icon: 'text-purple-600', border: 'border-purple-200' },
        indigo: { text: 'text-indigo-800', icon: 'text-indigo-600', border: 'border-indigo-200' },
        cyan: { text: 'text-cyan-800', icon: 'text-cyan-600', border: 'border-cyan-200' },
    };

    const currentTheme = themeClasses[themeColor] || themeClasses.gray;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <div
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-grow">
                    <div className="flex items-center">
                        <Icon className={`mr-3 h-6 w-6 ${currentTheme.icon}`} />
                        <h2 className={`text-xl font-bold ${currentTheme.text}`}>
                            {title}
                        </h2>
                    </div>
                    {!isExpanded && (
                       <div className="mt-2 pl-9">
                         <LatestUploadInfo latestRecord={latestRecord} isLoading={isLoading} typeLabel={typeLabel} />
                       </div>
                    )}
                </div>
                <div className="flex-shrink-0 ml-4">
                        <ChevronDown
                            className={`transform transition-transform duration-300 text-gray-500 ${isExpanded ? 'rotate-180' : ''}`}
                            size={24}
                        />
                </div>
            </div>

            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                <div className={`mt-4 pt-4 border-t ${currentTheme.border}`}>
                    {isExpanded && (
                         <div className="mb-4">
                             <LatestUploadInfo latestRecord={latestRecord} isLoading={isLoading} typeLabel={typeLabel} />
                         </div>
                    )}
                    <fieldset disabled={isAnyProcessRunning}>
                        {children}
                    </fieldset>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal ---
export default function AssignmentsPage() {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [periodoAsignacion, setPeriodoAsignacion] = useState('2025-1');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState({ message: '', progress: 0, error: false });
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [downloadingType, setDownloadingType] = useState(null);

    // --- ESTADOS PARA CARGA DE ARCHIVOS DE PROGRAMACIÓN ---
    const programmingFileInputRef = useRef(null);
    const [isUploadingProgramming, setIsUploadingProgramming] = useState(false);
    const [uploadProgressProgramming, setUploadProgressProgramming] = useState(0);
    const [uploadStatusMessageProgramming, setUploadStatusMessageProgramming] = useState('');
    const [parsedProgrammingFileData, setParsedProgrammingFileData] = useState(null);
    const [uploadedProgrammingFileName, setUploadedProgrammingFileName] = useState('');
    const [uploadProgrammingSemester, setUploadProgrammingSemester] = useState('');
    const [uploadProgrammingDate, setUploadProgrammingDate] = useState('');

    // --- ESTADOS PARA CARGA DE ARCHIVOS ESA ---
    const esaFileInputRef = useRef(null);
    const [isUploadingEsa, setIsUploadingEsa] = useState(false);
    const [uploadProgressEsa, setUploadProgressEsa] = useState(0);
    const [uploadStatusMessageEsa, setUploadStatusMessageEsa] = useState('');
    const [parsedEsaFileData, setParsedEsaFileData] = useState(null);
    const [uploadedEsaFileName, setUploadedEsaFileName] = useState('');
    const [uploadEsaSemester, setUploadEsaSemester] = useState('');
    const [uploadEsaDate, setUploadEsaDate] = useState('');

    // --- ESTADOS PARA CARGA DE REPORTE ÚNICO ---
    const reporteFileInputRef = useRef(null);
    const [isUploadingReporte, setIsUploadingReporte] = useState(false);
    const [uploadProgressReporte, setUploadProgressReporte] = useState(0);
    const [uploadStatusMessageReporte, setUploadStatusMessageReporte] = useState('');
    const [parsedReporteFileData, setParsedReporteFileData] = useState(null);
    const [uploadedReporteFileName, setUploadedReporteFileName] = useState('');
    const [uploadReporteSemester, setUploadReporteSemester] = useState('');
    const [uploadReporteDate, setUploadReporteDate] = useState('');

    // --- ESTADOS PARA CARGA DE PIDD ---
    const piddFileInputRef = useRef(null);
    const [isUploadingPidd, setIsUploadingPidd] = useState(false);
    const [uploadProgressPidd, setUploadProgressPidd] = useState(0);
    const [uploadStatusMessagePidd, setUploadStatusMessagePidd] = useState('');
    const [parsedPiddFileData, setParsedPiddFileData] = useState(null);
    const [uploadedPiddFileName, setUploadedPiddFileName] = useState('');
    const [uploadPiddSemester, setUploadPiddSemester] = useState('');
    const [uploadPiddDate, setUploadPiddDate] = useState('');
    
    // --- ESTADOS PARA CARGA DE INDUCCION DOCENTE ---
    const induccionFileInputRef = useRef(null);
    const [isUploadingInduccion, setIsUploadingInduccion] = useState(false);
    const [uploadProgressInduccion, setUploadProgressInduccion] = useState(0);
    const [uploadStatusMessageInduccion, setUploadStatusMessageInduccion] = useState('');
    const [parsedInduccionFileData, setParsedInduccionFileData] = useState(null);
    const [uploadedInduccionFileName, setUploadedInduccionFileName] = useState('');
    const [uploadInduccionSemester, setUploadInduccionSemester] = useState('');
    const [uploadInduccionDate, setUploadInduccionDate] = useState('');


    // --- ESTADOS PARA HISTORIAL DE CARGAS (ASIGNACIÓN) ---
    const [isAssignmentReportLoading, setIsAssignmentReportLoading] = useState(false);
    const [latestAssignmentReport, setLatestAssignmentReport] = useState(null);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);

    // --- ESTADOS PARA HISTORIAL DE CARGAS (PROGRAMACIÓN) ---
    const [isProgrammingReportLoading, setIsProgrammingReportLoading] = useState(false);
    const [latestProgrammingReport, setLatestProgrammingReport] = useState(null);
    const [programmingReportToDelete, setProgrammingReportToDelete] = useState(null);

    // --- ESTADOS PARA HISTORIAL DE CARGAS (ESA) ---
    const [isEsaReportLoading, setIsEsaReportLoading] = useState(false);
    const [latestEsaReport, setLatestEsaReport] = useState(null);
    const [esaReportToDelete, setEsaReportToDelete] = useState(null);

    // --- ESTADOS PARA HISTORIAL DE CARGAS (REPORTE ÚNICO) ---
    const [isReporteReportLoading, setIsReporteReportLoading] = useState(false);
    const [latestReporteReport, setLatestReporteReport] = useState(null);
    const [reporteToDelete, setReporteToDelete] = useState(null);

    // --- ESTADOS PARA HISTORIAL DE CARGAS (PIDD) ---
    const [isPiddReportLoading, setIsPiddReportLoading] = useState(false);
    const [latestPiddReport, setLatestPiddReport] = useState(null);
    const [piddToDelete, setPiddToDelete] = useState(null);
    
    // --- ESTADOS PARA HISTORIAL DE CARGAS (INDUCCION) ---
    const [isInduccionReportLoading, setIsInduccionReportLoading] = useState(false);
    const [latestInduccionReport, setLatestInduccionReport] = useState(null);
    const [induccionToDelete, setInduccionToDelete] = useState(null);


        const [typeModalState, setTypeModalState] = useState({ isOpen: false });
        const [currentView, setCurrentView] = useState('list');
        const [selectedRubric, setSelectedRubric] = useState(null);
        const [isLoading, setIsLoading] = useState(true);
    
            // --- Estados para gestionar las plantillas ---
            const [rubricTemplates, setRubricTemplates] = useState([]);
            const [selectedTemplate, setSelectedTemplate] = useState(null);
            const [isTemplateLoading, setIsTemplateLoading] = useState(false);
    const [error, setError] = useState(null);

    const [teacher, setTeacher] = useState(null);
    const [horario, setHorario] = useState(null);
    const [curso, setCurso] = useState(null);

    const isAnyProcessRunning = isGenerating || isUploadingProgramming || isUploadingEsa || isUploadingReporte || isUploadingPidd || isUploadingInduccion || isProcessingDelete || !!downloadingType;


    const onRegistrarRubrica = (rubricaID, teacher, curso, horario) => {
        console.log(rubricaID);
        handleTypeSelected(rubricaID)
        setTeacher(teacher);
        setCurso(curso);
        setHorario(horario);
        console.log("Docente seleccionado:", teacher);
        console.log("Curso seleccionado:", curso);
        console.log("Horario seleccionado:", horario);

    }
    
        const API_URL_RUBRICAS = 'http://localhost:3002/api/rubricas';
    const API_URL_TEMPLATES = 'http://localhost:3002/api/rubrica-templates';

    const onBackToList = () => {
        setSelectedRubric(null);
        setSelectedTemplate(null);
        setCurrentView('list');
    };

    const handleTypeSelected = async (templateId) => {
        setTypeModalState({ isOpen: false });
        setIsLoading(true);
        setCurrentView('detail');
        try {
            const response = await fetch(`${API_URL_TEMPLATES}/${templateId}`);
            if (!response.ok) throw new Error('No se pudo cargar la plantilla seleccionada.');
            const templateData = await response.json();
            setSelectedTemplate(templateData);
            setSelectedRubric(null); // Aseguramos que estamos en modo creación
            console.log("Plantilla seleccionada:", templateData);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setCurrentView('list'); // Si falla, volvemos a la lista
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA PARA HISTORIAL DE ASIGNACIÓN ---
    const fetchAssignmentReportHistory = useCallback(async () => {
        setIsAssignmentReportLoading(true);
        try {
            // Simulación de API para asignación
            await new Promise(res => setTimeout(res, 1000));
            const mockData = {
                "2025-1": [{ id: "rep1", type: 'assignment', fechaCarga: "2025-07-19", cantidad: 1250, ultimaActualizacion: new Date().toISOString() }],
                "2024-2": [{ id: "rep4", type: 'assignment', fechaCarga: "2024-12-10", cantidad: 1180, ultimaActualizacion: "2024-12-10T10:00:00.000Z" }]
            };
            const allReports = Object.values(mockData).flat();
            if (allReports.length > 0) {
                const mostRecent = allReports.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))[0];
                setLatestAssignmentReport(mostRecent);
            }
        } catch (error) {
            console.error("Error fetching assignment history:", error);
        } finally {
            setIsAssignmentReportLoading(false);
        }
    }, []);

    // --- LÓGICA PARA HISTORIAL DE PROGRAMACIÓN ---
    const fetchProgrammingReportHistory = useCallback(async () => {
        setIsProgrammingReportLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL_PROGRAMACION}/reporte`);
            if (!response.ok) throw new Error(`Error en la API de reportes: ${response.status}`);
            const responseData = await response.json();
            const reportList = responseData.data || [];
            if (reportList.length > 0) {
                const mostRecent = reportList.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))[0];
                setLatestProgrammingReport(mostRecent);
            } else {
                setLatestProgrammingReport(null);
            }
        } catch (err) {
            console.error("Error fetching programming history:", err);
            setLatestProgrammingReport(null);
        } finally {
            setIsProgrammingReportLoading(false);
        }
    }, []);

    // --- LÓGICA PARA HISTORIAL DE ESA ---
    const fetchEsaReportHistory = useCallback(async () => {
        setIsEsaReportLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL_ESA}/reporte`);
            if (!response.ok) throw new Error(`Error en la API de reportes ESA: ${response.status}`);
            const responseData = await response.json();
            const reportList = responseData.data || [];
            if (reportList.length > 0) {
                const mostRecent = reportList.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))[0];
                setLatestEsaReport(mostRecent);
            } else {
                setLatestEsaReport(null);
            }
        } catch (err) {
            console.error("Error fetching ESA history:", err);
            setLatestEsaReport(null);
        } finally {
            setIsEsaReportLoading(false);
        }
    }, []);

    // --- LÓGICA PARA HISTORIAL DE REPORTE ÚNICO ---
    const fetchReporteReportHistory = useCallback(async () => {
        setIsReporteReportLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL_REPORTE}/reporte`);
            if (!response.ok) throw new Error(`Error en la API de reportes: ${response.statusText}`);
            const responseData = await response.json();
            const reportList = responseData.data || [];
            if (reportList.length > 0) {
                const mostRecent = reportList.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))[0];
                setLatestReporteReport(mostRecent);
            } else {
                setLatestReporteReport(null);
            }
        } catch (err) {
            console.error("Error fetching reporte unico history:", err);
            setLatestReporteReport(null);
        } finally {
            setIsReporteReportLoading(false);
        }
    }, []);

    // --- LÓGICA PARA HISTORIAL DE PIDD ---
    const fetchPiddReportHistory = useCallback(async () => {
        setIsPiddReportLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL_PIDD}/reporte`);
            if (!response.ok) throw new Error(`Error en la API de reportes PIDD: ${response.status}`);
            const responseData = await response.json();
            const reportList = responseData.data || [];
            if (reportList.length > 0) {
                const mostRecent = reportList.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))[0];
                setLatestPiddReport(mostRecent);
            } else {
                setLatestPiddReport(null);
            }
        } catch (err) {
            console.error("Error fetching PIDD history:", err);
            setLatestPiddReport(null);
        } finally {
            setIsPiddReportLoading(false);
        }
    }, []);
    
    // --- LÓGICA PARA HISTORIAL DE INDUCCION DOCENTE ---
    const fetchInduccionReportHistory = useCallback(async () => {
        setIsInduccionReportLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL_INDUCCION}/reporte`);
             if (!response.ok) throw new Error(`Error en la API de reportes de Inducción: ${response.status}`);
            const responseData = await response.json();
            const reportList = responseData.data || [];
            if (reportList.length > 0) {
                const mostRecent = reportList.sort((a, b) => new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion))[0];
                setLatestInduccionReport(mostRecent);
            } else {
                setLatestInduccionReport(null);
            }
        } catch (error) {
            console.error("Error fetching induccion history:", error);
            setLatestInduccionReport(null);
        } finally {
            setIsInduccionReportLoading(false);
        }
    }, []);


    const handleDeleteReportClick = (report) => {
        if (report.type === 'assignment') setReportToDelete(report);
        else if (report.type === 'programming') setProgrammingReportToDelete(report);
        else if (report.type === 'esa') setEsaReportToDelete(report);
        else if (report.type === 'reporte') setReporteToDelete(report);
        else if (report.type === 'pidd') setPiddToDelete(report);
        else if (report.type === 'induccion') setInduccionToDelete(report);
    };

    const handleConfirmDelete = async () => {
        const report = reportToDelete || programmingReportToDelete || esaReportToDelete || reporteToDelete || piddToDelete || induccionToDelete;
        if (!report) return;

        setIsProcessingDelete(true);

        try {
            if (report.type === 'assignment') {
                await new Promise(res => setTimeout(res, 1000));
                await fetchAssignmentReportHistory();
            } else {
                const url = {
                    programming: API_BASE_URL_PROGRAMACION,
                    esa: API_BASE_URL_ESA,
                    reporte: API_BASE_URL_REPORTE,
                    pidd: API_BASE_URL_PIDD,
                    induccion: API_BASE_URL_INDUCCION,
                }[report.type];

                const response = await fetch(`${url}/bulk`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ semestre: report.semestre, fechaCarga: report.fechaCarga })
                });
                if (!response.ok && response.status !== 404) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error del servidor');
                }

                if (report.type === 'programming') await fetchProgrammingReportHistory();
                else if (report.type === 'esa') await fetchEsaReportHistory();
                else if (report.type === 'reporte') await fetchReporteReportHistory();
                else if (report.type === 'pidd') await fetchPiddReportHistory();
                else if (report.type === 'induccion') await fetchInduccionReportHistory();
            }
            setNotification({ type: 'success', title: 'Éxito', message: 'El reporte ha sido eliminado.' });
        } catch (error) {
            console.error("Error al eliminar:", error);
            setNotification({ type: 'error', title: 'Error', message: `No se pudo eliminar el registro: ${error.message}` });
        } finally {
            setIsProcessingDelete(false);
            setReportToDelete(null);
            setProgrammingReportToDelete(null);
            setEsaReportToDelete(null);
            setReporteToDelete(null);
            setPiddToDelete(null);
            setInduccionToDelete(null);
        }
    };

    const fetchData = async () => {
        setIsTableLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/asignacion-especialista-docentes?latest=true');
            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status}`);
            }
            const data = await response.json();
            setTeachers(data.data || []);
        } catch (error) {
            console.error("Error al cargar los datos de docentes:", error);
            setTeachers(initialApiData.data || []);
            setNotification({ type: 'error', title: 'Error de Red', message: 'No se pudieron cargar los datos de docentes. Se muestra data de respaldo.' });
        } finally {
            setIsTableLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        fetchAssignmentReportHistory();
        fetchProgrammingReportHistory();
        fetchEsaReportHistory();
        fetchReporteReportHistory();
        fetchPiddReportHistory();
        fetchInduccionReportHistory();
    }, [fetchAssignmentReportHistory, fetchProgrammingReportHistory, fetchEsaReportHistory, fetchReporteReportHistory, fetchPiddReportHistory, fetchInduccionReportHistory]);

    const periodOptions = useMemo(() => {
        const options = [];
        const currentYear = new Date().getFullYear();
        for (let year = currentYear - 2; year <= currentYear + 2; year++) {
            options.push(`${year}-1`);
            options.push(`${year}-2`);
        }
        return options;
    }, []);

    const filteredTeachers = useMemo(() => {
        return teachers.filter(teacher => {
            const teacherName = teacher.docente || '';
            const teacherId = teacher.idDocente || '';
            const specialistName = teacher.nombreEspecialista || '';

            const searchTermLower = searchTerm.toLowerCase();

            const searchTermMatch = teacherName.toLowerCase().includes(searchTermLower) ||
                teacherId.toLowerCase().includes(searchTermLower) ||
                specialistName.toLowerCase().includes(searchTermLower);

            const statusMatch = statusFilter === 'Todos' || teacher.estadoHistorico === statusFilter;

            return searchTermMatch && statusMatch;
        });
    }, [teachers, searchTerm, statusFilter]);

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

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerationStatus({ message: 'Iniciando proceso...', progress: 0, error: false });

        try {
            setGenerationStatus({ message: `Paso 1/2: Limpiando datos para el periodo ${periodoAsignacion}...`, progress: 10, error: false });
            const cleanResponse = await fetch('http://localhost:3001/api/sp-da002-limpiar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semestre: periodoAsignacion }),
            });
            if (!cleanResponse.ok) throw new Error(`Error en el paso de limpieza (código: ${cleanResponse.status})`);
            await cleanResponse.json();

            setGenerationStatus({ message: `Paso 2/2: Realizando la asignación de especialistas...`, progress: 50, error: false });
            const assignResponse = await fetch('http://localhost:3001/api/asignacion-especialista-docentes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semestre: periodoAsignacion }),
            });
            if (!assignResponse.ok) {
                let errorMessage = `Error al asignar especialistas (código: ${assignResponse.status})`;
                try { const errorJson = await assignResponse.json(); errorMessage = errorJson.message || errorJson.error || errorMessage; } catch (e) { }
                throw new Error(errorMessage);
            }
            const assignResult = await assignResponse.json();

            setGenerationStatus({ message: `Proceso completado. ${assignResult.message || 'Actualizando vista...'}`, progress: 90, error: false });
            await new Promise(res => setTimeout(res, 1500));
            await fetchData();
            await fetchAssignmentReportHistory();

            setGenerationStatus({ message: '¡Asignación y actualización completada con éxito!', progress: 100, error: false });
            setNotification({ type: 'success', title: 'Éxito', message: 'La asignación se generó y los datos se actualizaron.' });
            await new Promise(res => setTimeout(res, 2000));

        } catch (error) {
            console.error("Error al generar asignación:", error);
            setGenerationStatus({ message: error.message, progress: generationStatus.progress, error: true });
            setNotification({ type: 'error', title: 'Error en Generación', message: error.message });
            await new Promise(res => setTimeout(res, 5000));
        } finally {
            setIsGenerating(false);
        }
    };

    // --- LÓGICA DE CARGA DE ARCHIVOS (GENÉRICA) ---
    const handleFileSelect = (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const config = {
            programming: {
                resetter: resetProgrammingUploadState, setFileName: setUploadedProgrammingFileName, setIsUploading: setIsUploadingProgramming,
                setMessage: setUploadStatusMessageProgramming, setParsedData: setParsedProgrammingFileData, setNotification,
            },
            esa: {
                resetter: resetEsaUploadState, setFileName: setUploadedEsaFileName, setIsUploading: setIsUploadingEsa,
                setMessage: setUploadStatusMessageEsa, setParsedData: setParsedEsaFileData, setNotification,
            },
            reporte: {
                resetter: resetReporteUploadState, setFileName: setUploadedReporteFileName, setIsUploading: setIsUploadingReporte,
                setMessage: setUploadStatusMessageReporte, setParsedData: setParsedReporteFileData, setNotification,
            },
            pidd: {
                resetter: resetPiddUploadState, setFileName: setUploadedPiddFileName, setIsUploading: setIsUploadingPidd,
                setMessage: setUploadStatusMessagePidd, setParsedData: setParsedPiddFileData, setNotification,
            },
            induccion: {
                resetter: resetInduccionUploadState, setFileName: setUploadedInduccionFileName, setIsUploading: setIsUploadingInduccion,
                setMessage: setUploadStatusMessageInduccion, setParsedData: setParsedInduccionFileData, setNotification,
            },
        }[type];

        config.resetter(false);
        config.setFileName(file.name);
        config.setIsUploading(true);
        config.setMessage('Leyendo archivo...');

        reader.onload = (e) => {
            setTimeout(async () => {
                try {
                    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false });
                    config.setParsedData(jsonData.map((row, index) => ({ record: row, originalIndex: index + 2 })));
                    config.setMessage(`Archivo ${file.name} listo para cargar.`);
                } catch (err) {
                    config.setNotification({ type: 'error', title: 'Error de Lectura', message: `Error al leer archivo: ${err.message}` });
                    config.resetter();
                } finally {
                    config.setIsUploading(false);
                }
            }, 50);
        };
        reader.onerror = () => { config.setIsUploading(false); config.setNotification({ type: 'error', title: 'Error', message: 'No se pudo leer el archivo.' }); };
        reader.readAsArrayBuffer(file);
    };

    // --- CORREGIDO: LÓGICA DE CARGA GENÉRICA ---
    const handleGenericUpload = useCallback(async (type) => {
        const config = {
            programming: {
                parsedData: parsedProgrammingFileData, semester: uploadProgrammingSemester, date: uploadProgrammingDate, apiKeys: PROGRAMACION_HORARIA_API_KEYS, baseUrl: API_BASE_URL_PROGRAMACION,
                setIsUploading: setIsUploadingProgramming, setNotification, setProgress: setUploadProgressProgramming, setMessage: setUploadStatusMessageProgramming,
                resetter: resetProgrammingUploadState, fetchHistory: fetchProgrammingReportHistory,
            },
            esa: {
                parsedData: parsedEsaFileData, semester: uploadEsaSemester, date: uploadEsaDate, apiKeys: ESA_API_KEYS, baseUrl: API_BASE_URL_ESA,
                setIsUploading: setIsUploadingEsa, setNotification, setProgress: setUploadProgressEsa, setMessage: setUploadStatusMessageEsa,
                resetter: resetEsaUploadState, fetchHistory: fetchEsaReportHistory,
            },
            reporte: {
                parsedData: parsedReporteFileData, semester: uploadReporteSemester, date: uploadReporteDate, apiKeys: REPORTE_API_KEYS, baseUrl: API_BASE_URL_REPORTE,
                setIsUploading: setIsUploadingReporte, setNotification, setProgress: setUploadProgressReporte, setMessage: setUploadStatusMessageReporte,
                resetter: resetReporteUploadState, fetchHistory: fetchReporteReportHistory,
            },
            pidd: {
                parsedData: parsedPiddFileData, semester: uploadPiddSemester, date: uploadPiddDate, apiKeys: PIDD_API_KEYS_FROM_FILE, baseUrl: API_BASE_URL_PIDD,
                setIsUploading: setIsUploadingPidd, setNotification, setProgress: setUploadProgressPidd, setMessage: setUploadStatusMessagePidd,
                resetter: resetPiddUploadState, fetchHistory: fetchPiddReportHistory,
            },
            induccion: {
                parsedData: parsedInduccionFileData, semester: uploadInduccionSemester, date: uploadInduccionDate, apiKeys: INDUCCION_API_KEYS, baseUrl: API_BASE_URL_INDUCCION,
                setIsUploading: setIsUploadingInduccion, setNotification, setProgress: setUploadProgressInduccion, setMessage: setUploadStatusMessageInduccion,
                resetter: resetInduccionUploadState, fetchHistory: fetchInduccionReportHistory,
            },
        }[type];

        const { parsedData, semester, date, apiKeys, baseUrl, setIsUploading, setProgress, setMessage, resetter, fetchHistory } = config;

        if (!parsedData || !semester || !date) {
            setNotification({ type: 'error', title: 'Datos incompletos', message: 'Por favor, complete todos los campos y seleccione un archivo válido.' });
            return;
        }

        setIsUploading(true);
        setNotification(null);
        setProgress(0);
        setMessage('Preparando datos para la carga...');

        try {
            const finalPayload = parsedData.map(({ record: rawRecord }) => {
                const hasData = Object.values(rawRecord).some(value => value !== null && String(value).trim() !== '');
                if (!hasData) return null;

                const payload = { semestre: semester, fechaCarga: date };
                apiKeys.forEach(apiKey => {
                    if (apiKey !== 'semestre' && apiKey !== 'fechaCarga') {
                        const value = rawRecord[apiKey];
                        payload[apiKey] = value !== undefined && value !== null ? String(value).trim() : '';
                    }
                });
                return payload;
            }).filter(p => p);

            const totalRecords = finalPayload.length;
            if (totalRecords === 0) {
                setNotification({ type: 'error', title: 'Sin Datos', message: 'El archivo no contiene registros válidos para cargar.' });
                resetter();
                return;
            }
            
            setProgress(10);
            setMessage(`Enviando ${totalRecords} registros al servidor. Esto puede tardar unos momentos...`);

            const response = await fetch(`${baseUrl}/bulk`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });

            setProgress(90); 
            const responseData = await response.json();

            if (!response.ok) {
                const errorDetails = responseData.details ? JSON.stringify(responseData.details, null, 2) : (responseData.erroresMuestra ? JSON.stringify(responseData.erroresMuestra, null, 2) : '');
                throw new Error(`${responseData.message || 'Error en carga masiva.'}\n${errorDetails}`);
            }
            
            const successCount = responseData.registrosProcesados || responseData.registrosInsertados || 0;
            const createdCount = responseData.creados || 0;
            const updatedCount = responseData.actualizados || 0;

            let successMessage = `Proceso completado. Se procesaron ${successCount} de ${totalRecords} registros.`;
            if (createdCount > 0 || updatedCount > 0) {
                 successMessage = `Proceso completado: ${createdCount} creados, ${updatedCount} actualizados.`;
            }

            setNotification({ type: 'success', title: 'Carga Exitosa', message: successMessage });

            resetter();
            await fetchHistory();
            await fetchData();
            setProgress(100);

        } catch (error) {
            setNotification({ type: 'error', title: 'Fallo en la Carga', message: `El proceso falló: ${error.message}` });
        } finally {
            setIsUploading(false);
            setMessage('');
        }
    }, [
        parsedProgrammingFileData, uploadProgrammingSemester, uploadProgrammingDate, fetchProgrammingReportHistory,
        parsedEsaFileData, uploadEsaSemester, uploadEsaDate, fetchEsaReportHistory,
        parsedReporteFileData, uploadReporteSemester, uploadReporteDate, fetchReporteReportHistory,
        parsedPiddFileData, uploadPiddSemester, uploadPiddDate, fetchPiddReportHistory,
        parsedInduccionFileData, uploadInduccionSemester, uploadInduccionDate, fetchInduccionReportHistory,
        fetchData
    ]);

    // --- MANEJADORES Y RESETTERS ESPECÍFICOS ---
    const resetProgrammingUploadState = (resetSelections = true) => {
        setParsedProgrammingFileData(null);
        setUploadedProgrammingFileName('');
        if (resetSelections) {
            setUploadProgrammingSemester('');
            setUploadProgrammingDate('');
        }
        if (programmingFileInputRef.current) programmingFileInputRef.current.value = null;
    };

    const resetEsaUploadState = (resetSelections = true) => {
        setParsedEsaFileData(null);
        setUploadedEsaFileName('');
        if (resetSelections) {
            setUploadEsaSemester('');
            setUploadEsaDate('');
        }
        if (esaFileInputRef.current) esaFileInputRef.current.value = null;
    };

    const resetReporteUploadState = (resetSelections = true) => {
        setParsedReporteFileData(null);
        setUploadedReporteFileName('');
        if (resetSelections) {
            setUploadReporteSemester('');
            setUploadReporteDate('');
        }
        if (reporteFileInputRef.current) reporteFileInputRef.current.value = null;
    };

    const resetPiddUploadState = (resetSelections = true) => {
        setParsedPiddFileData(null);
        setUploadedPiddFileName('');
        if (resetSelections) {
            setUploadPiddSemester('');
            setUploadPiddDate('');
        }
        if (piddFileInputRef.current) piddFileInputRef.current.value = null;
    };

    const resetInduccionUploadState = (resetSelections = true) => {
        setParsedInduccionFileData(null);
        setUploadedInduccionFileName('');
        if (resetSelections) {
            setUploadInduccionSemester('');
            setUploadInduccionDate('');
        }
        if (induccionFileInputRef.current) induccionFileInputRef.current.value = null;
    };

    const handleDownloadTemplate = async (type) => {
        const { keys, filename } = {
            programming: { keys: PROGRAMACION_HORARIA_API_KEYS, filename: "Plantilla_Programacion_Horaria.xlsx" },
            esa: { keys: ESA_API_KEYS, filename: "Plantilla_Carga_ESA.xlsx" },
            reporte: { keys: REPORTE_API_KEYS, filename: "Plantilla_Reporte_Unico_Docente.xlsx" },
            pidd: { keys: PIDD_API_KEYS_FROM_FILE, filename: "Plantilla_PIDD.xlsx" },
            induccion: { keys: INDUCCION_API_KEYS, filename: "Plantilla_Induccion_Docente.xlsx" }
        }[type];

        try {
            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
            const templateHeaders = keys.filter(k => k !== 'semestre' && k !== 'fechaCarga');
            const ws = XLSX.utils.aoa_to_sheet([templateHeaders]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
            XLSX.writeFile(wb, filename);
        } catch (err) {
            setNotification({ type: 'error', title: 'Error', message: 'No se pudo generar la plantilla.' });
        }
    };

    const handleDownloadCollection = async (type) => {
        setDownloadingType(type);
        setNotification(null);

        const config = {
            programming: { url: `${API_BASE_URL_PROGRAMACION}/export`, filename: "Export_Programacion_Horaria.xlsx", label: "Programación Horaria" },
            pidd: { url: `${API_BASE_URL_PIDD}/export`, filename: "Export_PIDD.xlsx", label: "Plan Integral Docente" },
            reporte: { url: `${API_BASE_URL_REPORTE}/export`, filename: "Export_Reporte_Unico_Docente.xlsx", label: "Reporte Único Docente" },
            esa: { url: `${API_BASE_URL_ESA}/export`, filename: "Export_ESA.xlsx", label: "Datos ESA" },
            induccion: { url: `${API_BASE_URL_INDUCCION}/export`, filename: "Export_Induccion_Docente.xlsx", label: "Inducción Docente" },
        }[type];

        try {
            const response = await fetch(config.url);
            const responseData = await response.json();

            if (!response.ok || !responseData.success) {
                throw new Error(responseData.mensaje || `Error al exportar datos de ${config.label}.`);
            }

            const data = responseData.datos;
            if (!data || data.length === 0) {
                setNotification({ type: 'error', title: 'Sin Datos', message: `No se encontraron datos para exportar en ${config.label}.` });
                setDownloadingType(null);
                return;
            }

            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, config.label.substring(0, 31));
            XLSX.writeFile(wb, config.filename);

            setNotification({ type: 'success', title: 'Éxito', message: `Los datos de ${config.label} se han exportado correctamente.` });

        } catch (error) {
            console.error(`Error downloading ${type} collection:`, error);
            setNotification({ type: 'error', title: 'Error de Exportación', message: error.message });
        } finally {
            setDownloadingType(null);
        }
    };

    // --- NUEVA FUNCIÓN PARA DESCARGAR ASIGNACIÓN ---
    // const handleDownloadAssignment = async () => {
    //     if (teachers.length === 0) {
    //         setNotification({ type: 'error', title: 'Sin Datos', message: 'No hay datos de asignación para descargar.' });
    //         return;
    //     }

    //     try {
    //         const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
    //         const dataToExport = [];

    //         const headers = [
    //             'ID Docente', 'Docente', 'Rol Colaborador', 'Programa', 'Modalidad', 'Promedio ESA', 'Estado Histórico',
    //             'DNI Especialista', 'Nombre Especialista',
    //             'Código Curso', 'Nombre Curso', 'Sección', 'Periodo', 'NRC', 'Metodología',
    //             'Día', 'Hora', 'Campus', 'Aula', 'Fecha Inicio', 'Fecha Fin',
    //             'Curso en Plan de Mejora', 'Tipo Plan Integral', 'ESA Curso (PIDD)', 'Coordinadora (PIDD)', 'Estado Final (PIDD)'
    //         ];
    //         dataToExport.push(headers);

    //         teachers.forEach(teacher => {
    //             const hasCourses = teacher.cursos && teacher.cursos.length > 0;
    //             if (hasCourses) {
    //                 teacher.cursos.forEach(curso => {
    //                     const hasHorarios = curso.horarios && curso.horarios.length > 0;
    //                     const isPiddCourse = teacher.pidd && (teacher.pidd.codCurso === curso.codCurso || teacher.pidd.codCurso2 === curso.codCurso);

    //                     if (hasHorarios) {
    //                         curso.horarios.forEach(horario => {
    //                             const row = [
    //                                 teacher.idDocente || '', teacher.docente || '', teacher.RolColaborador || '', teacher.programa || '', teacher.modalidad || '',
    //                                 teacher.promedioEsa !== undefined ? formatEsa(teacher.promedioEsa) : '', teacher.estadoHistorico || '',
    //                                 teacher.especialistaDni || '', teacher.nombreEspecialista || 'No Asignado',
    //                                 curso.codCurso || '', curso.nombreCurso || '', curso.seccion || '', curso.periodo || '', curso.nrc || '', curso.metEdu || '',
    //                                 horario.dia || '', horario.hora || '', horario.campus || '', horario.aula || '',
    //                                 horario.fechaInicio ? new Date(horario.fechaInicio).toLocaleDateString('es-ES') : '',
    //                                 horario.fechaFin ? new Date(horario.fechaFin).toLocaleDateString('es-ES') : '',
    //                                 isPiddCourse ? 'Sí' : 'No',
    //                                 isPiddCourse ? (teacher.pidd.tipoPlanIntegral || '') : '',
    //                                 isPiddCourse ? (teacher.pidd.esaCurso !== undefined ? formatEsa(teacher.pidd.esaCurso) : '') : '',
    //                                 isPiddCourse ? (teacher.pidd.coordinadora || '') : '',
    //                                 isPiddCourse ? (teacher.pidd.estadoFinal || '') : ''
    //                             ];
    //                             dataToExport.push(row);
    //                         });
    //                     } else { // Curso sin horario
    //                         const row = [
    //                             teacher.idDocente || '', teacher.docente || '', teacher.RolColaborador || '', teacher.programa || '', teacher.modalidad || '',
    //                             teacher.promedioEsa !== undefined ? formatEsa(teacher.promedioEsa) : '', teacher.estadoHistorico || '',
    //                             teacher.especialistaDni || '', teacher.nombreEspecialista || 'No Asignado',
    //                             curso.codCurso || '', curso.nombreCurso || '', curso.seccion || '', curso.periodo || '', curso.nrc || '', curso.metEdu || '',
    //                             'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A',
    //                             isPiddCourse ? 'Sí' : 'No',
    //                             isPiddCourse ? (teacher.pidd.tipoPlanIntegral || '') : '',
    //                             isPiddCourse ? (teacher.pidd.esaCurso !== undefined ? formatEsa(teacher.pidd.esaCurso) : '') : '',
    //                             isPiddCourse ? (teacher.pidd.coordinadora || '') : '',
    //                             isPiddCourse ? (teacher.pidd.estadoFinal || '') : ''
    //                         ];
    //                         dataToExport.push(row);
    //                     }
    //                 });
    //             } else { // Docente sin cursos
    //                 const row = [
    //                     teacher.idDocente || '', teacher.docente || '', teacher.RolColaborador || '', teacher.programa || '', teacher.modalidad || '',
    //                     teacher.promedioEsa !== undefined ? formatEsa(teacher.promedioEsa) : '', teacher.estadoHistorico || '',
    //                     teacher.especialistaDni || '', teacher.nombreEspecialista || 'No Asignado',
    //                     'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A',
    //                     'No', '', '', '', ''
    //                 ];
    //                 dataToExport.push(row);
    //             }
    //         });

    //         const ws = XLSX.utils.aoa_to_sheet(dataToExport);
    //         const colWidths = headers.map((_, i) => ({
    //             wch: Math.max(...dataToExport.map(row => (row[i] ? String(row[i]).length : 0)), 15) + 2
    //         }));
    //         ws['!cols'] = colWidths;

    //         const wb = XLSX.utils.book_new();
    //         XLSX.utils.book_append_sheet(wb, ws, "Asignacion_Completa");
    //         XLSX.writeFile(wb, `Asignacion_Completa_${periodoAsignacion}_${new Date().toISOString().split('T')[0]}.xlsx`);
    //         setNotification({ type: 'success', title: 'Descarga Completa', message: 'El archivo de asignación se ha generado.' });

    //     } catch (err) {
    //         console.error("Error al descargar la asignación:", err);
    //         setNotification({ type: 'error', title: 'Error', message: 'No se pudo generar el archivo de asignación.' });
    //     }
    // };

    const handleDownloadAssignment = () => {
    // 1. Se mantiene la validación inicial. Es una buena práctica.
    if (teachers.length === 0) {
        setNotification({
            type: 'error',
            title: 'Sin Datos',
            message: 'No hay datos de asignación para descargar.'
        });
        return;
    }

    try {
        // 2. Construye la URL base de tu API.
        //    (Asegúrate de que esta sea la URL correcta para tu entorno)
        const apiUrl = 'http://localhost:3001/api/asignacion-especialista-docentes/exportar-excel';

        // 3. Añade los filtros necesarios como parámetros de consulta.
        //    El backend ya sabe cómo usarlos.
        const params = new URLSearchParams();
        if (periodoAsignacion) { // Usando la variable que ya tenías
            params.append('semestre', periodoAsignacion);
        }
        // Aquí podrías añadir otros filtros que tengas en tu UI
        // params.append('especialistaDni', filtroEspecialista);

        const downloadUrl = `${apiUrl}?${params.toString()}`;

        // 4. ¡Esta es la magia! Simplemente redirige a la URL.
        //    El navegador verá las cabeceras del backend e iniciará la descarga.
        window.location.href = downloadUrl;

        // Opcional: Notificar al usuario que la descarga ha comenzado.
        setNotification({
            type: 'info',
            title: 'Descarga Iniciada',
            message: 'El archivo de asignación se está generando...'
        });

    } catch (err) {
        console.error("Error al iniciar la descarga:", err);
        setNotification({
            type: 'error',
            title: 'Error',
            message: 'No se pudo iniciar la descarga del archivo.'
        });
    }
};

    return (
        <div className="bg-slate-100 font-sans min-h-screen p-4 sm:p-6 lg:p-8">
            {isGenerating && <LoadingOverlay title="Generando Asignación" message={generationStatus.message} progress={generationStatus.progress} hasError={generationStatus.error} />}
            {isUploadingProgramming && <LoadingOverlay title="Cargando Programación" message={uploadStatusMessageProgramming} progress={uploadProgressProgramming} hasError={false} />}
            {isUploadingEsa && <LoadingOverlay title="Cargando Datos ESA" message={uploadStatusMessageEsa} progress={uploadProgressEsa} hasError={false} />}
            {isUploadingReporte && <LoadingOverlay title="Cargando Reporte Único" message={uploadStatusMessageReporte} progress={uploadProgressReporte} hasError={false} />}
            {isUploadingPidd && <LoadingOverlay title="Cargando Plan Integral Docente" message={uploadStatusMessagePidd} progress={uploadProgressPidd} hasError={false} />}
            {isUploadingInduccion && <LoadingOverlay title="Cargando Inducción Docente" message={uploadStatusMessageInduccion} progress={uploadProgressInduccion} hasError={false} />}
            {downloadingType && <LoadingOverlay title="Descargando Colección" message={`Preparando el archivo para ${downloadingType}...`} progress={null} />}

            <ConfirmationModal
                isOpen={!!reportToDelete || !!programmingReportToDelete || !!esaReportToDelete || !!reporteToDelete || !!piddToDelete || !!induccionToDelete}
                onClose={() => { setReportToDelete(null); setProgrammingReportToDelete(null); setEsaReportToDelete(null); setReporteToDelete(null); setPiddToDelete(null); setInduccionToDelete(null); }}
                onConfirm={handleConfirmDelete}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar el reporte de carga del ${reportToDelete?.fechaCarga || programmingReportToDelete?.fechaCarga || esaReportToDelete?.fechaCarga || reporteToDelete?.fechaCarga || piddToDelete?.fechaCarga || induccionToDelete?.fechaCarga}? Esta acción no se puede deshacer.`}
                isProcessing={isProcessingDelete}
            />

            <div className="mx-auto">

                {currentView === 'list' ? (
                <>
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Gestión de Datos Académicos</h1>
                    <p className="text-lg text-gray-500 mt-1">Carga, busca, visualiza y genera las asignaciones de los colaboradores.</p>
                </header>

                {notification && <Notification type={notification.type} title={notification.title} message={notification.message} onDismiss={() => setNotification(null)} />}

                {/* --- SECCIÓN DE CARGA DE PLAN INTEGRAL DOCENTE (PIDD) --- */}
                <CollapsibleUploadSection
                    title="Carga de Plan Integral Docente (PIDD)"
                    icon={BookUser}
                    latestRecord={latestPiddReport}
                    isLoading={isPiddReportLoading}
                    typeLabel="PIDD"
                    isAnyProcessRunning={isAnyProcessRunning}
                    themeColor="orange"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="upload-pidd-semester" className="block text-sm font-medium text-gray-700">1. Semestre</label>
                                <select id="upload-pidd-semester" value={uploadPiddSemester} onChange={(e) => setUploadPiddSemester(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500">
                                    <option value="" disabled>-- Elija un semestre --</option>
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="upload-pidd-date" className="block text-sm font-medium text-gray-700">2. Fecha de Carga</label>
                                <input type="date" id="upload-pidd-date" value={uploadPiddDate} onChange={(e) => setUploadPiddDate(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                            </div>
                            <div>
                                <label htmlFor="file-upload-pidd" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-pidd" type="file" ref={piddFileInputRef} onChange={(e) => handleFileSelect(e, 'pidd')} accept=".xlsx, .xls" disabled={!uploadPiddSemester || !uploadPiddDate} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50" />
                            </div>
                        </div>
                        {parsedPiddFileData && (
                            <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para cargar:</p>
                                        <p className="text-sm text-gray-700">{uploadedPiddFileName} ({parsedPiddFileData.length} registros)</p>
                                    </div>
                                    <button onClick={() => resetPiddUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => handleGenericUpload('pidd')} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2" /> Cargar Plan Integral Docente
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-x-2 pt-2">
                            <button onClick={() => handleDownloadTemplate('pidd')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Download size={14} className="mr-2" /> Descargar Plantilla
                            </button>
                            <button onClick={() => handleDownloadCollection('pidd')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50">
                                <Download size={14} className="mr-2" /> Descargar Colección
                            </button>
                        </div>
                    </div>
                </CollapsibleUploadSection>

                {/* --- SECCIÓN DE CARGA DE REPORTE ÚNICO DOCENTE --- */}
                <CollapsibleUploadSection
                    title="Carga de Reporte Único Docente"
                    icon={FileText}
                    latestRecord={latestReporteReport}
                    isLoading={isReporteReportLoading}
                    typeLabel="Reporte Único"
                    isAnyProcessRunning={isAnyProcessRunning}
                    themeColor="teal"
                >
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="upload-reporte-semester" className="block text-sm font-medium text-gray-700">1. Semestre</label>
                                <select id="upload-reporte-semester" value={uploadReporteSemester} onChange={(e) => setUploadReporteSemester(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500">
                                    <option value="" disabled>-- Elija un semestre --</option>
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="upload-reporte-date" className="block text-sm font-medium text-gray-700">2. Fecha de Carga</label>
                                <input type="date" id="upload-reporte-date" value={uploadReporteDate} onChange={(e) => setUploadReporteDate(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" />
                            </div>
                            <div>
                                <label htmlFor="file-upload-reporte" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-reporte" type="file" ref={reporteFileInputRef} onChange={(e) => handleFileSelect(e, 'reporte')} accept=".xlsx, .xls" disabled={!uploadReporteSemester || !uploadReporteDate} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 disabled:opacity-50" />
                            </div>
                        </div>
                        {parsedReporteFileData && (
                             <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para cargar:</p>
                                        <p className="text-sm text-gray-700">{uploadedReporteFileName} ({parsedReporteFileData.length} registros)</p>
                                    </div>
                                    <button onClick={() => resetReporteUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => handleGenericUpload('reporte')} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2" /> Cargar Reporte Único
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-x-2 pt-2">
                            <button onClick={() => handleDownloadTemplate('reporte')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Download size={14} className="mr-2" /> Descargar Plantilla
                            </button>
                            <button onClick={() => handleDownloadCollection('reporte')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50">
                                <Download size={14} className="mr-2" /> Descargar Colección
                            </button>
                        </div>
                    </div>
                </CollapsibleUploadSection>

                {/* --- SECCIÓN DE CARGA DE DATOS ESA --- */}
                <CollapsibleUploadSection
                    title="Carga de Datos ESA"
                    icon={Star}
                    latestRecord={latestEsaReport}
                    isLoading={isEsaReportLoading}
                    typeLabel="ESA"
                    isAnyProcessRunning={isAnyProcessRunning}
                    themeColor="purple"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="upload-esa-semester" className="block text-sm font-medium text-gray-700">1. Semestre</label>
                                <select id="upload-esa-semester" value={uploadEsaSemester} onChange={(e) => setUploadEsaSemester(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500">
                                    <option value="" disabled>-- Elija un semestre --</option>
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="upload-esa-date" className="block text-sm font-medium text-gray-700">2. Fecha de Carga</label>
                                <input type="date" id="upload-esa-date" value={uploadEsaDate} onChange={(e) => setUploadEsaDate(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" />
                            </div>
                            <div>
                                <label htmlFor="file-upload-esa" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-esa" type="file" ref={esaFileInputRef} onChange={(e) => handleFileSelect(e, 'esa')} accept=".xlsx, .xls" disabled={!uploadEsaSemester || !uploadEsaDate} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50" />
                            </div>
                        </div>
                        {parsedEsaFileData && (
                            <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para cargar:</p>
                                        <p className="text-sm text-gray-700">{uploadedEsaFileName} ({parsedEsaFileData.length} registros)</p>
                                    </div>
                                    <button onClick={() => resetEsaUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => handleGenericUpload('esa')} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2" /> Cargar Datos ESA
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-x-2 pt-2">
                            <button onClick={() => handleDownloadTemplate('esa')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Download size={14} className="mr-2" /> Descargar Plantilla
                            </button>
                            <button onClick={() => handleDownloadCollection('esa')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                                <Download size={14} className="mr-2" /> Descargar Colección
                            </button>
                        </div>
                    </div>
                </CollapsibleUploadSection>

                {/* --- SECCIÓN DE CARGA DE PROGRAMACIÓN HORARIA --- */}
                <CollapsibleUploadSection
                    title="Carga de Programación Horaria"
                    icon={CalendarClock}
                    latestRecord={latestProgrammingReport}
                    isLoading={isProgrammingReportLoading}
                    typeLabel="Programación Horaria"
                    isAnyProcessRunning={isAnyProcessRunning}
                    themeColor="indigo"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="upload-programming-semester" className="block text-sm font-medium text-gray-700">1. Semestre</label>
                                <select id="upload-programming-semester" value={uploadProgrammingSemester} onChange={(e) => setUploadProgrammingSemester(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="" disabled>-- Elija un semestre --</option>
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="upload-programming-date" className="block text-sm font-medium text-gray-700">2. Fecha de Programación</label>
                                <input type="date" id="upload-programming-date" value={uploadProgrammingDate} onChange={(e) => setUploadProgrammingDate(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label htmlFor="file-upload-programming" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-programming" type="file" ref={programmingFileInputRef} onChange={(e) => handleFileSelect(e, 'programming')} accept=".xlsx, .xls" disabled={!uploadProgrammingSemester || !uploadProgrammingDate} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50" />
                            </div>
                        </div>
                        {parsedProgrammingFileData && (
                            <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para cargar:</p>
                                        <p className="text-sm text-gray-700">{uploadedProgrammingFileName} ({parsedProgrammingFileData.length} registros)</p>
                                    </div>
                                    <button onClick={() => resetProgrammingUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => handleGenericUpload('programming')} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2" /> Cargar Datos de Programación
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-x-2 pt-2">
                            <button onClick={() => handleDownloadTemplate('programming')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Download size={14} className="mr-2" /> Descargar Plantilla
                            </button>
                            <button onClick={() => handleDownloadCollection('programming')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                                <Download size={14} className="mr-2" /> Descargar Colección
                            </button>
                        </div>
                    </div>
                </CollapsibleUploadSection>
                
                {/* --- SECCIÓN DE CARGA DE INDUCCION DOCENTE (ACTUALIZADA) --- */}
                <CollapsibleUploadSection
                    title="Carga de Inducción Docente"
                    icon={ListChecks}
                    latestRecord={latestInduccionReport}
                    isLoading={isInduccionReportLoading}
                    typeLabel="Inducción Docente"
                    isAnyProcessRunning={isAnyProcessRunning}
                    themeColor="gray"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="upload-induccion-semester" className="block text-sm font-medium text-gray-700">1. Semestre</label>
                                <select id="upload-induccion-semester" value={uploadInduccionSemester} onChange={(e) => setUploadInduccionSemester(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500">
                                    <option value="" disabled>-- Elija un semestre --</option>
                                    {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="upload-induccion-date" className="block text-sm font-medium text-gray-700">2. Fecha de Carga</label>
                                <input type="date" id="upload-induccion-date" value={uploadInduccionDate} onChange={(e) => setUploadInduccionDate(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 rounded-lg focus:ring-gray-500 focus:border-gray-500" />
                            </div>
                            <div>
                                <label htmlFor="file-upload-induccion" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-induccion" type="file" ref={induccionFileInputRef} onChange={(e) => handleFileSelect(e, 'induccion')} accept=".xlsx, .xls" disabled={!uploadInduccionSemester || !uploadInduccionDate} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 disabled:opacity-50" />
                            </div>
                        </div>
                        {parsedInduccionFileData && (
                            <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para cargar:</p>
                                        <p className="text-sm text-gray-700">{uploadedInduccionFileName} ({parsedInduccionFileData.length} registros)</p>
                                    </div>
                                    <button onClick={() => resetInduccionUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={() => handleGenericUpload('induccion')} className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2" /> Cargar Inducción Docente
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-x-2 pt-2">
                            <button onClick={() => handleDownloadTemplate('induccion')} className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                <Download size={14} className="mr-2" /> Descargar Plantilla
                            </button>
                            <button onClick={() => handleDownloadCollection('induccion')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50">
                                <Download size={14} className="mr-2" /> Descargar Colección
                            </button>
                        </div>
                    </div>
                </CollapsibleUploadSection>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Generar Asignación de Especialistas
                        </h2>
                        <div className="flex-shrink-0 max-w-md">
                            <LatestUploadInfo latestRecord={latestAssignmentReport} isLoading={isAssignmentReportLoading} typeLabel="Asignaciones" />
                        </div>
                    </div>
                    <fieldset disabled={isAnyProcessRunning} className="space-y-6 pt-4 border-t">
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
                                className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center h-full"
                            >
                                GENERAR ASIGNACIÓN
                            </button>
                        </div>
                    </fieldset>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-1">
                        <h2 className="text-xl font-bold text-gray-800">Buscar Docentes</h2>
                        <button
                            onClick={handleDownloadAssignment}
                            disabled={isAnyProcessRunning || teachers.length === 0}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <Download size={16} className="mr-2" />
                            Descargar Asignación
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Filtra la tabla de resultados de la última asignación generada.
                    </p>
                    <fieldset disabled={isAnyProcessRunning} className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, ID de docente o especialista..."
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Estado del Docente</label>
                                <select id="status-filter" value={statusFilter} onChange={e => handleFilterChange(setStatusFilter, e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Todos">Todos</option>
                                    <option value="NUEVO">Con Cambio en Programación</option>
                                    <option value="MODIFICADO">Modificado Manualmente</option>
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
                                    <th scope="col" className="px-6 py-3">Programa</th>
                                    <th scope="col" className="px-6 py-3">Modalidad</th>
                                    <th scope="col" className="px-6 py-3">Especialista Asignado</th>
                                    <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Ver Detalles</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTeachers.map((teacher) => {
                                    const rowStyles = getStatusStyles(teacher.estadoHistorico);
                                    const teacherId = teacher._id?.$oid || teacher.idDocente;

                                    return (
                                        <tr key={teacherId} className={`border-b hover:bg-gray-50 ${rowStyles.border}`}>
                                            <td className={`px-6 py-4 font-medium text-gray-900 whitespace-nowrap`}>
                                                <div className="flex items-center gap-2">
                                                    {teacher.estadoHistorico && <div className={`w-2.5 h-2.5 rounded-full ${teacher.estadoHistorico === 'NUEVO' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>}
                                                    <span>{teacher.docente || 'Nombre no disponible'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{teacher.idDocente}</td>
                                            <td className="px-6 py-4">{teacher.programa}</td>
                                            <td className="px-6 py-4">{teacher.modalidad}</td>
                                            <td className="px-6 py-4">
                                                {teacher.nombreEspecialista || <span className="text-gray-400 italic">No Asignado</span>}
                                            </td>
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
                            disabled={currentPage === 1 || isAnyProcessRunning}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isAnyProcessRunning}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
                </>
                ) : (
            <Rubrica 
                onCancel={onBackToList} 
                onSave={onSave}
                // initialData={initialData} 
                rubricTemplate={selectedTemplate}
                isLoading={isLoading}
                tempTeacherData={teacher}
                tempCursoData={curso}
                tempHorarioData={horario}
            />
                        
                )}
            </div>

            {selectedTeacher && (
                <TeacherDetailModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} onRegistrarRubrica={onRegistrarRubrica} />
            )}
        </div>
    );
}
