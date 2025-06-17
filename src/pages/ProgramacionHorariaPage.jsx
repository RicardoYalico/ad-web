import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { UploadCloud, ListChecks, AlertTriangle, Download, Loader2, FileText as IconFileText, CalendarClock, XCircle, Search, Trash2, ChevronDown, BarChart3, History } from 'lucide-react';

// --- CONFIGURACIÓN ---
const API_BASE_URL = 'https://kali-ad-web.beesoftware.net/api/programacion-horaria';
const BATCH_SIZE = 1000;

const PROGRAMACION_HORARIA_API_KEYS = [
    "semestre", "fechaProgramacion", "periodo", "campus", "facultad", "codDuenioCurso", "duenioCurso",
    "codCurso", "nombreCurso", "hrsPlanCurso", "nrc", "seccion",
    "estatus", "lstCrz", "origenLstCrz", "sobrepasoAula", "tipHor", "metEdu",
    "maximo", "real", "restante", "hrsCredito", "idDocente", "idRrhh",
    "docente", "idPrinc", "tipoJornada", "estadoDocente", "motivo",
    "fechaInicio", "fechaFin", "dia", "hora", "turno", "edificio", "aula",
    "tipoAmbiente", "inExPrograma", "codProgramasCompartidos", "programasCompartidos",
    "inExCampus", "campus2", "tipoRequisito", "requisitos", "bloquesHorarios",
    "inExAtributo", "atributos", "inExCohorte", "cohortes", "atributosBolson"
];

// --- FUNCIONES DE AYUDA ---
const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('es-PE', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: '2-digit', timeZone: 'America/Lima'
        });
    } catch (e) {
        return 'Fecha inválida';
    }
};

