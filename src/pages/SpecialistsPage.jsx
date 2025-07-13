import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, CalendarDays, ListChecks, AlertTriangle, Loader2, PlusCircle, Edit3, Trash2, Save, Eye, XCircle, ChevronDown, ChevronUp, Briefcase, Home, UsersRound, SlidersHorizontal, UserCheck, Info, Sparkles } from 'lucide-react';

// --- CONSTANTES Y HELPERS GLOBALES ---
const DIAS_SEMANA_ORDEN = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
const CALENDAR_TIME_SLOTS_START_HOUR = 7;
const CALENDAR_TIME_SLOTS_END_HOUR = 22;
const PREVIEW_TIME_SLOTS_COUNT = (CALENDAR_TIME_SLOTS_END_HOUR - CALENDAR_TIME_SLOTS_START_HOUR) * 2;

const calendarTimeLabels = Array.from({ length: PREVIEW_TIME_SLOTS_COUNT }, (_, i) => {
    const currentHour = CALENDAR_TIME_SLOTS_START_HOUR + Math.floor(i / 2);
    const currentMinute = (i % 2) * 30;
    return `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
});

const timeStringToTotalMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return -1;
    const cleanedTime = timeStr.replace(':', '').trim();
    
    let hours, minutes;
    if (cleanedTime.length === 3) {
        hours = parseInt(cleanedTime.substring(0, 1), 10);
        minutes = parseInt(cleanedTime.substring(1, 3), 10);
    } else if (cleanedTime.length === 4) {
        hours = parseInt(cleanedTime.substring(0, 2), 10);
        minutes = parseInt(cleanedTime.substring(2, 4), 10);
    } else {
        return -1;
    }

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return -1;
    }
    return hours * 60 + minutes;
};

const formatFranja = (franja) => {
    if (!franja || typeof franja !== 'string' || !franja.includes('-')) return franja;

    const formatTime = (timeStr) => {
        const cleaned = timeStr.replace(':', '').padStart(4, '0');
        if (cleaned.length === 4) {
            return `${cleaned.substring(0, 2)}:${cleaned.substring(2, 4)}`;
        }
        return timeStr;
    };

    const parts = franja.split('-').map(part => part.trim());
    if (parts.length === 2) {
        return `${formatTime(parts[0])} - ${formatTime(parts[1])}`;
    }
    return franja;
};


// --- COMPONENTES ---

const EditAvailabilityModal = ({ isOpen, onClose, record, onSave, onDelete }) => {
    const [editableRecord, setEditableRecord] = useState(null);
    const [franjaInicio, setFranjaInicio] = useState('');
    const [franjaFin, setFranjaFin] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (record) {
            setEditableRecord({ ...record });
            setModalError('');
            if (record.franja && record.franja.includes('-')) {
                const parts = record.franja.split('-').map(s => s.trim().replace(':', ''));
                setFranjaInicio(parts[0]);
                setFranjaFin(parts[1]);
            } else {
                setFranjaInicio('');
                setFranjaFin('');
            }
        }
    }, [record]);

    if (!isOpen || !editableRecord) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (name === "franjaInicio") {
            setFranjaInicio(value);
        } else if (name === "franjaFin") {
            setFranjaFin(value);
        } else {
            setEditableRecord(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
        }
    };

    const handleSave = () => {
        setModalError('');
        const inicioMinutes = timeStringToTotalMinutes(franjaInicio);
        const finMinutes = timeStringToTotalMinutes(franjaFin);

        if (inicioMinutes === -1 || finMinutes === -1) {
            setModalError("Formato de hora inválido. Use HHMM o HMM.");
            return;
        }
        if (inicioMinutes >= finMinutes) {
            setModalError("La hora de inicio debe ser anterior a la hora de fin.");
            return;
        }
        
        const updatedRecordWithFranja = { 
            ...editableRecord, 
            franja: `${franjaInicio.replace(':', '')}-${franjaFin.replace(':', '')}`
        };
        onSave(updatedRecordWithFranja);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[70] p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{String(editableRecord.id).startsWith('draft_') ? "Añadir Disponibilidad" : "Editar Disponibilidad"}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle size={24}/></button>
                </div>
                
                {modalError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">
                        {modalError}
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-sm"><strong>Día:</strong> {editableRecord.dia}</p>
                     <div className="grid grid-cols-2 gap-3">
                         <div>
                             <label htmlFor="edit-avail-franjaInicio" className="block text-xs font-medium text-gray-700">Hora Inicio (HHMM)*</label>
                             <input type="text" id="edit-avail-franjaInicio" name="franjaInicio" value={franjaInicio} onChange={handleChange} placeholder="0800" className="mt-1 input-style py-2"/>
                         </div>
                         <div>
                             <label htmlFor="edit-avail-franjaFin" className="block text-xs font-medium text-gray-700">Hora Fin (HHMM)*</label>
                             <input type="text" id="edit-avail-franjaFin" name="franjaFin" value={franjaFin} onChange={handleChange} placeholder="1030" className="mt-1 input-style py-2"/>
                         </div>
                     </div>
                    <div>
                        <label htmlFor="edit-avail-sede" className="block text-xs font-medium text-gray-700">Sede*</label>
                        <input type="text" id="edit-avail-sede" name="sede1DePreferenciaPresencial" value={editableRecord.sede1DePreferenciaPresencial} onChange={handleChange} className="mt-1 input-style py-2"/>
                    </div>
                    <div>
                        <label htmlFor="edit-avail-turno" className="block text-xs font-medium text-gray-700">Turno</label>
                        <select id="edit-avail-turno" name="turno" value={editableRecord.turno} onChange={handleChange} className="mt-1 select-style py-2">
                            <option value="">Seleccione</option><option value="MAÑANA">MAÑANA</option><option value="TARDE">TARDE</option><option value="NOCHE">NOCHE</option>
                        </select>
                    </div>
                     <div>
                         <label htmlFor="edit-avail-hpres" className="block text-xs font-medium text-gray-700">Horas Presencial (ej: 2.5)</label>
                         <input type="number" id="edit-avail-hpres" name="horasDisponiblesParaRealizarAcompaniamientoPresencial" value={editableRecord.horasDisponiblesParaRealizarAcompaniamientoPresencial} onChange={handleChange} min="0" step="0.5" className="mt-1 input-style py-2"/>
                     </div>
                    <div>
                        <label htmlFor="edit-avail-hrem" className="block text-xs font-medium text-gray-700">Horas Remoto (ej: 1.5)</label>
                        <input type="number" id="edit-avail-hrem" name="horasDisponiblesParaRealizarAcompaniamientoRemoto" value={editableRecord.horasDisponiblesParaRealizarAcompaniamientoRemoto} onChange={handleChange} min="0" step="0.5" className="mt-1 input-style py-2"/>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                        <button onClick={() => {onDelete(editableRecord.id); onClose();}} className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md">Eliminar</button>
                        <div className="flex space-x-3">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancelar</button>
                            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GeminiAnalysis = ({ teacher, records }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState('');

    const handleAnalysis = async () => {
        setIsLoading(true);
        setAnalysis('');
        setError('');

        const scheduleSummary = records.map(r => `- ${r.dia}: ${formatFranja(r.franja)} (Presencial: ${r.horasDisponiblesParaRealizarAcompaniamientoPresencial}h, Remoto: ${r.horasDisponiblesParaRealizarAcompaniamientoRemoto}h)`).join('\n');

        const prompt = `
            Eres un asistente experto en planificación de horarios.
            Analiza la siguiente información para el especialista ${teacher.apellidosNombresCompletos} y proporciona un resumen y recomendaciones.

            Contexto:
            - Preferencias de horario declaradas por el especialista: "${teacher.preferenciaHorarios}"
            - Disponibilidad registrada actualmente en el sistema:
            ${scheduleSummary.length > 0 ? scheduleSummary : "No hay disponibilidad registrada."}

            Análisis requerido:
            1.  **Resumen Breve:** Compara las preferencias con la disponibilidad registrada.
            2.  **Inconsistencias:** Señala si hay bloques de disponibilidad que no coinciden con sus preferencias (ej. registró disponibilidad en un día que dijo no poder).
            3.  **Sugerencias de Optimización:** Basado en sus preferencias, sugiere dónde podría añadir más horas o si algún bloque actual podría ser ajustado para un mejor balance.
            4.  **Formato:** Responde en español, de forma concisa y clara, usando Markdown para el formato (listas, negritas). No uses títulos para las secciones.
        `;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Error de API: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setAnalysis(text);
            } else {
                throw new Error("La respuesta de la API no contiene el formato esperado.");
            }

        } catch (err) {
            setError('No se pudo obtener el análisis. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
                <h4 className="text-md font-semibold text-gray-700 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500"/>
                    Análisis con IA
                </h4>
                <button 
                    onClick={handleAnalysis} 
                    disabled={isLoading}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Analizar Horario'}
                </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            {analysis && (
                <div 
                    className="mt-3 p-3 bg-purple-50/50 border border-purple-200 rounded-lg text-sm text-gray-800 space-y-2" 
                    dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
            )}
        </div>
    );
};


const WeeklyScheduleModal = ({ isOpen, onClose, teacher, records, onEditSlot, onEmptyCellClick }) => {
    if (!isOpen || !teacher) return null;
    
    const teacherRecords = useMemo(() => {
        if (!teacher) return [];
        return records.filter(r => r.userId === teacher.id);
    }, [teacher, records]);

    const { totalWeekPresencial, totalWeekRemoto } = useMemo(() => {
        return teacherRecords.reduce((totals, record) => {
            totals.totalWeekPresencial += Number(record.horasDisponiblesParaRealizarAcompaniamientoPresencial) || 0;
            totals.totalWeekRemoto += Number(record.horasDisponiblesParaRealizarAcompaniamientoRemoto) || 0;
            return totals;
        }, { totalWeekPresencial: 0, totalWeekRemoto: 0 });
    }, [teacherRecords]);

    const teacherSchedule = useMemo(() => {
        const schedule = {};
        DIAS_SEMANA_ORDEN.forEach(dia => schedule[dia] = []);
        teacherRecords.forEach(r => {
            const diaKey = (r.dia || '').toUpperCase();
            if (schedule[diaKey]) {
                schedule[diaKey].push(r);
            }
        });
        return schedule;
    }, [teacherRecords]);

    const timeToRowIndex = (timeStr) => {    
        const totalMins = timeStringToTotalMinutes(timeStr);
        if (totalMins === -1) return -1;
        const minutesFromCalendarStart = totalMins - (CALENDAR_TIME_SLOTS_START_HOUR * 60);
        return Math.max(0, Math.floor(minutesFromCalendarStart / 30));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center p-4 z-50 transition-opacity duration-300 ease-in-out" style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }} onClick={onClose}>
            <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out" style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-20px)' }} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-300">
                    <div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-700">Horario Semanal: <span className="text-teal-600">{teacher.apellidosNombresCompletos}</span></h3>
                        <p className="text-sm sm:text-base text-gray-600">DNI: {teacher.dni}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Preferencias: {teacher.preferenciaHorarios}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100 flex-shrink-0"><XCircle size={window.innerWidth < 640 ? 28 : 32} /></button>
                </div>
                <div className="mb-3 sm:mb-4 flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-sm sm:text-base">
                    <p className="font-semibold text-gray-700">Total Horas Disponibles:</p>
                    <span className="text-green-700 font-medium flex items-center"><Briefcase size={window.innerWidth < 640 ? 16 : 18} className="mr-1.5"/> Presencial: {totalWeekPresencial}h</span>
                    <span className="text-blue-700 font-medium flex items-center"><Home size={window.innerWidth < 640 ? 16 : 18} className="mr-1.5"/> Remoto: {totalWeekRemoto}h</span>
                </div>
                <div className="flex-grow overflow-auto pr-1 custom-scrollbar">
                    <div className="flex">
                        <div className="w-16 sm:w-20 shrink-0 pt-[2.5rem] sm:pt-[2.75rem]">
                            {calendarTimeLabels.map(label => (<div key={`time-${label}`} className="h-10 flex items-center justify-end pr-1 text-xs text-gray-500 border-r border-gray-200">{label}</div>))}
                        </div>
                        <div className="flex-grow grid grid-cols-7 gap-px bg-gray-200 border-t border-l border-gray-200 rounded-tr-lg">
                            {DIAS_SEMANA_ORDEN.map(dia => (<div key={`header-day-${dia}`} className="h-10 bg-gray-100 p-1.5 text-center text-xs sm:text-sm font-semibold text-gray-600 capitalize border-r border-b border-gray-200 flex items-center justify-center">{dia.substring(0,3)}</div>))}
                            {DIAS_SEMANA_ORDEN.map((dia) => (
                                <div key={`${dia}-slots-col`} className="relative bg-white border-r border-b border-gray-200">
                                    {calendarTimeLabels.map((timeLabel, timeIdx) => (<div key={`bg-line-${dia}-${timeIdx}`} className="h-10 border-b border-gray-100 cursor-pointer hover:bg-teal-50" onClick={(e) => { e.stopPropagation(); onEmptyCellClick(dia, timeLabel); }}></div>))}
                                    {(teacherSchedule[dia] || []).map(slot => {
                                        if (!slot.franja || !slot.franja.includes('-')) return null;
                                        const [startStr, endStr] = slot.franja.split('-').map(s => s.trim());
                                        const startRow = timeToRowIndex(startStr); const endRow = timeToRowIndex(endStr);
                                        if (startRow === -1 || endRow === -1 || startRow >= endRow) return null;
                                        const durationInSlots = endRow - startRow; const slotHeightPx = 40; 
                                        const topPositionPx = startRow * slotHeightPx; const blockHeightPx = durationInSlots * slotHeightPx;
                                        const presencialHoras = Number(slot.horasDisponiblesParaRealizarAcompaniamientoPresencial) || 0; const remotoHoras = Number(slot.horasDisponiblesParaRealizarAcompaniamientoRemoto) || 0;
                                        let bgColor = 'bg-gray-200 hover:bg-gray-300'; let borderColor = 'border-gray-400'; let textColor = 'text-gray-700';
                                        if (presencialHoras > 0 && remotoHoras > 0) { bgColor = 'bg-purple-200 hover:bg-purple-300'; borderColor = 'border-purple-500'; textColor = 'text-purple-800';}
                                        else if (presencialHoras > 0) { bgColor = 'bg-green-200 hover:bg-green-300'; borderColor = 'border-green-500'; textColor = 'text-green-800';}
                                        else if (remotoHoras > 0) { bgColor = 'bg-blue-200 hover:bg-blue-300'; borderColor = 'border-blue-500'; textColor = 'text-blue-800';}
                                        return (<div key={slot.id || `${slot.franja}-${slot.turno}`} 
                                                     className={`absolute left-0.5 right-0.5 p-1 text-[10px] sm:text-xs rounded-md shadow-lg border-l-4 ${bgColor} ${borderColor} ${textColor} transition-all duration-150 ease-in-out cursor-pointer z-10 overflow-hidden hover:shadow-xl transform hover:-translate-y-0.5`} 
                                                     style={{ top: `${topPositionPx}px`, height: `${blockHeightPx - 2}px` }}
                                                     title={`Clic para editar: ${formatFranja(slot.franja)}\nSede: ${slot.sede1DePreferenciaPresencial}`}
                                                     onClick={(e) => { e.stopPropagation(); onEditSlot(slot.id); }} 
                                                     >
                                                    <div className="font-bold text-[11px] sm:text-sm truncate">{formatFranja(slot.franja)}</div>
                                                    {presencialHoras > 0 && <div className="flex items-center text-[10px] sm:text-xs"><Briefcase size={window.innerWidth < 640 ? 10:12} className="mr-0.5 sm:mr-1"/> P: {presencialHoras}h</div>}
                                                    {remotoHoras > 0 && <div className="flex items-center text-[10px] sm:text-xs"><Home size={window.innerWidth < 640 ? 10:12} className="mr-0.5 sm:mr-1"/> R: {remotoHoras}h</div>}
                                                    <div className="text-[9px] sm:text-[10px] text-gray-600 truncate mt-0.5">{slot.sede1DePreferenciaPresencial}</div>
                                               </div>);
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <GeminiAnalysis teacher={teacher} records={teacherRecords} />
            </div>
        </div>
    );
};


const GeneralScheduleModal = ({ isOpen, onClose, allDisponibilidades, usuarios }) => {
    if (!isOpen) return null; 
    const [selectedSlotDetails, setSelectedSlotDetails] = useState(null);
    
    const aggregatedSchedule = useMemo(() => { const density = {}; DIAS_SEMANA_ORDEN.forEach(dia => { density[dia] = {}; calendarTimeLabels.forEach(ts_label => { density[dia][ts_label] = { count: 0, specialistsDetails: [] }; }); }); allDisponibilidades.forEach(disp => { const usuario = usuarios.find(u => u.id === disp.userId); if (!usuario) return;  const diaKey = (disp.dia || '').toUpperCase(); if (!DIAS_SEMANA_ORDEN.includes(diaKey)) return; if (disp.franja && disp.franja.includes('-')) { const [startStr, endStr] = disp.franja.split('-').map(s => s.trim()); const startMinutesTotal = timeStringToTotalMinutes(startStr); const endMinutesTotal = timeStringToTotalMinutes(endStr); if (startMinutesTotal === -1 || endMinutesTotal === -1 || startMinutesTotal >= endMinutesTotal) return; calendarTimeLabels.forEach((ts_label, timeIdx) => { const slotStartTotalMinutes = (CALENDAR_TIME_SLOTS_START_HOUR * 60) + timeIdx * 30; const slotEndTotalMinutes = slotStartTotalMinutes + 30; if (slotStartTotalMinutes < endMinutesTotal && slotEndTotalMinutes > startMinutesTotal) { density[diaKey][ts_label].count++; density[diaKey][ts_label].specialistsDetails.push({ id: disp.id, nombre: usuario.apellidosNombresCompletos, dni: usuario.dni, franja: disp.franja, sede: disp.sede1DePreferenciaPresencial, turno: disp.turno, hPresencial: disp.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0, hRemoto: disp.horasDisponiblesParaRealizarAcompaniamientoRemoto || 0, }); } }); }}); return density; }, [allDisponibilidades, usuarios]);
    
    const getColorForCount = (count) => { if (count === 0) return 'bg-gray-100/50 hover:bg-gray-200/70'; if (count === 1) return 'bg-teal-100 hover:bg-teal-200'; if (count <= 3) return 'bg-teal-200 hover:bg-teal-300'; if (count <= 5) return 'bg-teal-300 hover:bg-teal-400'; if (count <= 7) return 'bg-teal-400 hover:bg-teal-500'; return 'bg-teal-500 hover:bg-teal-600';};
    const handleCellClick = (day, timeLabel, data) => { if (data.count > 0) setSelectedSlotDetails({ day, timeLabel, specialists: data.specialistsDetails }); else setSelectedSlotDetails(null); };
    
    return ( <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-lg flex justify-center items-center p-4 z-[60] transition-opacity duration-300 ease-in-out" style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }} onClick={onClose}> <div className="bg-gradient-to-br from-white to-gray-100 p-5 rounded-xl shadow-2xl max-w-[95vw] w-full max-h-[95vh] flex flex-col transform transition-all duration-300 ease-in-out" style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-20px)' }} onClick={(e) => e.stopPropagation()}> <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-300"> <h3 className="text-3xl font-bold text-gray-800 flex items-center"><UsersRound size={32} className="mr-3 text-teal-600"/>Horario General</h3> <button onClick={onClose} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors"><XCircle size={32} /></button> </div> <div className="flex flex-grow overflow-hidden gap-x-4"> <div className="flex-grow overflow-auto custom-scrollbar pr-2 -mr-2 relative"> <div className="flex sticky top-0 z-20 bg-gray-200/80 backdrop-blur-sm"><div className="w-16 sm:w-20 shrink-0 p-2.5 border-b border-r border-gray-300"></div>{DIAS_SEMANA_ORDEN.map(dia => (<div key={`header-${dia}`} className="flex-1 p-2.5 text-center text-xs sm:text-sm font-semibold text-gray-700 capitalize border-b border-r border-gray-300">{dia.toLowerCase()}</div>))}</div> <div className="flex"> <div className="w-16 sm:w-20 shrink-0">{calendarTimeLabels.map(label => (<div key={`time-label-gen-${label}`} className="h-8 flex items-center justify-end pr-1 text-xs text-gray-500 border-r border-b border-gray-300">{label}</div>))}</div> <div className="flex-grow grid grid-cols-7 gap-px bg-gray-300 border-b border-r border-gray-300">{DIAS_SEMANA_ORDEN.map(dia => (<div key={`col-gen-${dia}`} className="relative">{calendarTimeLabels.map((ts_label) => { const slotData = aggregatedSchedule[dia]?.[ts_label] || { count: 0, specialistsDetails: [] }; const bgColor = getColorForCount(slotData.count); return (<div key={`${dia}-${ts_label}-gen`} className={`h-8 flex items-center justify-center text-xs font-medium border-b border-r border-gray-200/50 bg-white transition-all duration-150 ease-in-out ${bgColor} ${slotData.count > 0 ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => handleCellClick(dia, ts_label, slotData)} title={`${ts_label}: ${slotData.count} especialista(s)`}>{slotData.count > 0 ? slotData.count : ''}</div>); })}</div>))}</div></div> </div> <div className={`flex-shrink-0 bg-white p-4 rounded-lg shadow-lg overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${selectedSlotDetails ? 'w-full md:w-1/3 lg:w-1/4 xl:w-1/5 opacity-100' : 'w-0 opacity-0'}`} style={{pointerEvents: selectedSlotDetails ? 'auto' : 'none'}}> {selectedSlotDetails ? (<><h4 className="text-lg font-semibold text-teal-700 mb-1 capitalize">{selectedSlotDetails.day.toLowerCase()}</h4><p className="text-2xl font-bold text-gray-700 mb-3">{selectedSlotDetails.timeLabel}</p><p className="text-sm text-gray-600 mb-3 border-b pb-3">{selectedSlotDetails.specialists.length} especialista(s):</p><ul className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">{selectedSlotDetails.specialists.map((esp, idx) => (<li key={esp.id + idx} className="p-2.5 bg-gray-50 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><p className="font-semibold text-sm text-teal-600">{esp.nombre}</p><p className="text-xs text-gray-500">DNI: {esp.dni}</p><p className="text-xs text-gray-500">Sede: {esp.sede}</p><p className="text-xs text-gray-500">Franja: {formatFranja(esp.franja)}</p>{esp.hPresencial > 0 && <p className="text-xs text-green-600 flex items-center"><Briefcase size={12} className="mr-1"/> P: {esp.hPresencial}h</p>}{esp.hRemoto > 0 && <p className="text-xs text-blue-600 flex items-center"><Home size={12} className="mr-1"/> R: {esp.hRemoto}h</p>}</li>))}</ul></>) : (<div className="flex flex-col items-center justify-center h-full text-center text-gray-400 whitespace-nowrap"><SlidersHorizontal size={40} className="mb-3"/><p className="text-sm">Clic en celda</p><p className="text-xs">para ver detalles.</p></div>)} </div> </div> <p className="mt-4 text-xs text-gray-500 italic">Colores indican densidad. Horario de 07:00 a 22:00.</p> </div> </div> );
};


