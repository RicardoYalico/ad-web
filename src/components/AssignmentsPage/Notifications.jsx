import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';
import React from 'react';

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


export default Notifications;