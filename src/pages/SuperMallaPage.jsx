import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Grid, UploadCloud, AlertTriangle, Download, Loader2, XCircle, Trash2, ChevronDown, History } from 'lucide-react';

// --- CONFIGURACIÓN ---
const API_BASE_URL = 'https://kali-ad-web.beesoftware.net/api/super-malla';
const BATCH_SIZE = 1000;

// Claves API para la Super Malla.
const SUPERMALLA_API_KEYS = [
    'facultad', 'unidNegocio', 'modaliadDeLaCarrera', 'malla', 'carerra',
    'ciclo', 'codigoOficial', 'curso', 'categoriaDelCurso', 'tipoDeEstudios',
    'modalidadCurso', 'tipoDeCurso'
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

const SuperMallaPage = () => {
    // --- ESTADOS ---
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processProgress, setProcessProgress] = useState(0);
    const [processStatus, setProcessStatus] = useState('');
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [apiError, setApiError] = useState(null);
    const fileInputRef = useRef(null);

    // Estados para la sección de carga
    const [selectedSemester, setSelectedSemester] = useState('');
    const [cargaDate, setCargaDate] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [fileName, setFileName] = useState('');

    // Estados para el historial y modal de eliminación
    const [reportData, setReportData] = useState(null);
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);
    const [showReport, setShowReport] = useState(true);
    const [expandedSemesters, setExpandedSemesters] = useState({});
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    const semesterOptions = useMemo(() => ['2024-1', '2024-2', '2025-1', '2025-2', '2026-1', '2026-2'], []);

    // --- LÓGICA DE DATOS ---
    const fetchReport = useCallback(async () => {
        setIsReportLoading(true);
        setReportError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/reporte`);
            if (!response.ok) throw new Error(`Error en la API de reportes: ${response.statusText}`);
            const data = await response.json();
            const grouped = data.reduce((acc, item) => {
                (acc[item.semestre] = acc[item.semestre] || []).push(item);
                return acc;
            }, {});
            for (const semestre in grouped) {
                grouped[semestre].sort((a, b) => new Date(b.fechaCarga) - new Date(a.fechaCarga));
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

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const toggleSemesterExpansion = (semestre) => {
        setExpandedSemesters(prev => ({ ...prev, [semestre]: !prev[semestre] }));
    };

    const toggleReport = () => {
        setShowReport(prev => !prev);
    };

    const handleUploadClick = useCallback(async () => {
        if (!parsedData || !selectedSemester || !cargaDate) {
            setUploadError("Por favor, seleccione semestre, fecha y un archivo válido.");
            return;
        }

        setIsProcessing(true);
        setUploadError(null);
        setUploadSuccess(null);
        setApiError(null);
        setProcessProgress(0);

        try {
            setProcessStatus(`Eliminando datos anteriores de Super Malla para ${selectedSemester} del ${cargaDate}...`);
            await fetch(`${API_BASE_URL}/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semestre: selectedSemester, fechaCarga: cargaDate }),
            });
            
            setProcessProgress(20);

            const validPayloads = parsedData.map(({ record: rawRecord }) => {
                const hasData = Object.values(rawRecord).some(value => value !== null && String(value).trim() !== '');
                if (!hasData) return null;

                const payload = { semestre: selectedSemester, fechaCarga: cargaDate };
                SUPERMALLA_API_KEYS.forEach(apiKey => {
                    payload[apiKey] = rawRecord[apiKey] !== undefined && rawRecord[apiKey] !== null ? String(rawRecord[apiKey]).trim() : '';
                });
                return payload;
            }).filter(p => p);

            if (validPayloads.length === 0) {
                setUploadSuccess("No se encontraron registros válidos para cargar. Los datos anteriores (si existían) han sido eliminados.");
                resetUploadState();
                fetchReport();
                setIsProcessing(false);
                return;
            }
            
            const totalRecords = validPayloads.length;
            let successfulInserts = 0;
            for (let i = 0; i < totalRecords; i += BATCH_SIZE) {
                const batch = validPayloads.slice(i, i + BATCH_SIZE);
                setProcessStatus(`Cargando lote de Super Malla ${Math.ceil((i + 1) / BATCH_SIZE)} de ${Math.ceil(totalRecords / BATCH_SIZE)}...`);
                const response = await fetch(`${API_BASE_URL}/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(batch),
                });
                const responseData = await response.json();
                if (!response.ok) throw new Error(responseData.message || 'Error en la carga masiva');
                successfulInserts += responseData.insertedCount || 0;
                setProcessProgress(20 + ((i + batch.length) / totalRecords) * 80);
            }

            setUploadSuccess(`Proceso completado. Registros de Super Malla cargados: ${successfulInserts}.`);
            resetUploadState();
            fetchReport();

        } catch (error) {
            setUploadError(`Fallo el proceso: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setProcessStatus('');
        }
    }, [parsedData, selectedSemester, cargaDate, fetchReport]);
    
    const handleDeleteReportClick = (item) => {
        setDeleteConfirmation(item);
    };
    
    const confirmDeleteReport = async () => {
        if (!deleteConfirmation) return;

        setIsProcessing(true);
        setProcessStatus(`Eliminando lote de Super Malla para ${deleteConfirmation.semestre} del ${deleteConfirmation.fechaCarga}...`);
        try {
            const response = await fetch(`${API_BASE_URL}/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    semestre: deleteConfirmation.semestre,
                    fechaCarga: deleteConfirmation.fechaCarga
                })
            });
            if (!response.ok && response.status !== 404) {
                 const errorData = await response.json();
                 throw new Error(errorData.message || 'Error del servidor al eliminar');
            }
            setUploadSuccess(`El lote de carga de Super Malla del ${deleteConfirmation.fechaCarga} fue eliminado.`);
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
                    setUploadError(`Error al leer el archivo: ${err.message}`);
                    resetUploadState();
                } finally {
                    setIsLoading(false);
                }
            }, 50);
        };
        reader.onerror = () => { setIsLoading(false); setUploadError("No se pudo leer el archivo."); };
        reader.readAsArrayBuffer(file);
    };
    
    const handleDownloadTemplate = async () => {
        try {
            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
            const templateHeaders = SUPERMALLA_API_KEYS;
            const ws = XLSX.utils.aoa_to_sheet([templateHeaders]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
            XLSX.writeFile(wb, "Plantilla_Super_Malla.xlsx");
        } catch (err) {
            setUploadError("Error al generar la plantilla.");
        }
    };
    
    const resetUploadState = (resetSelections = true) => {
        setParsedData(null);
        setFileName('');
        if(resetSelections) {
            setSelectedSemester('');
            setCargaDate('');
        }
        if (fileInputRef.current) fileInputRef.current.value = null;
        setUploadError(null);
    };
    
    return (
        <div className="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
            <header className="mb-6 md:mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center">
                    <Grid className="mr-3 text-indigo-600" size={36} /> Gestión de Super Malla
                </h1>
            </header>

            {apiError && <Notification type="error" title="Error de API" message={apiError} onDismiss={() => setApiError(null)} />}
            {uploadError && <Notification type="error" title="Error en Proceso" message={uploadError} onDismiss={() => setUploadError(null)} />}
            {uploadSuccess && <Notification type="success" title="Éxito" message={uploadSuccess} onDismiss={() => setUploadSuccess(null)} />}

            {deleteConfirmation && (
                <ConfirmationModal 
                    title="Confirmar Eliminación de Lote"
                    message={`¿Está seguro de que desea eliminar TODOS los registros de Super Malla del semestre ${deleteConfirmation.semestre} para la fecha de carga ${deleteConfirmation.fechaCarga}?`}
                    onConfirm={confirmDeleteReport}
                    onCancel={() => setDeleteConfirmation(null)}
                />
            )}
            
            <section className="mb-8 p-4 md:p-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center">
                    <UploadCloud className="mr-2 text-green-600" /> Carga Masiva de Super Malla
                </h2>
                {isProcessing && !deleteConfirmation ? (
                     <div className="my-4">
                        <p className="text-lg text-blue-700 font-medium text-center mb-2">{processStatus}</p>
                        <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-indigo-600 h-4 rounded-full" style={{ width: `${processProgress}%` }}></div></div>
                        <p className="text-center text-sm text-gray-600 mt-1">{Math.round(processProgress)}%</p>
                    </div>
                ) : (
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div>
                                <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700">1. Semestre de Carga</label>
                                <select id="semester-select" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                    <option value="" disabled>-- Elija un semestre --</option>
                                    {semesterOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="carga-date" className="block text-sm font-medium text-gray-700">2. Fecha de Carga</label>
                                <input type="date" id="carga-date" value={cargaDate} onChange={(e) => setCargaDate(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-2 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
                            </div>
                            <div>
                                <label htmlFor="file-upload-prog" className="block text-sm font-medium text-gray-700">3. Archivo (XLSX)</label>
                                <input id="file-upload-prog" type="file" ref={fileInputRef} onChange={handleFileSelect}
                                    accept=".xlsx, .xls" disabled={!selectedSemester || !cargaDate}
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed" />
                            </div>
                        </div>

                        {isLoading && !isProcessing && <div className="flex items-center text-gray-600 pt-2"><Loader2 className="animate-spin h-4 w-4 mr-2" />Procesando archivo...</div>}

                        {parsedData && (
                            <div className="mt-4 p-4 border-t border-gray-200 bg-green-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-green-800">Archivo listo para actualizar:</p>
                                        <p className="text-sm text-gray-700">{fileName} ({parsedData.length} registros detectados)</p>
                                    </div>
                                    <button onClick={() => resetUploadState(false)} className="text-gray-500 hover:text-red-600"><XCircle size={20} /></button>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleUploadClick}
                                        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                        <UploadCloud size={18} className="mr-2"/>
                                        Actualizar Super Malla del {cargaDate}
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

            <div className="bg-white rounded-xl shadow-lg">
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
                                            {mostRecent &&
                                                <div className="relative bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4 mb-4 shadow">
                                                    <p className="font-bold text-indigo-800">Carga más reciente</p>
                                                    <p><span className="font-semibold">Fecha de Carga:</span> {mostRecent.fechaCarga}</p>
                                                    <p><span className="font-semibold">Registros:</span> {mostRecent.cantidad.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-600 mt-1">Subido: {formatDateTime(mostRecent.ultimaActualizacion)}</p>
                                                    <button onClick={() => handleDeleteReportClick(mostRecent)} disabled={isProcessing} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={16}/></button>
                                                </div>
                                            }
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
                                                                    <p className="font-bold">{item.fechaCarga}</p>
                                                                    <p>Registros: {item.cantidad.toLocaleString()}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">Subido: {formatDateTime(item.ultimaActualizacion)}</p>
                                                                    <button onClick={() => handleDeleteReportClick(item)} disabled={isProcessing} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={14}/></button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }) : <p className="text-gray-500">No hay lotes de Super Malla cargados.</p>}
                             </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Componentes Auxiliares ---

const Notification = ({ type, title, message, onDismiss }) => (
    <div className={`mb-4 p-4 rounded-md shadow-md flex items-start ${type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500'}`} role="alert">
        <AlertTriangle className={`h-6 w-6 mr-3 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`} />
        <div className="flex-grow">
            <p className="font-bold">{title}</p>
            <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
        {onDismiss && <button onClick={onDismiss} className="ml-4 -mt-2 -mr-2 p-1 rounded-full hover:bg-black/10"><XCircle size={20}/></button>}
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

export default SuperMallaPage;