const DisponibilidadAcompaniamientoPage = () => {
    const [disponibilidadRecords, setDisponibilidadRecords] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isIndividualScheduleModalOpen, setIsIndividualScheduleModalOpen] = useState(false);
    const [selectedTeacherForIndividualSchedule, setSelectedTeacherForIndividualSchedule] = useState(null);
    const [isGeneralScheduleModalOpen, setIsGeneralScheduleModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('https://kali-ad-web.beesoftware.net/api/disponibilidad-acompaniamiento');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                const rawData = await response.json();

                if (!Array.isArray(rawData)) {
                    throw new Error("El formato de la respuesta de la API no es un array como se esperaba.");
                }

                const usersMap = new Map();
                const processedRecords = rawData.map(item => {
                    if (!item || !item.dni) {
                        return null; // Omitir registros inválidos
                    }

                    const userDNI = String(item.dni);
                    if (!usersMap.has(userDNI)) {
                        usersMap.set(userDNI, {
                            id: userDNI,
                            apellidosNombresCompletos: item.apellidosNombresCompletos || 'Nombre no disponible',
                            dni: userDNI,
                            preferenciaHorarios: 'Ver horario detallado.', // Valor por defecto
                            sedePreferida: 'Varias', // Valor por defecto
                        });
                    }
                    
                    return {
                        id: item._id,
                        userId: userDNI,
                        apellidosNombresCompletos: item.apellidosNombresCompletos || 'Nombre no disponible',
                        dni: userDNI,
                        horasDisponiblesParaRealizarAcompaniamientoPresencial: parseFloat(item.horasDisponiblesParaRealizarAcompaniamientoPresencial) || 0,
                        horasDisponiblesParaRealizarAcompaniamientoRemoto: 0, // La API no provee este campo
                        sede1DePreferenciaPresencial: item.sede1DePreferenciaPresencial || '',
                        dia: (item.dia || '').toUpperCase(),
                        franja: (item.franja || '').replace(/\s/g, ''),
                        hora: item.hora || '',
                        turno: item.turno || ''
                    };
                }).filter(Boolean); // Filtrar registros nulos

                setUsuarios(Array.from(usersMap.values()));
                setDisponibilidadRecords(processedRecords);

            } catch (e) {
                console.error("Fallo al obtener los datos:", e);
                setError("No se pudo cargar la información de disponibilidad. Por favor, recargue la página.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const clearMessages = useCallback(() => { setError(null); setSuccessMessage(null); }, []);
    useEffect(() => { if (successMessage || error) { const timer = setTimeout(() => { clearMessages(); }, 4000); return () => clearTimeout(timer); } }, [successMessage, error, clearMessages]);

    const filteredUsers = useMemo(() => {
        let filtered = usuarios;
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            filtered = usuarios.filter(user =>
                (user.apellidosNombresCompletos || '').toLowerCase().includes(lowerSearchTerm) ||
                (user.dni || '').toLowerCase().includes(lowerSearchTerm)
            );
        }
        return filtered;
    }, [usuarios, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const totalDocs = filteredUsers.length;
    const totalPages = Math.max(1, Math.ceil(totalDocs / itemsPerPage));

    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) setCurrentPage(newPage); };
    
    const handleOpenEditModal = (recordId) => {
        const recordToEdit = disponibilidadRecords.find(r => r.id === recordId);
        if (recordToEdit) {
            setEditingRecord(recordToEdit);
        }
    };

    const handleSaveOrUpdateAvailability = (updatedRecord) => {
        const { userId, dia } = updatedRecord;
        const [newStartStr, newEndStr] = updatedRecord.franja.split('-');
        let newStartMinutes = timeStringToTotalMinutes(newStartStr);
        let newEndMinutes = timeStringToTotalMinutes(newEndStr);
        let mergedHoursPresencial = updatedRecord.horasDisponiblesParaRealizarAcompaniamientoPresencial;
        let mergedHoursRemoto = updatedRecord.horasDisponiblesParaRealizarAcompaniamientoRemoto;

        const recordsToMergeAndRemove = new Set();
        if (!String(updatedRecord.id).startsWith('draft_')) {
            recordsToMergeAndRemove.add(updatedRecord.id);
        }

        const otherRecordsOnSameDay = disponibilidadRecords.filter(r => r.userId === userId && r.dia === dia && r.id !== updatedRecord.id);

        otherRecordsOnSameDay.forEach(existingRecord => {
            const [existingStartStr, existingEndStr] = existingRecord.franja.split('-');
            const existingStartMinutes = timeStringToTotalMinutes(existingStartStr);
            const existingEndMinutes = timeStringToTotalMinutes(existingEndStr);
            if (newStartMinutes <= existingEndMinutes && newEndMinutes >= existingStartMinutes) {
                newStartMinutes = Math.min(newStartMinutes, existingStartMinutes);
                newEndMinutes = Math.max(newEndMinutes, existingEndMinutes);
                mergedHoursPresencial += existingRecord.horasDisponiblesParaRealizarAcompaniamientoPresencial;
                mergedHoursRemoto += existingRecord.horasDisponiblesParaRealizarAcompaniamientoRemoto;
                recordsToMergeAndRemove.add(existingRecord.id);
            }
        });

        const formatMinutesToHHMM = (totalMinutes) => {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`;
        };
        const finalFranja = `${formatMinutesToHHMM(newStartMinutes)}-${formatMinutesToHHMM(newEndMinutes)}`;
        const finalRecord = {
            ...updatedRecord,
            id: `disp_${Date.now()}`,
            franja: finalFranja,
            horasDisponiblesParaRealizarAcompaniamientoPresencial: mergedHoursPresencial,
            horasDisponiblesParaRealizarAcompaniamientoRemoto: mergedHoursRemoto,
        };
        setDisponibilidadRecords(prev => {
            const recordsWithoutMerged = prev.filter(r => !recordsToMergeAndRemove.has(r.id));
            return [...recordsWithoutMerged, finalRecord];
        });
        
        setEditingRecord(null);
        setSuccessMessage("Disponibilidad guardada y fusionada exitosamente.");
    };

    const handleDeleteAvailability = (recordId) => {
        setDisponibilidadRecords(prev => prev.filter(r => r.id !== recordId));
        setSuccessMessage("Disponibilidad eliminada.");
    };

    const openIndividualScheduleModal = (userId) => { 
        const teacher = usuarios.find(u => u.id === userId); 
        if (teacher) { 
            setSelectedTeacherForIndividualSchedule(teacher); 
            setIsIndividualScheduleModalOpen(true); 
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <Loader2 className="h-16 w-16 text-teal-600 animate-spin" />
                <p className="mt-4 text-xl text-gray-700">Cargando datos de disponibilidad...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 flex items-center"><CalendarDays className="mr-4 text-teal-600" size={40} /> Gestión de Disponibilidad</h1>
                <p className="text-sm text-gray-500 ml-14">Asigne y visualice horarios para acompañamiento.</p>
            </header>

            <div className="my-4 space-y-3">
                {error && (<div className="fixed top-5 right-5 z-[100] p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-lg flex items-center animate-fadeIn"><AlertTriangle className="h-5 w-5 mr-3" /><div><strong className="font-bold">Error:</strong><p className="text-sm">{error}</p></div><button onClick={clearMessages} className="ml-4 text-red-800"><XCircle size={18}/></button></div>)}
                {successMessage && (<div className="fixed top-5 right-5 z-[100] p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg shadow-lg flex items-center animate-fadeIn"><div className="flex items-center"><ListChecks className="h-5 w-5 mr-3" /><div><strong className="font-bold">Éxito:</strong><p className="text-sm">{successMessage}</p></div></div><button onClick={clearMessages} className="ml-4 text-green-800"><XCircle size={18}/></button></div>)}
            </div>
            
            <div className="mb-6 flex space-x-4">
                <button onClick={() => {setIsGeneralScheduleModalOpen(true); clearMessages();}} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-105 transition-transform duration-150">
                    <UsersRound className="mr-2 h-5 w-5" />Ver Horario General
                </button>
            </div>

            <section className="bg-white rounded-xl shadow-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700 flex items-center"><Users className="mr-2 text-teal-600" /> Lista de Especialistas ({usuarios.length})</h2>
                    <input type="text" placeholder="Buscar especialista por DNI o nombre..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full md:w-2/5 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm" />
                </div>
                {!paginatedUsers.length ? ( <div className="text-center py-12"> <Users size={56} className="mx-auto text-gray-400 mb-4" /> <p className="text-xl text-gray-500 mb-2">{usuarios.length === 0 ? "No hay especialistas." : "No se encontraron especialistas."}</p></div> ) : ( <> <div className="overflow-x-auto shadow-md rounded-lg"> <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-100"><tr>{['Especialista', 'DNI', 'Acciones'].map(header => (<th key={header} scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>))}</tr></thead><tbody className="bg-white divide-y divide-gray-200">{paginatedUsers.map((usuario) => ( <tr key={usuario.id} className="hover:bg-teal-50/50 transition-colors duration-150 group"><td className="px-5 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">{usuario.apellidosNombresCompletos}</td><td className="px-5 py-4 whitespace-nowrap text-sm">{usuario.dni}</td><td className="px-5 py-4 whitespace-nowrap text-sm"><div className="flex space-x-3"><button onClick={() => openIndividualScheduleModal(usuario.id)} className="text-purple-600 hover:text-purple-900" title="Ver/Editar Horario Individual"><Eye size={20} /></button></div></td></tr> ))}</tbody></table></div> {totalPages > 1 && ( <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0"> <p className="text-sm text-gray-700">Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDocs)}</span> de <span className="font-medium">{totalDocs}</span></p> <div className="flex items-center space-x-2"> <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50">Anterior</button> <span className="text-sm text-gray-700">Página {currentPage} de {totalPages}</span> <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50">Siguiente</button> </div> </div> )} </>)}
            </section>

            <WeeklyScheduleModal 
                isOpen={isIndividualScheduleModalOpen} 
                onClose={() => {setIsIndividualScheduleModalOpen(false); setSelectedTeacherForIndividualSchedule(null);}} 
                teacher={selectedTeacherForIndividualSchedule} 
                records={disponibilidadRecords} 
                onEditSlot={handleOpenEditModal} 
                onEmptyCellClick={(day, time) => {
                    const user = selectedTeacherForIndividualSchedule;
                    if (!user) return;
                    const startTime = time.replace(':', '');
                    const endTimeMinutes = timeStringToTotalMinutes(startTime) + 90;
                    const endHour = Math.floor(endTimeMinutes / 60);
                    const endMinute = endTimeMinutes % 60;
                    const endTime = `${String(endHour).padStart(2,'0')}${String(endMinute).padStart(2,'0')}`;
                    
                    let turno = 'NOCHE';
                    const startHour = parseInt(startTime.substring(0,2), 10);
                    if(startHour < 12) turno = 'MAÑANA';
                    else if (startHour < 18) turno = 'TARDE';

                    const newSlot = {
                        id: `draft_${Date.now()}`,
                        userId: user.id,
                        apellidosNombresCompletos: user.apellidosNombresCompletos,
                        dni: user.dni,
                        dia: day,
                        franja: `${startTime}-${endTime}`,
                        sede1DePreferenciaPresencial: user.sedePreferida || '',
                        turno: turno,
                        horasDisponiblesParaRealizarAcompaniamientoPresencial: 1.5,
                        horasDisponiblesParaRealizarAcompaniamientoRemoto: 0,
                    };
                    setEditingRecord(newSlot);
                }}
            />
            <GeneralScheduleModal 
                isOpen={isGeneralScheduleModalOpen} 
                onClose={() => setIsGeneralScheduleModalOpen(false)} 
                allDisponibilidades={disponibilidadRecords} 
                usuarios={usuarios}
            />
            <EditAvailabilityModal
                isOpen={!!editingRecord}
                onClose={() => setEditingRecord(null)}
                record={editingRecord}
                onSave={handleSaveOrUpdateAvailability}
                onDelete={(recordId) => {
                    handleDeleteAvailability(recordId);
                    setEditingRecord(null);
                }}
            />
            
            <style>{`
                .input-style { display: block; width: 100%; padding: 0.625rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; }
                .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #0D9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.3); }
                .select-style { display: block; width: 100%; padding: 0.625rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); background-color: white; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
                .select-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #0D9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.3); }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #14B8A6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0D9488; }
            `}</style>
        </div>
    );
};

export default DisponibilidadAcompaniamientoPage;
