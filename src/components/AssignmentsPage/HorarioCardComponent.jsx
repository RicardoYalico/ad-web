import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';

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

const HorarioCardComponent = ({ horario }) => {
    const styles = getStatusStyles(horario.estadoHistorico);
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return 'Fecha inválida'; }
    };
    return (
        <div className={`border-t border-gray-200 mt-3 pt-3 p-2 rounded-md ${styles.border} relative`}>
            {horario.acompanamiento && (
                <div className="absolute top-2.5 right-2" title={`Acompañamiento: ${horario.acompanamiento.nombreEspecialista} (${horario.acompanamiento.estado})`}>
                    <UserCheck className="text-blue-600" size={18} />
                </div>
            )}
            {horario.estadoHistorico && (
                <div className="absolute top-9 right-2">
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

export default HorarioCardComponent;