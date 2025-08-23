import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Edit, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';

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

const StatusBadge = ({ status }) => {
    const baseClasses = "text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full";
    const statusInfo = {
        'NUEVO': "bg-green-200 text-green-800",
        'MODIFICADO': "bg-yellow-200 text-yellow-800",
        'DEFAULT': "bg-gray-200 text-gray-800"
    };
    const classes = `${baseClasses} ${statusInfo[status] || statusInfo['DEFAULT']}`;
    return <span className={classes}>{status}</span>;
};

const HorarioCardComponent = ({teacher, curso, horario, onRegistrarRubrica, onClose}) => {

    
    // Función para formatear fechas en formato DD/MM/AAAA
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        } catch (e) {
            console.error("Error al formatear la fecha:", e);
            return 'Fecha inválida';
        }
    };

    return (
        // Contenedor principal de la tarjeta: fondo claro, borde definido y sombra para destacar
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-md overflow-hidden mt-4 transition-all duration-300 hover:shadow-lg hover:border-blue-300">
            <div className="flex flex-col md:flex-row">

                {/* --- SECCIÓN IZQUIERDA: INFORMACIÓN PRINCIPAL DEL HORARIO --- */}
                <div className="p-5 flex-grow">
                    {/* Día y Hora: Información más relevante con texto grande */}
                    <div className="flex items-center gap-4 mb-4">
                        <Clock className="text-blue-500" size={28} />
                        <div>
                            <p className="text-lg font-bold text-gray-800">{horario.dia || 'Día no especificado'}</p>
                            <p className="text-base text-gray-600">{horario.hora || 'Hora no especificada'}</p>
                        </div>
                    </div>

                    {/* Ubicación: Campus y Aula */}
                    <div className="flex items-center gap-4 mb-4">
                        <MapPin className="text-green-600" size={28} />
                        <div>
                            <p className="font-semibold text-gray-700">{horario.campus || 'Campus no especificado'}</p>
                            <p className="text-sm text-gray-500">Aula: {horario.aula || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Periodo del curso */}
                    <div className="flex items-center gap-4">
                        <Calendar className="text-red-500" size={28} />
                        <div>
                            <p className="font-semibold text-gray-700">Periodo del Curso</p>
                            <p className="text-sm text-gray-500">{formatDate(horario.fechaInicio)} - {formatDate(horario.fechaFin)}</p>
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN DERECHA: ESTADO Y ACCIONES --- */}
                <div className="bg-blue-50 p-5 flex flex-col justify-center items-center gap-4 md:w-1/3 border-t-2 md:border-t-0 md:border-l-2 border-gray-200">
                    
                    {/* Información de Acompañamiento */}
                    {horario.acompanamiento && (
                        <div className="flex items-center gap-2 bg-blue-100 text-blue-800 py-1.5 px-3 rounded-full text-sm font-medium">
                            <UserCheck size={16} />
                            <span>{horario.acompanamiento.nombreEspecialista}</span>
                        </div>
                    )}
                    
                    {/* Estado del Horario */}
                    {horario.estadoHistorico && <StatusBadge status={horario.estadoHistorico} />}

                    {/* Botón de Acción Principal: Registrar Rúbrica */}
                    <button
                        onClick={() => { onRegistrarRubrica("687fd14a4f377b9b2ce3457a", teacher, curso, horario); onClose(); }}
                        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-base py-3 px-4 rounded-xl shadow-lg transform transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        title="Hacer clic para registrar la rúbrica de este horario"
                    >
                        <Edit size={20} />
                        Registrar Rúbrica
                    </button>

                    
                </div>

            </div>
        </div>
    );
};

export default HorarioCardComponent;