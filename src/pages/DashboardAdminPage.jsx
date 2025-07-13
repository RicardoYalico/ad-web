import React, { useState, useEffect, useMemo } from 'react';
import { User, CalendarDays, RefreshCw, X, AlertTriangle, Clock, Loader, History, CheckCircle, LayoutDashboard } from 'lucide-react';

// --- Constantes de API ---
// URLs base de las APIs. Las consultas se construirán dinámicamente.
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
      "especialistaDni": "9977858",
      "nombreEspecialista": "GOMEZ SANCHEZ, PEDRO",
      "fechaHoraEjecucion": "2025-06-25T17:18:14.623Z"
    }
  ]
};

// --- Sub-Components ---

/**
 * Tarjeta para mostrar una estadística clave en el encabezado.
 */
const HeaderStatCard = ({ icon, title, value, bgColor, textColor }) => (
    <div className={`flex items-center p-4 rounded-lg shadow-sm ${bgColor}`}>
        <div className="p-3 rounded-lg bg-white bg-opacity-50">
            {icon}
        </div>
        <div className="ml-4">
            <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
    </div>
);


/**
 * Componente para embeber el dashboard de Power BI.
 */
const PowerBiDashboard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex items-center mb-4">
            <LayoutDashboard className="text-blue-600 mr-3" size={24}/>
            <h2 className="text-xl font-bold text-gray-800">Dashboard de Seguimiento</h2>
        </div>
        <div className="w-full h-[600px]">
             <iframe
                title="Dashboard Acompañamiento Docente - 2025-1 VF"
                className="w-full h-full border-0"
                src="https://app.powerbi.com/view?r=eyJrIjoiM2VhOTY1ZjctMWU0OC00Y2E1LThmMTYtYjU2Y2RlN2U0ZTA3IiwidCI6ImFlNTQ0YTU3LWFlY2ItNGJmOS04MjhhLTViNTIwNzMyYjExMCJ9"
                frameBorder="0"
                allowFullScreen={true}
            ></iframe>
        </div>
    </div>
);


/**
 * Componente para mostrar notificaciones de historial de cambios.
 */
