import React, { useState, useEffect, useMemo } from 'react';
import { Mail, BookOpen, Calendar, Building, TrendingUp, Star, Search, X, Shield, Tag, Briefcase, AlertTriangle, ChevronLeft, ChevronRight, Clock, Loader, History, ChevronDown, Trash2, CheckCircle, UserCheck, MapPin } from 'lucide-react';

const formatEsa = (value) => {
    const num = parseFloat(value);
    if (value === null || value === undefined || isNaN(num)) {
        return "SIN ESA";
    }
    return `${(num * 100).toFixed(2)}%`;
};


const InfoPill = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center bg-slate-200/60 p-3 rounded-lg text-center">
        <div className="flex items-center text-xs text-gray-500 font-semibold mb-1">
            {icon}
            <span className="ml-1.5">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{value || 'N/A'}</span>
    </div>
);

export default InfoPill;