import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';
import InfoPill from './InfoPill'; // Asegúrate de que la ruta sea correcta

const formatEsa = (value) => {
    const num = parseFloat(value);
    if (value === null || value === undefined || isNaN(num)) {
        return "SIN ESA";
    }
    return `${(num * 100).toFixed(2)}%`;
};

const PiddCourseCard = ({ piddData }) => (
    <div className="bg-red-50 border-2 border-red-300 p-6 rounded-2xl shadow-md mb-6">
        <div className="flex items-center mb-4">
            {/* El ícono de alerta ahora es de un rojo intenso */}
            <AlertTriangle className="text-red-600 mr-3" size={24} />
            {/* El título usa un rojo oscuro para máxima legibilidad */}
            <h4 className="text-xl font-bold text-red-800">{piddData.nombreCurso}</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Los InfoPills ahora usarán la paleta roja que definimos arriba */}
            <InfoPill icon={<Tag size={14} />} label="Cód. Curso" value={piddData.codCurso} />
            <InfoPill icon={<TrendingUp size={14} />} label="ESA Curso" value={formatEsa(piddData.esaCurso)} />
            <InfoPill icon={<Star size={14} />} label="Rúbrica Curso" value={piddData.rubricaCurso || 'N/A'} />
            <InfoPill icon={<Briefcase size={14} />} label="Dispersión" value={piddData.dispersionCurso || 'N/A'} />
        </div>
    </div>
);

export default PiddCourseCard;