const Notifications = ({ history, onDismiss, isLoading }) => {
    // Muestra un loader mientras se carga el historial
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex items-center justify-center min-h-[100px]">
                <Loader className="animate-spin h-6 w-6 text-blue-600 mr-3" />
                <span className="text-gray-500">Cargando historial de cambios...</span>
            </div>
        );
    }

    // No renderiza nada si no hay historial para mostrar
    if (!history || history.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                 <div className="flex items-center mb-4">
                     <History className="text-gray-600 mr-3" size={24}/>
                     <h2 className="text-xl font-bold text-gray-800">Historial de Cambios Recientes</h2>
                 </div>
                <p className="text-center text-gray-500 py-4">No hay cambios recientes para mostrar.</p>
            </div>
        );
    }

    const getNotificationInfo = (item) => {
        const { docente, detalleAnterior, nombreEspecialista, estadoCambio } = item;
        
        switch(estadoCambio) {
            case 'REASIGNADO':
                return {
                    icon: <AlertTriangle className="text-orange-500" size={20} />,
                    message: (
                        <span>
                            El docente <strong className="font-semibold">{docente}</strong> fue reasignado de <strong>{detalleAnterior?.nombreEspecialista || 'N/A'}</strong> a <strong className="font-semibold">{nombreEspecialista || 'N/A'}</strong>.
                        </span>
                    ),
                    bgColor: 'bg-orange-50/70 border-orange-200'
                };
            case 'NUEVO':
                 return {
                    icon: <CheckCircle className="text-green-500" size={20} />,
                    message: (
                        <span>
                            Se creó una nueva asignación para el docente <strong className="font-semibold">{docente}</strong> con el especialista <strong className="font-semibold">{nombreEspecialista || 'N/A'}</strong>.
                        </span>
                    ),
                    bgColor: 'bg-green-50/70 border-green-200'
                };
            case 'MODIFICADO':
                 return {
                    icon: <History className="text-blue-500" size={20} />,
                    message: (
                        <span>
                            La asignación del docente <strong className="font-semibold">{docente}</strong> (especialista: <strong className="font-semibold">{nombreEspecialista || 'N/A'}</strong>) fue modificada.
                        </span>
                    ),
                    bgColor: 'bg-blue-50/70 border-blue-200'
                };
            default:
                return {
                    icon: <History className="text-gray-500" size={20} />,
                    message: `Hubo una actualización para el docente ${docente}. Estado: ${estadoCambio || 'Desconocido'}.`,
                    bgColor: 'bg-gray-50/70 border-gray-200'
                };
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center mb-4">
                <History className="text-gray-600 mr-3" size={24}/>
                <h2 className="text-xl font-bold text-gray-800">Historial de Cambios Recientes</h2>
            </div>
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
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

// --- Panel de Control de Administración General ---
const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalTeachers: 0,
        currentSemester: 'N/A',
        executionDate: null,
    });
    const [history, setHistory] = useState([]);
    const [dismissedNotifications, setDismissedNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch de asignaciones (para estadísticas)
            const assignmentsResponse = await fetch(`${API_URL}?latest=true`);
            if (!assignmentsResponse.ok) console.error(`Error en API de asignaciones: ${assignmentsResponse.status}`);
            const assignmentsData = await assignmentsResponse.json();
            let assignments = assignmentsData.data || [];

             if (assignments.length === 0) {
                 // Si la API no devuelve datos, usar fallback
                 assignments = initialApiData.data || [];
             }

            if (assignments.length > 0) {
                setStats({
                    totalTeachers: assignments.length,
                    currentSemester: assignments[0].semestre || 'N/A',
                    executionDate: assignments[0].fechaHoraEjecucion || null,
                });
            }

            // Fetch del historial de cambios general
            const historyResponse = await fetch(HISTORY_API_URL);
            if (!historyResponse.ok) console.error(`Error en API de historial: ${historyResponse.status}`);
            const historyData = await historyResponse.json();
            setHistory(historyData || []);

        } catch (error) {
            console.error("Error al cargar los datos del panel:", error);
            // Fallback en caso de error de red o de parseo
            const fallbackAssignments = initialApiData.data || [];
            if (fallbackAssignments.length > 0) {
                setStats({
                    totalTeachers: fallbackAssignments.length,
                    currentSemester: fallbackAssignments[0].semestre || 'N/A',
                    executionDate: fallbackAssignments[0].fechaHoraEjecucion || null,
                });
            }
            setHistory([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const statsCards = useMemo(() => {
        const lastUpdated = stats.executionDate
          ? new Date(stats.executionDate).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            })
          : 'N/A';

        return [
            { id: 1, title: "Semestre", value: stats.currentSemester, icon: <CalendarDays className="w-8 h-8 text-teal-500" />, bgColor: "bg-teal-100", textColor: "text-teal-800" },
            { id: 2, title: "Total de Docentes Asignados", value: stats.totalTeachers, icon: <User className="w-8 h-8 text-indigo-500" />, bgColor: "bg-indigo-100", textColor: "text-indigo-800" },
            { id: 3, title: "Última Actualización", value: lastUpdated, icon: <RefreshCw className="w-8 h-8 text-rose-500" />, bgColor: "bg-rose-100", textColor: "text-rose-800" },
        ];
    }, [stats]);
    
    const visibleHistory = useMemo(() => {
        // Ordena por fecha (más nuevo primero) y filtra los descartados.
        return history
            .sort((a, b) => new Date(b.createdAt || b.fechaHoraEjecucion) - new Date(a.createdAt || a.fechaHoraEjecucion))
            .filter(item => !dismissedNotifications.includes(item._id));
    }, [history, dismissedNotifications]);

    const handleDismissNotification = (id) => {
        setDismissedNotifications(prev => [...prev, id]);
    };

    return (
        <div className="bg-slate-100 font-sans min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="w-full">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">Panel de Administración General</h1>
                    <p className="text-lg text-gray-500 mt-1">Resumen de las asignaciones de docentes, indicadores clave y registro de cambios recientes.</p>
                </header>

                {isLoading ? (
                     <div className="flex justify-center items-center h-40">
                         <Loader className="animate-spin h-8 w-8 text-blue-600 mr-3" />
                         <span className="text-gray-600 font-medium">Cargando resumen...</span>
                     </div>
                ) : (
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
                )}
                
                <div>
                    <PowerBiDashboard />
                    {/* <Notifications 
                        history={visibleHistory}
                        onDismiss={handleDismissNotification}
                        isLoading={isLoading}
                    /> */}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