const ProgramacionHorariaPage = () => {
    // --- ESTADOS ---
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);
    const [processStatus, setProcessStatus] = useState('');
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [apiError, setApiError] = useState(null);
    const fileInputRef = useRef(null);

    const [selectedSemester, setSelectedSemester] = useState('');
    const [programmingDate, setProgrammingDate] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [fileName, setFileName] = useState('');

    const [filterSemester, setFilterSemester] = useState('');
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [hasSearched, setHasSearched] = useState(false);

    // --- ESTADOS PARA EL REPORTE Y MODAL DE ELIMINACIÓN ---
    const [reportData, setReportData] = useState(null);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [expandedSemesters, setExpandedSemesters] = useState({});
    const [deleteConfirmation, setDeleteConfirmation] = useState(null); // { semestre, fechaProgramacion }

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalDocs, setTotalDocs] = useState(0);
    const [limit] = useState(50);
    
    const semesterOptions = useMemo(() => ['2024-1', '2024-2', '2025-1', '2025-2'], []);

    const tableDisplayColumns = useMemo(() => [
        { header: "Semestre", accessor: "semestre" }, { header: "Docente", accessor: "docente" }, 
        { header: "Curso", accessor: "nombreCurso" }, { header: "NRC", accessor: "nrc" }, 
        { header: "Campus", accessor: "campus" }, { header: "Periodo", accessor: "periodo" }, 
        { header: "Día", accessor: "dia" }, { header: "Hora", accessor: "hora" }
    ], []);
    
    // --- LÓGICA DE DATOS ---
    const fetchReport = useCallback(async () => {
        setIsReportLoading(true);
        setReportError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/reporte`);
            if (!response.ok) throw new Error(`Error en la API de reportes: ${response.status}`);
            const data = await response.json();
            const grouped = data.reduce((acc, item) => {
                (acc[item.semestre] = acc[item.semestre] || []).push(item);
                return acc;
            }, {});
            for (const semestre in grouped) {
                grouped[semestre].sort((a, b) => new Date(b.fechaProgramacion) - new Date(a.fechaProgramacion));
            }
            const orderedGroupedData = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
                .reduce((obj, key) => { (obj[key] = grouped[key]); return obj; }, {});
            setReportData(orderedGroupedData);
        } catch (err) {
            setReportError(err.message);
        } finally {
            setIsReportLoading(false);
        }
    }, []);
    
    const toggleSemesterExpansion = (semestre) => {
        setExpandedSemesters(prev => ({ ...prev, [semestre]: !prev[semestre] }));
    };

    const toggleReport = () => {
        const newShowState = !showReport;
        setShowReport(newShowState);
        if (newShowState && !reportData) {
            fetchReport();
        }
    };

    const fetchProgramaciones = useCallback(async (semester, date, page = 1) => {
        if (!semester || !date) {
            setRecords([]);
            setApiError("Por favor, seleccione un semestre y una fecha para buscar.");
            return;
        }
        setIsLoading(true);
        setApiError(null);
        setHasSearched(true);
        try {
            const url = new URL(API_BASE_URL);
            url.searchParams.append('semestre', semester);
            url.searchParams.append('fechaCarga', date);
            url.searchParams.append('page', page);
            url.searchParams.append('limit', limit);
            
            const response = await fetch(url.toString());
            const responseJson = await response.json();
            if (!response.ok) throw new Error(responseJson.message || `Error HTTP: ${response.status}`);
            
            setRecords(responseJson.data.map(r => ({ ...r, id: r._id })));
            setCurrentPage(responseJson.currentPage || 1);
            setTotalPages(responseJson.totalPages || 0);
            setTotalDocs(responseJson.totalDocs || 0);
        } catch (error) {
            setApiError(error.message);
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchProgramaciones(filterSemester, filterDate, 1);
    };

    const handleUploadClick = useCallback(async () => {
        if (!parsedData || !selectedSemester || !programmingDate) {
            setUploadError("Por favor, seleccione semestre, fecha y archivo.");
            return;
        }

        setIsProcessing(true);
        setUploadError(null);
        setUploadSuccess(null);
        setApiError(null);
        setProcessProgress(0);

        try {
            setProcessStatus(`Eliminando datos para ${selectedSemester} del ${programmingDate}...`);
            await fetch(`${API_BASE_URL}/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semestre: selectedSemester, fechaCarga: programmingDate }),
            });
            
            setProcessProgress(20);

            const validPayloads = parsedData.map(({ record: rawRecord }) => {
                const hasData = Object.values(rawRecord).some(value => value !== null && String(value).trim() !== '');
                if (!hasData) return null;
                const payload = { semestre: selectedSemester, fechaProgramacion: programmingDate };
                PROGRAMACION_HORARIA_API_KEYS.forEach(apiKey => {
                    if (apiKey !== 'semestre' && apiKey !== 'fechaProgramacion') {
                        payload[apiKey] = rawRecord[apiKey] !== undefined && rawRecord[apiKey] !== null ? String(rawRecord[apiKey]).trim() : '';
                    }
                });
                return payload;
            }).filter(p => p);

            if (validPayloads.length === 0) {
                setUploadSuccess("No se encontraron registros nuevos. Datos anteriores eliminados.");
                resetUploadState();
                fetchReport();
                return;
            }
            
            const totalRecords = validPayloads.length;
            let successfulInserts = 0;
            for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
                const batch = validPayloads.slice(i, i + BATCH_SIZE);
                setProcessStatus(`Cargando lote ${Math.ceil((i + 1) / BATCH_SIZE)} para ${selectedSemester}...`);
                const response = await fetch(`${API_BASE_URL}/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(batch),
                });
                const responseData = await response.json();
                if (!response.ok) throw new Error(responseData.message || 'Error en carga');
                successfulInserts += responseData.insertedCount || 0;
                setProcessProgress(20 + ((i + batch.length) / totalRecords) * 80);
            }

            setUploadSuccess(`Proceso completado. Registros procesados: ${successfulInserts}.`);
            resetUploadState();
            fetchReport(); // Actualiza el reporte
            if (selectedSemester === filterSemester) handleSearchClick();
        } catch (error) {
            setUploadError(`Fallo el proceso: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setProcessStatus('');
        }
    }, [parsedData, selectedSemester, programmingDate, filterSemester, handleSearchClick, fetchReport]);
    
    const handleDeleteReportClick = (item) => {
        setDeleteConfirmation(item);
    };
    
    const confirmDeleteReport = async () => {
        if (!deleteConfirmation) return;

        setIsProcessing(true);
        setProcessStatus(`Eliminando reporte del ${deleteConfirmation.fechaProgramacion}...`);
        try {
            const response = await fetch(`${API_BASE_URL}/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semestre: deleteConfirmation.semestre,
                    fechaCarga: deleteConfirmation.fechaProgramacion
                })
            });
            if (!response.ok && response.status !== 404) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Error del servidor');
            }
            setUploadSuccess(`Reporte del ${deleteConfirmation.fechaProgramacion} eliminado.`);
            fetchReport();
        } catch (err) {
            setUploadError(`Error al eliminar: ${err.message}`);
        } finally {
            setIsProcessing(false);
            setDeleteConfirmation(null);
            setProcessStatus('');
        }
    };


    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        resetUploadState(false);
        setFileName(file.name);
        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            setTimeout(async () => {
                try {
                    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false });
                    setParsedData(jsonData.map((row, index) => ({ record: row, originalIndex: index + 2 })));
                } catch (err) {
                    setUploadError(`Error al leer archivo: ${err.message}`);
                    resetUploadState();
                } finally {
                    setIsLoading(false);
                }
            }, 50); // Pequeño delay para permitir la actualización de la UI
        };
        reader.onerror = () => { setIsLoading(false); setUploadError("No se pudo leer el archivo."); };
        reader.readAsArrayBuffer(file);
    };
    
    const handleDownloadTemplate = async () => {
        try {
            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
            const templateHeaders = PROGRAMACION_HORARIA_API_KEYS.filter(k => k !== 'semestre' && k !== 'fechaProgramacion');
            const ws = XLSX.utils.aoa_to_sheet([templateHeaders]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
            XLSX.writeFile(wb, "Plantilla_Programacion_Horaria.xlsx");
        } catch (err) {
            setUploadError("Error al generar la plantilla.");
        }
    };
    
    const resetUploadState = (resetSelections = true) => {
        setParsedData(null);
        setFileName('');
        if(resetSelections) {
            setSelectedSemester('');
            setProgrammingDate('');
        }
        if (fileInputRef.current) fileInputRef.current.value = null;
        setUploadError(null);
    };
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
           fetchProgramaciones(filterSemester, filterDate, newPage);
        }
    };
    
    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <header className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
                    <CalendarClock className="mr-3 text-indigo-600" size={36} /> Gestión de Programación Horaria
                </h1>
            </header>

            {apiError && <Notification type="error" title="Error de API" message={apiError} onDismiss={() => setApiError(null)} />}
            {uploadError && <Notification type="error" title="Error en Proceso" message={uploadError} onDismiss={() => setUploadError(null)} />}
            {uploadSuccess && <Notification type="success" title="Éxito" message={uploadSuccess} onDismiss={() => setUploadSuccess(null)} />}

            {deleteConfirmation && (
                <ConfirmationModal 
                    title="Confirmar Eliminación"
                    message={`¿Está seguro de que desea eliminar todos los registros del semestre ${deleteConfirmation.semestre} para la fecha de programación ${deleteConfirmation.fechaProgramacion}? Esta acción no se puede deshacer.`}
                    onConfirm={confirmDeleteReport}
                    onCancel={() => setDeleteConfirmation(null)}
                />
            )}

            <section className="mb-8 p-4 md:p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
                    <UploadCloud className="mr-2 text-green-600" /> Carga Masiva
                </h2>
                {isProcessing ? (
                     <div className="my-4">
                        <p className="text-lg text-blue-700 font-medium text-center mb-2">{processStatus}</p>
                        <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-blue-600 h-4 rounded-full" style={{ width: `${processProgress}%` }}></div></div>
                        <p className="text-center text-sm text-gray-600 mt-1">{Math.round(processProgress)}%</p>
                    </div>
                ) : (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700">1. Semestre</label>
                                <select id="semester-select" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="" disabled>-- Elija --</option>
                                    {semesterOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="programming-date" className="block text-sm font-medium text-gray-700">2. Fecha Programación</label>
                                <input type="date" id="programming-date" value={programmingDate} onChange={(e) => setProgrammingDate(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
                            </div>
                            <div>
                                <label htmlFor="file-upload-prog" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-prog" type="file" ref={fileInputRef} onChange={handleFileSelect}
                                    accept=".xlsx, .xls" disabled={!selectedSemester || !programmingDate}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </div>
                        </div>

                        {isLoading && !isProcessing && <div className="flex items-center text-gray-600 pt-2"><Loader2 className="animate-spin h-4 w-4 mr-2" />Procesando archivo...</div>}

                        {parsedData && (
                            <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para actualizar:</p>
                                        <p className="text-sm text-gray-700">{fileName} ({parsedData.length} registros)</p>
                                    </div>
                                    <button onClick={() => resetUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleUploadClick}
                                        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2"/>
                                        Actualizar Datos del {programmingDate}
                                    </button>
                                </div>
                            </div>
                        )}
                        <button onClick={handleDownloadTemplate} disabled={isProcessing} className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <Download size={14} className="mr-2" /> Descargar Plantilla XLSX
                        </button>
                    </div>
                )}
            </section>

            <div className="mb-8 bg-white rounded-xl shadow-lg">
                <button onClick={toggleReport} className="w-full flex justify-between items-center p-4 text-left">
                    <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                        <History className="mr-2 text-indigo-600" /> Historial de Cargas
                    </h2>
                    <ChevronDown className={`transform transition-transform duration-300 ${showReport ? 'rotate-180' : ''}`} />
                </button>
                {showReport && (
                    <div className="p-4 md:p-6 border-t">
                        {isReportLoading ? (
                             <div className="flex items-center justify-center p-5"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>
                        ) : reportError ? (
                             <Notification type="error" title="Error de Reporte" message={reportError} onDismiss={() => setReportError(null)} />
                        ) : (
                             <div className="space-y-8">
                                {reportData && Object.keys(reportData).length > 0 ? Object.keys(reportData).map(semestre => {
                                    const [mostRecent, ...olderReports] = reportData[semestre];
                                    return (
                                        <div key={semestre}>
                                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Semestre: {semestre}</h3>
                                            <div className="relative bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 mb-4 shadow">
                                                <p className="font-bold text-blue-800">Carga más reciente</p>
                                                <p><span className="font-semibold">Fecha Programación:</span> {mostRecent.fechaProgramacion}</p>
                                                <p><span className="font-semibold">Registros:</span> {mostRecent.cantidad.toLocaleString()}</p>
                                                <p className="text-sm text-gray-600 mt-1">Actualizado: {formatDateTime(mostRecent.ultimaActualizacion)}</p>
                                                <button onClick={() => handleDeleteReportClick(mostRecent)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                            
                                            {olderReports.length > 0 && (
                                                <div>
                                                    <button onClick={() => toggleSemesterExpansion(semestre)} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center mb-2">
                                                        {expandedSemesters[semestre] ? 'Ocultar historial' : `Ver ${olderReports.length} cargas anteriores`}
                                                        <ChevronDown className={`ml-1 transform transition-transform duration-200 ${expandedSemesters[semestre] ? 'rotate-180' : ''}`} size={16}/>
                                                    </button>
                                                    {expandedSemesters[semestre] && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {olderReports.map((item, index) => (
                                                                <div key={index} className="relative bg-gray-50 border rounded-lg p-3 text-sm">
                                                                    <p className="font-bold">{item.fechaProgramacion}</p>
                                                                    <p>Registros: {item.cantidad.toLocaleString()}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Actualizado: {formatDateTime(item.ultimaActualizacion)}</p>
                                                                    <button onClick={() => handleDeleteReportClick(item)} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={14}/></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }) : <p className="text-gray-500">No hay reportes de carga disponibles.</p>}
                             </div>
                        )}
                    </div>
                )}
            </div>

            <section className="bg-white rounded-xl shadow-lg p-4 md:p-6">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-2xl font-semibold text-gray-700 flex items-center shrink-0">
                        <ListChecks className="mr-2 text-indigo-600" /> Consultar Registros
                    </h2>
                    <div className="w-full flex flex-col md:flex-row md:items-end gap-3 bg-gray-50 p-3 rounded-lg border">
                        <div className="flex-1">
                             <label htmlFor="filter-semester" className="block text-sm font-medium text-gray-700">Semestre</label>
                             <select id="filter-semester" value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="" disabled>-- Elija --</option>
                                {semesterOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                             <label htmlFor="filter-date" className="block text-sm font-medium text-gray-700">Fecha de Carga</label>
                             <input type="date" id="filter-date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
                        </div>
                        <button onClick={handleSearchClick} disabled={isLoading || !filterSemester || !filterDate}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            <Search size={18} className="mr-2 -ml-1"/>
                            Buscar
                        </button>
                    </div>
                </div>

                {isLoading && !isProcessing ? (
                    <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /><p className="ml-3">Buscando registros...</p></div>
                ) : !hasSearched ? (
                    <div className="text-center py-10">
                        <IconFileText size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-lg text-gray-500">Seleccione los filtros para ver los registros.</p>
                        <p className="text-sm text-gray-400">La consulta traerá la última carga del día seleccionado.</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-10">
                        <IconFileText size={48} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-lg text-gray-500">No se encontraron registros para los filtros seleccionados.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-gray-600 mb-2">Mostrando <strong>{records.length}</strong> de <strong>{totalDocs}</strong> registros.</div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>{tableDisplayColumns.map(col => <th key={col.accessor} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{col.header}</th>)}</tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {records.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            {tableDisplayColumns.map(col => <td key={col.accessor} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{record[col.accessor] || 'N/A'}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <PaginationControl currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} isLoading={isLoading} />
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

const Notification = ({ type, title, message, onDismiss }) => (
    <div className={`mb-4 p-4 rounded-md shadow-md flex items-start ${type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500'}`} role="alert">
        <AlertTriangle className={`h-6 w-6 mr-3 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`} />
        <div className="flex-grow">
            <p className="font-bold">{title}</p>
            <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        {onDismiss && <button onClick={onDismiss} className="ml-4 text-2xl font-semibold leading-none hover:text-red-600">&times;</button>}
    </div>
);

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    Eliminar
                </button>
                <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                    Cancelar
                </button>
            </div>
        </div>
    </div>
);

const PaginationControl = ({ currentPage, totalPages, onPageChange, isLoading }) => (
    <div className="mt-6 flex justify-center items-center space-x-2">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1 || isLoading} className="pagination-btn">Primera</button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="pagination-btn">Anterior</button>
        <span className="text-sm text-gray-700">Página {currentPage} de {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="pagination-btn">Siguiente</button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || isLoading} className="pagination-btn">Última</button>
    </div>
);


export default ProgramacionHorariaPage;
