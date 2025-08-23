import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Save, X, Briefcase, Home, Loader2, AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';

// --- GLOBAL CONSTANTS AND HELPERS ---

// Standard order of the days of the week for calendar display.
const DIAS_SEMANA = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

// Options for the location dropdown.
const SEDES_OPTIONS = [
    { valor: 'CAJ', nombre: 'CAJAMARCA' },
    { valor: 'LC0', nombre: 'BREÑA' },
    { valor: 'LE0', nombre: 'SAN JUAN' },
    { valor: 'LN0', nombre: 'LOS OLIVOS' },
    { valor: 'LN1', nombre: 'COMAS' },
    { valor: 'LS0', nombre: 'CHORRILLOS' },
    { valor: 'REM', nombre: 'REMOTO' },
    { valor: 'TML', nombre: 'TRUJILLO-EL MOLINO' },
    { valor: 'TSI', nombre: 'TRUJILLO-SAN ISIDRO' },
    { valor: 'VIR', nombre: 'VIRTUAL' },
];

// Visual time range for the calendar.
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 23;

/**
 * Generates time labels for the vertical axis of the calendar (e.g., "07:00", "07:30").
 */
const timeLabels = Array.from({ length: (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 2 }, (_, i) => {
    const hour = CALENDAR_START_HOUR + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

/**
 * Converts a time string (e.g., "0930" or "930") to total minutes from midnight.
 * @param {string} timeStr - The time string to convert.
 * @returns {number} - The total minutes, or -1 if the format is invalid.
 */
const timeStringToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return -1;
    const cleaned = timeStr.replace(':', '').trim();
    
    let hours, minutes;
    if (cleaned.length === 3) { // HMM format (e.g., "930")
        hours = parseInt(cleaned.substring(0, 1), 10);
        minutes = parseInt(cleaned.substring(1, 3), 10);
    } else if (cleaned.length === 4) { // HHMM format (e.g., "0930")
        hours = parseInt(cleaned.substring(0, 2), 10);
        minutes = parseInt(cleaned.substring(2, 4), 10);
    } else {
        return -1;
    }

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return -1;
    }
    return hours * 60 + minutes;
};


/**
 * Formats a time range for display (e.g., "0930-1100" -> "09:30 - 11:00").
 * @param {string} franja - The time range in "HHMM-HHMM" or "HHMM - HHMM" format.
 * @returns {string} - The formatted range.
 */
const formatFranjaDisplay = (franja) => {
    if (!franja || typeof franja !== 'string' || !franja.includes('-')) return franja;
    const formatTime = (time) => {
        const cleaned = time.trim().padStart(4, '0');
        return `${cleaned.substring(0, 2)}:${cleaned.substring(2, 4)}`;
    };
    const parts = franja.split('-').map(p => p.trim());
    if (parts.length !== 2) return franja;
    return `${formatTime(parts[0])} - ${formatTime(parts[1])}`;
};

/**
 * Formats a time range to the format required by the API (e.g., "09:30 - 11:00" -> "0930-1100").
 * @param {string} franja - The time range in any format.
 * @returns {string} - The API-formatted range.
 */
const formatFranjaForAPI = (franja) => {
    if (!franja || typeof franja !== 'string') return franja;
    return franja.replace(/:/g, '').replace(/\s/g, '');
};


// --- CHILD COMPONENTS ---

/**
 * Modal component for editing or adding an availability block.
 */
const AvailabilityModal = ({ isOpen, onClose, record, onSave, onDelete }) => {
    const [franjaInicio, setFranjaInicio] = useState('');
    const [franjaFin, setFranjaFin] = useState('');
    const [sede, setSede] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        if (record) {
            if (record.franja && record.franja.includes('-')) {
                const [start, end] = record.franja.replace(/\s/g, '').split('-');
                setFranjaInicio(start.padStart(4, '0'));
                setFranjaFin(end.padStart(4, '0'));
            } else {
                setFranjaInicio('');
                setFranjaFin('');
            }
            setSede(record.sede1DePreferenciaPresencial || '');
            setModalError('');
        }
    }, [record]);

    if (!isOpen || !record) return null;

    const handleSaveClick = () => {
        const inicioMinutes = timeStringToMinutes(franjaInicio);
        const finMinutes = timeStringToMinutes(franjaFin);

        if (inicioMinutes === -1 || finMinutes === -1) {
            setModalError("Formato de hora inválido. Usa HHMM (ej: 0830).");
            return;
        }
        if (inicioMinutes >= finMinutes) {
            setModalError("La hora de inicio debe ser anterior a la de fin.");
            return;
        }
        if (!sede) {
            setModalError("Debes seleccionar una sede.");
            return;
        }

        const sedeSeleccionada = SEDES_OPTIONS.find(s => s.valor === sede);
        const franjaParaGuardar = `${franjaInicio.padStart(4, '0')}-${franjaFin.padStart(4, '0')}`;
        const duracionHoras = (finMinutes - inicioMinutes) / 60;

        const updatedRecord = {
            ...record,
            franja: franjaParaGuardar,
            sede1DePreferenciaPresencial: sede,
            sedeNombreCompleto: sedeSeleccionada ? sedeSeleccionada.nombre : '',
            // This field now represents the duration of the block, not the total committed hours.
            horasDisponiblesParaRealizarAcompaniamientoPresencial: duracionHoras,
        };
        onSave(updatedRecord);
        onClose();
    };
    
    const handleDeleteClick = () => {
        onDelete(record._id);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <Edit className="mr-2 h-5 w-5 text-teal-600"/>
                        {record._id.toString().startsWith('draft_') ? "Añadir Disponibilidad" : "Editar Disponibilidad"}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
                </div>
                
                {modalError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md mb-4 text-sm">{modalError}</div>}

                <div className="space-y-4">
                    <p className="text-sm"><strong>Día:</strong> <span className="font-medium text-teal-700 capitalize">{record.dia.toLowerCase()}</span></p>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hora Inicio (HHMM)</label>
                            <input type="text" value={franjaInicio} onChange={(e) => setFranjaInicio(e.target.value)} placeholder="0800" className="mt-1 input-style"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hora Fin (HHMM)</label>
                            <input type="text" value={franjaFin} onChange={(e) => setFranjaFin(e.target.value)} placeholder="1030" className="mt-1 input-style"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sede</label>
                       <select value={sede} onChange={(e) => setSede(e.target.value)} className="mt-1 input-style w-full">
                            <option value="">Seleccione una sede...</option>
                            {SEDES_OPTIONS.map(option => (
                                <option key={option.valor} value={option.valor}>{option.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                        {!record._id.toString().startsWith('draft_') ? (
                           <button onClick={handleDeleteClick} className="btn-danger flex items-center"><Trash2 size={16} className="mr-1.5"/> Eliminar</button>
                        ) : (<div></div>) /* Placeholder to keep alignment */
                        }
                        <div className="flex space-x-3">
                            <button onClick={onClose} className="btn-secondary">Cancelar</button>
                            <button onClick={handleSaveClick} className="btn-primary flex items-center"><Save size={16} className="mr-1.5"/> Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Component to display the weekly calendar with availability blocks.
 */
const ScheduleCalendar = ({ records, onSlotClick, onEmptyCellClick }) => {
    const scheduleByDay = useMemo(() => {
        const schedule = {};
        DIAS_SEMANA.forEach(dia => schedule[dia] = []);
        records.forEach(r => {
            if (schedule[r.dia]) {
                schedule[r.dia].push(r);
            }
        });
        return schedule;
    }, [records]);

    return (
        <div className="bg-white p-4 rounded-b-lg shadow-lg">
            <div className="flex w-full">
                {/* Time Column */}
                <div className="w-16 md:w-20 text-xs text-right pr-2 shrink-0">
                    <div className="h-10"></div> {/* Spacer for day header */}
                    {timeLabels.map(label => (
                        <div key={label} className="h-8 flex items-center justify-end text-gray-500">{label}</div>
                    ))}
                </div>

                {/* Day Columns */}
                <div className="flex-grow grid grid-cols-7 border-t border-l border-gray-200">
                    {DIAS_SEMANA.map(dia => (
                        <div key={dia} className="relative border-r border-gray-200">
                            {/* Day Header */}
                            <div className="h-10 sticky top-0 bg-gray-100 z-10 border-b border-gray-200 flex items-center justify-center">
                               <p className="text-xs md:text-sm font-semibold text-gray-600 capitalize">{dia.toLowerCase()}</p>
                            </div>

                            {/* Background cells for clicks */}
                            {timeLabels.map((label, index) => (
                                <div key={`${dia}-${label}`} className="h-8 border-b border-gray-100 cursor-pointer hover:bg-teal-50" onClick={() => onEmptyCellClick(dia, label)}></div>
                            ))}
                            
                            {/* Availability Blocks */}
                            {(scheduleByDay[dia] || []).map(slot => {
                                if (!slot.franja || !slot.franja.includes('-')) return null;
                                const [startStr, endStr] = formatFranjaForAPI(slot.franja).split('-');
                                const startMinutes = timeStringToMinutes(startStr);
                                const endMinutes = timeStringToMinutes(endStr);
                                
                                if (startMinutes === -1 || endMinutes === -1 || startMinutes >= endMinutes) return null;

                                const calendarStartMinutes = CALENDAR_START_HOUR * 60;
                                const top = ((startMinutes - calendarStartMinutes) / 30) * 2; // 2rem (h-8) per slot
                                const height = ((endMinutes - startMinutes) / 30) * 2;
                                
                                return (
                                    <div 
                                        key={slot._id}
                                        className="absolute left-0.5 right-0.5 p-1.5 rounded-md shadow-md border-l-4 border-teal-500 bg-teal-100 text-teal-800 cursor-pointer hover:bg-teal-200 hover:shadow-lg transition-all"
                                        style={{ top: `${top}rem`, height: `${height}rem` }}
                                        onClick={() => onSlotClick(slot)}
                                        title={`Editar: ${formatFranjaDisplay(slot.franja)}`}
                                    >
                                        <p className="font-bold text-xs">{formatFranjaDisplay(slot.franja)}</p>
                                        <p className="text-[10px] truncate"><MapPin size={10} className="inline mr-1"/>{slot.sede1DePreferenciaPresencial}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const MiDisponibilidadPage = () => {
    // ---- STATE ----
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [initialDisponibilidad, setInitialDisponibilidad] = useState([]); // To compare changes in calendar blocks
    
    // State for the total committed hours, editable by the user
    const [horasPresencialesAsignadas, setHorasPresencialesAsignadas] = useState(0);
    const [horasRemotasAsignadas, setHorasRemotasAsignadas] = useState(0);
    const [initialHorasPresenciales, setInitialHorasPresenciales] = useState(0); // To compare changes

    const [specialistInfo, setSpecialistInfo] = useState({ nombre: '', dni: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    
    // ---- DATA PROCESSING HELPER ----
    const processApiData = (calendarData = []) => {
        if (!Array.isArray(calendarData)) return [];
        return calendarData.map(item => {
            // Guard against malformed items
            if (!item.franja || !item.dia) return null;

            const cleanedFranja = item.franja.replace(/\s/g, ''); // e.g., "09:00-10:30" -> "09:00-10:30"
            const [startStr, endStr] = cleanedFranja.split('-');

            // Guard against malformed time ranges
            if (!startStr || !endStr) return null;

            const startMinutes = timeStringToMinutes(startStr);
            const endMinutes = timeStringToMinutes(endStr);

            // Guard against invalid times
            if (startMinutes === -1 || endMinutes === -1 || startMinutes >= endMinutes) return null;

            const hours = (endMinutes - startMinutes) / 60;

            return {
                ...item, // Spread original item
                _id: item._id || `client_${Date.now()}_${Math.random()}`,
                dia: item.dia.toUpperCase().trim(),
                franja: `${startStr.replace(':', '')}-${endStr.replace(':', '')}`, // Store the cleaned, canonical version e.g. 0900-1030
                horasDisponiblesParaRealizarAcompaniamientoPresencial: hours // Store calculated duration
            };
        }).filter(Boolean); // Filter out any nulls from the guards
    };

    // ---- EFFECTS ----
    
    // Effect to load initial data from the API.
    useEffect(() => {
        const fetchDisponibilidad = async () => {
            setIsLoading(true);
            setError(null);
            
            let specialistDni = null;
            try {
                const currentUserJSON = localStorage.getItem('currentUser');
                if (currentUserJSON) {
                    const currentUser = JSON.parse(currentUserJSON);
                    specialistDni = currentUser?.dni;
                    setSpecialistInfo({ nombre: currentUser?.name || 'Usuario', dni: specialistDni || 'N/A' });
                } else {
                    throw new Error("No hay un usuario logueado.");
                }
            } catch (err) {
               console.error("Error al leer desde localStorage:", err);
               setError("No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
               setIsLoading(false);
               return;
            }

            if (!specialistDni) {
                setError("DNI de especialista no encontrado en los datos de sesión.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3001/api/disponibilidad-acompaniamiento?dniEspecialista=${specialistDni}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        console.log("No availability found for specialist, starting fresh.");
                        setDisponibilidad([]);
                        setInitialDisponibilidad([]);
                        setHorasPresencialesAsignadas(0);
                        setInitialHorasPresenciales(0);
                        return; 
                    }
                    throw new Error(`Error de red: ${response.status} ${response.statusText}`);
                }
                const rawData = await response.json();

                // The API returns an array, so we take the first element.
                const data = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : null;

                if (!data) {
                    console.log("No availability data found for specialist, starting fresh.");
                    setDisponibilidad([]);
                    setInitialDisponibilidad([]);
                    setHorasPresencialesAsignadas(0);
                    setInitialHorasPresenciales(0);
                    return;
                }

                const processedData = processApiData(data.disponibilidades);

                setDisponibilidad(processedData);
                setInitialDisponibilidad(JSON.parse(JSON.stringify(processedData)));

                setHorasPresencialesAsignadas(data.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0);
                setInitialHorasPresenciales(data.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0);

                if (data.apellidosNombresCompletos) {
                    setSpecialistInfo(prev => ({ ...prev, nombre: data.apellidosNombresCompletos }));
                }

            } catch (err) {
                console.error("Error al cargar la disponibilidad:", err);
                setError("No se pudo cargar tu horario. Por favor, intenta recargar la página.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDisponibilidad();
    }, []);

    // Effect to hide success/error messages.
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);


    // ---- EVENT HANDLERS ----

    const handleOpenModal = (record) => {
        setEditingRecord(record);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
    };

    const handleEmptyCellClick = (dia, timeLabel) => {
        const startMinutes = timeStringToMinutes(timeLabel);
        const endMinutes = startMinutes + 90; // Default 90-minute block
        const formatMinutesToHHMM = (mins) => {
            const h = String(Math.floor(mins / 60)).padStart(2, '0');
            const m = String(mins % 60).padStart(2, '0');
            return `${h}${m}`;
        };

        const newRecord = {
            _id: `draft_${Date.now()}`,
            dia,
            franja: `${formatMinutesToHHMM(startMinutes)}-${formatMinutesToHHMM(endMinutes)}`,
            sede1DePreferenciaPresencial: '',
            horasDisponiblesParaRealizarAcompaniamientoPresencial: 1.5,
        };
        handleOpenModal(newRecord);
    };
    
    const handleLocalSave = useCallback((recordToSave) => {
        let finalRecord = { ...recordToSave };
        const [newStartMin, newEndMin] = formatFranjaForAPI(finalRecord.franja).split('-').map(timeStringToMinutes);
        
        const otherRecordsOnSameDay = disponibilidad.filter(r => 
            r.dia === finalRecord.dia && r._id !== finalRecord._id
        );
        
        const overlappingRecordsIds = new Set();
        if(!finalRecord._id.toString().startsWith('draft_')) {
           overlappingRecordsIds.add(finalRecord._id);
        }

        let mergedStartMin = newStartMin;
        let mergedEndMin = newEndMin;

        otherRecordsOnSameDay.forEach(existing => {
            const [existingStartMin, existingEndMin] = formatFranjaForAPI(existing.franja).split('-').map(timeStringToMinutes);
            // Check for overlap or adjacency
            if (mergedStartMin <= existingEndMin && mergedEndMin >= existingStartMin) {
                mergedStartMin = Math.min(mergedStartMin, existingStartMin);
                mergedEndMin = Math.max(mergedEndMin, existingEndMin);
                overlappingRecordsIds.add(existing._id);
            }
        });

        const formatMinutesToHHMM = (mins) => {
            const h = String(Math.floor(mins / 60)).padStart(2, '0');
            const m = String(mins % 60).padStart(2, '0');
            return `${h}${m}`;
        };
        
        const mergedHours = (mergedEndMin - mergedStartMin) / 60;

        finalRecord.franja = `${formatMinutesToHHMM(mergedStartMin)}-${formatMinutesToHHMM(mergedEndMin)}`;
        finalRecord.horasDisponiblesParaRealizarAcompaniamientoPresencial = mergedHours;
        
        setDisponibilidad(prev => {
            const nonMerged = prev.filter(r => !overlappingRecordsIds.has(r._id));
            return [...nonMerged, { ...finalRecord, _id: finalRecord._id.toString().startsWith('draft_') ? `saved_${Date.now()}` : finalRecord._id }];
        });
        
        setSuccessMessage('Cambio guardado localmente. Pulsa "Guardar en Servidor" para confirmar.');
    }, [disponibilidad]);

    const handleLocalDelete = useCallback((recordIdToDelete) => {
        setDisponibilidad(prev => prev.filter(r => r._id !== recordIdToDelete));
        setSuccessMessage('Bloque eliminado localmente. Pulsa "Guardar en Servidor" para confirmar.');
    }, []);

    const handleGlobalSave = async () => {
        if (isSaving) return;
        
        const { dni, nombre } = specialistInfo;
        if (!dni) {
            setError("No se puede guardar sin el DNI del especialista.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage('');

        const disponibilidades_payload = disponibilidad.map(r => ({
            sede1DePreferenciaPresencial: r.sede1DePreferenciaPresencial,
            dia: r.dia,
            franja: formatFranjaDisplay(r.franja), // Format back to "HH:MM - HH:MM" or similar for API
            hora: timeStringToMinutes(formatFranjaForAPI(r.franja).split('-')[0]) < 720 ? "MAÑANA" : "TARDE",
            turno: timeStringToMinutes(formatFranjaForAPI(r.franja).split('-')[0]) < 720 ? "M" : "T"
        }));

        const payload = {
            dni,
            apellidosNombresCompletos: nombre,
            horasDisponiblesParaRealizarAcompaniamientoPresencial: horasPresencialesAsignadas,
            disponibilidades: disponibilidades_payload
        };

        try {
            const response = await fetch(`http://localhost:3001/api/disponibilidad-acompaniamiento/especialista/${dni}/calendario`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Error del servidor: ${response.status}`);
            }
            
            const processedData = processApiData(result.calendarioActualizado?.disponibilidades);

            setDisponibilidad(processedData);
            setInitialDisponibilidad(JSON.parse(JSON.stringify(processedData)));
            
            setHorasPresencialesAsignadas(result.calendarioActualizado.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0);
            setInitialHorasPresenciales(result.calendarioActualizado.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0);

            setSuccessMessage(result.message || "Calendario actualizado exitosamente.");

        } catch (err) {
            console.error("Error al guardar el calendario:", err);
            setError(err.message || "No se pudo guardar el calendario. Revisa la consola para más detalles.");
        } finally {
            setIsSaving(false);
        }
    };

    // ---- CALCULATIONS AND MEMOS ----
    const { totalHorasEnCalendarioPresencial, totalHorasEnCalendarioRemoto } = useMemo(() => {
        return disponibilidad.reduce((totals, record) => {
            const hours = record.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0;
            if (record.sede1DePreferenciaPresencial === 'REM' || record.sede1DePreferenciaPresencial === 'VIR') {
                totals.totalHorasEnCalendarioRemoto += hours;
            } else {
                totals.totalHorasEnCalendarioPresencial += hours;
            }
            return totals;
        }, { totalHorasEnCalendarioPresencial: 0, totalHorasEnCalendarioRemoto: 0 });
    }, [disponibilidad]);
    
    const hasChanges = useMemo(() => {
        const blocksChanged = JSON.stringify(disponibilidad) !== JSON.stringify(initialDisponibilidad);
        const presencialHoursChanged = horasPresencialesAsignadas !== initialHorasPresenciales;
        return blocksChanged || presencialHoursChanged;
    }, [disponibilidad, initialDisponibilidad, horasPresencialesAsignadas, initialHorasPresenciales]);

    // ---- RENDER ----
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
                <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
                <p className="mt-4 text-lg text-gray-600">Cargando tu horario...</p>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8 font-sans">
            <div className="mx-auto">
                {/* Feedback Messages */}
                {error && <div className="fixed top-5 right-5 z-[100] p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-lg flex items-center"><AlertTriangle className="h-5 w-5 mr-3"/>{error}</div>}
                {successMessage && <div className="fixed top-5 right-5 z-[100] p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg shadow-lg flex items-center"><CheckCircle className="h-5 w-5 mr-3"/>{successMessage}</div>}

                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Mi Disponibilidad</h1>
                    <div className="text-gray-600 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>{specialistInfo.nombre}</span>
                        <span className="hidden sm:inline">|</span>
                        <span>DNI: {specialistInfo.dni}</span>
                    </div>
                </header>
        
                {/* Summary and Actions */}
                <div className="bg-white rounded-t-lg shadow-lg p-4 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 w-full lg:w-auto">
                         <div className="flex items-center text-gray-700">
                            <Home className="w-6 h-6 mr-3 text-teal-600 shrink-0"/>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium">Total Horas</label>
                                <div className="flex items-baseline gap-2">
                                    <input 
                                        type="number" 
                                        value={horasPresencialesAsignadas}
                                        onChange={(e) => setHorasPresencialesAsignadas(parseFloat(e.target.value) || 0)}
                                        className="input-style w-24 font-bold text-teal-700 text-lg p-1"
                                        min="0"
                                        step="0.5"
                                    />
                                    <span className="text-xs text-gray-500 whitespace-nowrap"> (Calendario: {totalHorasEnCalendarioPresencial.toFixed(1)}h)</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
                        <button onClick={() => handleEmptyCellClick("LUNES", "08:00")} className="btn-secondary w-full sm:w-auto flex items-center justify-center">
                            <Plus size={20} className="mr-2"/>
                            Añadir Bloque
                        </button>
                        <button 
                            onClick={handleGlobalSave} 
                            className={`btn-primary w-full sm:w-auto flex items-center justify-center ${(!hasChanges || isSaving) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!hasChanges || isSaving}
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 mr-2 animate-spin"/> : <UploadCloud size={20} className="mr-2"/>}
                            {isSaving ? 'Guardando...' : 'Guardar en Servidor'}
                        </button>
                    </div>
                </div>

                {/* Calendar */}
                <div className="overflow-x-auto custom-scrollbar">
                     <ScheduleCalendar 
                         records={disponibilidad} 
                         onSlotClick={handleOpenModal} 
                         onEmptyCellClick={handleEmptyCellClick}
                     />
                </div>
                
                {/* Modal */}
                {isModalOpen && (
                    <AvailabilityModal
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        record={editingRecord}
                        onSave={handleLocalSave}
                        onDelete={handleLocalDelete}
                    />
                )}
            </div>

            <style>{`
                .input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; background-color: white; appearance: none; }
                select.input-style { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; padding-right: 2.5rem; }
                .input-style:focus { outline: 2px solid transparent; outline-offset: 2px; border-color: #14B8A6; box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.4); }
                .input-style.w-24 { width: 6rem; }
                .btn-primary { padding: 0.6rem 1.25rem; background-color: #0D9488; color: white; border-radius: 0.375rem; font-weight: 500; transition: all 0.2s; border: 1px solid transparent; }
                .btn-primary:hover:not(:disabled) { background-color: #0F766E; }
                .btn-secondary { padding: 0.6rem 1.25rem; background-color: #f9fafb; color: #374151; border-radius: 0.375rem; font-weight: 500; transition: all 0.2s; border: 1px solid #D1D5DB; }
                .btn-secondary:hover { background-color: #F3F4F6; }
                .btn-danger { padding: 0.6rem 1.25rem; background-color: #FEE2E2; color: #B91C1C; border-radius: 0.375rem; font-weight: 500; transition: background-color 0.2s; }
                .btn-danger:hover { background-color: #FECACA; }
                .custom-scrollbar::-webkit-scrollbar { height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #a7a7a7; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #888; }
            `}</style>
        </div>
    );
};

export default MiDisponibilidadPage;
