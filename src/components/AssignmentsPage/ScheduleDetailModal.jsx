import React from 'react';
import { X } from 'lucide-react';
import StatusBadge from './StatusBadge';

const formatEsa = (value) => {
    const num = parseFloat(value);
    if (value === null || value === undefined || isNaN(num)) {
        return "SIN ESA";
    }
    return `${(num * 100).toFixed(2)}%`;
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

export default ScheduleDetailModal;