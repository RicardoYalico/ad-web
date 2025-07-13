import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Save, X, Briefcase, Home, Loader2, AlertTriangle, CheckCircle, UploadCloud } from 'lucide-react';

// --- CONSTANTES Y HELPERS GLOBALES ---

// Orden estándar de los días de la semana para la visualización del calendario.
const DIAS_SEMANA = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

// Opciones para el desplegable de Sedes.
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

// Rango horario del calendario visual.
const CALENDAR_START_HOUR = 7;
const CALENDAR_END_HOUR = 23;

/**
 * Genera las etiquetas de tiempo para el eje vertical del calendario (ej: "07:00", "07:30").
 */
const timeLabels = Array.from({ length: (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 2 }, (_, i) => {
    const hour = CALENDAR_START_HOUR + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

/**
 * Convierte una cadena de tiempo (ej: "0930" o "930") a minutos totales desde la medianoche.
 * @param {string} timeStr - La cadena de tiempo a convertir.
 * @returns {number} - El total de minutos o -1 si el formato es inválido.
 */
const timeStringToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return -1;
    const cleaned = timeStr.replace(':', '').trim();
    
    let hours, minutes;
    if (cleaned.length === 3) { // Formato HMM (ej: "930")
        hours = parseInt(cleaned.substring(0, 1), 10);
        minutes = parseInt(cleaned.substring(1, 3), 10);
    } else if (cleaned.length === 4) { // Formato HHMM (ej: "0930")
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
 * Formatea una franja horaria para su visualización (ej: "0930-1100" -> "09:30 - 11:00").
 * @param {string} franja - La franja horaria en formato "HHMM-HHMM" o "HHMM - HHMM".
 * @returns {string} - La franja formateada.
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
 * Formatea una franja horaria al formato requerido por la API (ej: "09:30 - 11:00" -> "0930 - 1100").
 * @param {string} franja - La franja horaria en cualquier formato.
 * @returns {string} - La franja formateada para la API.
 */
const formatFranjaForAPI = (franja) => {
    if (!franja || typeof franja !== 'string' || !franja.includes('-')) return franja;
    return franja.replace(/:/g, '').replace(/\s/g, '');
};


// --- COMPONENTES SECUNDARIOS ---

/**
 * Componente Modal para editar o añadir un bloque de disponibilidad.
 */
const AvailabilityModal = ({ isOpen, onClose, record, onSave, onDelete }) => {
    const [franjaInicio, setFranjaInicio] = useState('');
    const [franjaFin, setFranjaFin] = useState('');
    const [sede, setSede] = useState('');
    const [horasPresencial, setHorasPresencial] = useState(0);
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
            setHorasPresencial(record.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0);
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
            setModalError("Debe seleccionar una sede.");
            return;
        }

        const sedeSeleccionada = SEDES_OPTIONS.find(s => s.valor === sede);
        const franjaParaGuardar = `${franjaInicio.padStart(4, '0')}-${franjaFin.padStart(4, '0')}`;

        const updatedRecord = {
            ...record,
            franja: franjaParaGuardar,
            sede1DePreferenciaPresencial: sede,
            sedeNombreCompleto: sedeSeleccionada ? sedeSeleccionada.nombre : '',
            horasDisponiblesParaRealizarAcompaniamientoPresencial: parseFloat(horasPresencial) || 0,
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Horas Presenciales</label>
                        <input type="number" value={horasPresencial} onChange={(e) => setHorasPresencial(e.target.value)} min="0" step="0.5" className="mt-1 input-style"/>
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
 * Componente para mostrar el calendario semanal con los bloques de disponibilidad.
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
                {/* Columna de Horas */}
                <div className="w-16 md:w-20 text-xs text-right pr-2 shrink-0">
                    <div className="h-10"></div> {/* Espacio para cabecera de días */}
                    {timeLabels.map(label => (
                        <div key={label} className="h-8 flex items-center justify-end text-gray-500">{label}</div>
                    ))}
                </div>

                {/* Columnas de Días */}
                <div className="flex-grow grid grid-cols-7 border-t border-l border-gray-200">
                    {DIAS_SEMANA.map(dia => (
                        <div key={dia} className="relative border-r border-gray-200">
                           {/* Cabecera del Día */}
                            <div className="h-10 sticky top-0 bg-gray-100 z-10 border-b border-gray-200 flex items-center justify-center">
                               <p className="text-xs md:text-sm font-semibold text-gray-600 capitalize">{dia.toLowerCase()}</p>
                            </div>

                            {/* Celdas de fondo para clics */}
                            {timeLabels.map((label, index) => (
                                <div key={`${dia}-${label}`} className="h-8 border-b border-gray-100 cursor-pointer hover:bg-teal-50" onClick={() => onEmptyCellClick(dia, label)}></div>
                            ))}
                            
                            {/* Bloques de Disponibilidad */}
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


// --- COMPONENTE PRINCIPAL ---

const MiDisponibilidadPage = () => {
    // ---- ESTADO ----
    const [disponibilidad, setDisponibilidad] = useState([]);
    const [initialDisponibilidad, setInitialDisponibilidad] = useState([]); // Para comparar cambios
    const [specialistInfo, setSpecialistInfo] = useState({ nombre: '', dni: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    
    // ---- EFECTOS ----
    
    // Efecto para cargar los datos iniciales desde la API, usando el DNI de localStorage.
    useEffect(() => {
        const fetchDisponibilidad = async () => {
            setIsLoading(true);
            setError(null);
            
            let specialistDni = null;
            // 1. Obtener DNI desde localStorage
            try {
                const currentUserJSON = localStorage.getItem('currentUser');
                if (currentUserJSON) {
                    const currentUser = JSON.parse(currentUserJSON);
                    specialistDni = currentUser?.dni;
                    // Actualizar la info del especialista inmediatamente para el UI
                    setSpecialistInfo({
                        nombre: currentUser?.name || 'Usuario',
                        dni: specialistDni || 'N/A'
                    });
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

            // 2. Realizar la llamada a la API con el DNI obtenido
            try {
                const response = await fetch(`https://kali-ad-web.beesoftware.net/api/disponibilidad-acompaniamiento?dniEspecialista=${specialistDni}`);
                if (!response.ok) {
                    throw new Error(`Error de red: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                // Procesar y limpiar los datos de la API
                const processedData = data.map(item => ({
                    ...item,
                    dia: (item.dia || '').toUpperCase().trim(),
                    franja: (item.franja || '').replace(/\s/g, ''),
                    horasDisponiblesParaRealizarAcompaniamientoPresencial: parseFloat(item.horasDisponiblesParaRealizarAcompaniamientoPresencial) || 0
                }));

                setDisponibilidad(processedData);
                setInitialDisponibilidad(JSON.parse(JSON.stringify(processedData))); // Deep copy

                // Si la API devuelve datos, sobreescribir el nombre con el que viene de la API si es más completo.
                if (data.length > 0 && data[0].apellidosNombresCompletos) {
                    setSpecialistInfo(prev => ({ ...prev, nombre: data[0].apellidosNombresCompletos }));
                }

            } catch (err) {
                console.error("Error al cargar la disponibilidad:", err);
                setError("No se pudo cargar tu horario. Por favor, intenta recargar la página.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDisponibilidad();
    }, []); // El array de dependencias vacío asegura que se ejecute solo al montar.

    // Efecto para ocultar los mensajes de éxito/error después de unos segundos.
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage('');
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error]);


    // ---- MANEJADORES DE EVENTOS ----

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
        // Por defecto, crear un bloque de 90 minutos
        const endMinutes = startMinutes + 90; 
        const formatMinutesToHHMM = (mins) => {
            const h = String(Math.floor(mins / 60)).padStart(2, '0');
            const m = String(mins % 60).padStart(2, '0');
            return `${h}${m}`;
        };

        const newRecord = {
            _id: `draft_${Date.now()}`, // ID temporal para un nuevo registro
            dia,
            franja: `${formatMinutesToHHMM(startMinutes)}-${formatMinutesToHHMM(endMinutes)}`,
            sede1DePreferenciaPresencial: '',
            horasDisponiblesParaRealizarAcompaniamientoPresencial: 1.5,
        };
        handleOpenModal(newRecord);
    };
    
    /**
     * Guarda un registro localmente. Si es nuevo, lo añade. Si existe, lo actualiza.
     * Implementa una lógica de fusión para evitar solapamientos.
     */
    const handleLocalSave = useCallback((recordToSave) => {
        // --- Lógica de Fusión de Horarios ---
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
        let mergedHours = finalRecord.horasDisponiblesParaRealizarAcompaniamientoPresencial;

        otherRecordsOnSameDay.forEach(existing => {
            const [existingStartMin, existingEndMin] = formatFranjaForAPI(existing.franja).split('-').map(timeStringToMinutes);
            // Comprobar si hay solapamiento o son adyacentes
            if (mergedStartMin <= existingEndMin && mergedEndMin >= existingStartMin) {
                mergedStartMin = Math.min(mergedStartMin, existingStartMin);
                mergedEndMin = Math.max(mergedEndMin, existingEndMin);
                // No sumar horas, se calcula en base a la franja final
                overlappingRecordsIds.add(existing._id);
            }
        });

        const formatMinutesToHHMM = (mins) => {
            const h = String(Math.floor(mins / 60)).padStart(2, '0');
            const m = String(mins % 60).padStart(2, '0');
            return `${h}${m}`;
        };
        
        // Recalcular horas en base a la franja final
        mergedHours = (mergedEndMin - mergedStartMin) / 60;

        finalRecord.franja = `${formatMinutesToHHMM(mergedStartMin)}-${formatMinutesToHHMM(mergedEndMin)}`;
        finalRecord.horasDisponiblesParaRealizarAcompaniamientoPresencial = mergedHours;
        
        setDisponibilidad(prev => {
            // Filtrar los registros que fueron fusionados
            const nonMerged = prev.filter(r => !overlappingRecordsIds.has(r._id));
            // Añadir el nuevo registro (ya fusionado)
            return [...nonMerged, { ...finalRecord, _id: finalRecord._id.toString().startsWith('draft_') ? `saved_${Date.now()}` : finalRecord._id }];
        });
        
        setSuccessMessage('Cambio guardado localmente. Pulsa "Guardar en Servidor" para confirmar.');
    }, [disponibilidad]);

    const handleLocalDelete = useCallback((recordIdToDelete) => {
        setDisponibilidad(prev => prev.filter(r => r._id !== recordIdToDelete));
        setSuccessMessage('Bloque eliminado localmente. Pulsa "Guardar en Servidor" para confirmar.');
    }, []);

    /**
     * Guarda TODO el calendario en el servidor.
     */
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

        // Formatear el payload para la API
        const payload = disponibilidad.map(r => ({
            dni,
            apellidosNombresCompletos: nombre,
            dia: r.dia,
            franja: formatFranjaForAPI(r.franja).replace('-', ' - '), // Asegura formato "HHMM - HHMM"
            turno: timeStringToMinutes(formatFranjaForAPI(r.franja).split('-')[0]) < 720 ? "M" : "T", // Antes de las 12:00 es Mañana
            sede1DePreferenciaPresencial: r.sede1DePreferenciaPresencial,
            horasDisponiblesParaRealizarAcompaniamientoPresencial: r.horasDisponiblesParaRealizarAcompaniamientoPresencial
        }));

        try {
            const response = await fetch(`https://kali-ad-web.beesoftware.net/api/disponibilidad-acompaniamiento/especialista/${dni}/calendario`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Error del servidor: ${response.status}`);
            }
            
            // Sincronizar el estado local con la respuesta del servidor
            const processedData = result.nuevoCalendario.map(item => ({
                ...item,
                dia: (item.dia || '').toUpperCase().trim(),
                franja: (item.franja || '').replace(/\s/g, ''),
                horasDisponiblesParaRealizarAcompaniamientoPresencial: parseFloat(item.horasDisponiblesParaRealizarAcompaniamientoPresencial) || 0
            }));

            setDisponibilidad(processedData);
            setInitialDisponibilidad(JSON.parse(JSON.stringify(processedData))); // Actualizar estado inicial

            setSuccessMessage(result.message || "Calendario actualizado exitosamente.");

        } catch (err) {
            console.error("Error al guardar el calendario:", err);
            setError(err.message || "No se pudo guardar el calendario. Revisa la consola para más detalles.");
        } finally {
            setIsSaving(false);
        }
    };

    // ---- CÁLCULOS Y MEMOS ----
    const totalHorasSemana = useMemo(() => {
        return disponibilidad.reduce((total, record) => total + (record.horasDisponiblesParaRealizarAcompaniamientoPresencial || 0), 0);
    }, [disponibilidad]);
    
    const hasChanges = useMemo(() => {
        return JSON.stringify(disponibilidad) !== JSON.stringify(initialDisponibilidad);
    }, [disponibilidad, initialDisponibilidad]);

    // ---- RENDERIZADO ----
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
                {/* Mensajes de feedback */}
                {error && <div className="fixed top-5 right-5 z-[100] p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg shadow-lg flex items-center"><AlertTriangle className="h-5 w-5 mr-3"/>{error}</div>}
                {successMessage && <div className="fixed top-5 right-5 z-[100] p-4 bg-green-100 text-green-800 border border-green-300 rounded-lg shadow-lg flex items-center"><CheckCircle className="h-5 w-5 mr-3"/>{successMessage}</div>}

                {/* Encabezado */}
                <header className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Mi Disponibilidad Horaria</h1>
                    <div className="text-gray-600 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>{specialistInfo.nombre}</span>
                        <span className="hidden sm:inline">|</span>
                        <span>DNI: {specialistInfo.dni}</span>
                    </div>
                </header>

                {/* Resumen y Acciones */}
                <div className="bg-white rounded-t-lg shadow-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center text-lg text-gray-700">
                        <Briefcase className="w-6 h-6 mr-3 text-teal-600"/>
                        <span>Total de Horas Presenciales:</span>
                        <span className="font-bold text-teal-700 ml-2">{totalHorasSemana.toFixed(1)}h</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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

                {/* Calendario */}
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
                .btn-primary { padding: 0.6rem 1.25rem; background-color: #0D9488; color: white; border-radius: 0.375rem; font-weight: 500; transition: all 0.2s; border: 1px solid transparent; }
                .btn-primary:hover { background-color: #0F766E; }
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
