import React, { useState, useEffect } from 'react';

// --- Iconos ---
const FileIconBase = ({ children, colorClass = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 ${colorClass} flex-shrink-0`}>
    {children}
  </svg>
);

const PDFFileIcon = () => (
  <FileIconBase colorClass="text-red-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </FileIconBase>
);

const ExcelFileIcon = () => (
  <FileIconBase colorClass="text-green-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M15.5 13H8.5V10H12v.5c0 .8.7 1.5 1.5 1.5H12v.5c0 .8.7 1.5 1.5 1.5h0zm-3.5 4H8.5v-2H12v.5c0 .8.7 1.5 1.5 1.5H12v.5c0 .8.7 1.5 1.5 1.5h0z"/>
  </FileIconBase>
);

const WordFileIcon = () => (
  <FileIconBase colorClass="text-blue-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <path d="M10.4,17.9H8.6l-1-3.8h-1v3.8H5V11.1h3.7c1.2,0,2,0.5,2,1.6c0,0.7-0.3,1.2-0.9,1.4L10.4,17.9z M7.6,13.8h0.8c0.5,0,0.8-0.2,0.8-0.6s-0.3-0.6-0.8-0.6H7.6V13.8z"/>
  </FileIconBase>
);

const PowerPointFileIcon = () => (
 <FileIconBase colorClass="text-orange-600">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
     <path d="M12 11h-1v2h1c.828 0 1.5.672 1.5 1.5S12.828 16 12 16H9.5V11H8M14 11h1.5a1.5 1.5 0 010 3H14M14 14h1.5a1.5 1.5 0 010 3H14"/>
 </FileIconBase>
);

const GenericFileIcon = () => (
 <FileIconBase>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
 </FileIconBase>
);

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-blue-500">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const CheckSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-sky-600">
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

const CancelIcon = () => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ClockIcon = () => ( // Icono para estado Pendiente
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const CheckCircleIcon = () => ( // Icono para estado Completo
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);


// --- Definición de Criterios para Checklist ---
const criteriosFormaEspecialista = [
  { id: 'forma_esp_documento_completo', label: 'Documento completo y bien estructurado.' },
  { id: 'forma_esp_formato_correcto', label: 'Formato según especificaciones (márgenes, fuente, etc.).' },
  { id: 'forma_esp_ortografia_gramatica', label: 'Ortografía y gramática revisadas y correctas.' },
  { id: 'forma_esp_referencias_adecuadas', label: 'Referencias y citas en formato adecuado.' },
  { id: 'forma_esp_claridad_graficos', label: 'Tablas, gráficos e imágenes claras y con leyenda.' },
];

const criteriosCalidadCoordinadora = [
  { id: 'calidad_coord_objetivos_curso', label: 'Contenido alineado con los objetivos del curso/módulo.' },
  { id: 'calidad_coord_claridad_contenido', label: 'Claridad, coherencia y pertinencia del contenido.' },
  { id: 'calidad_coord_actualizacion_material', label: 'Material actualizado y relevante.' },
  { id: 'calidad_coord_actividades_pertinentes', label: 'Actividades y evaluaciones pertinentes.' },
  { id: 'calidad_coord_recursos_adicionales', label: 'Inclusión de recursos adicionales de valor.' },
];


// --- Componente Interno VisorDetalleArchivosInterno ---
function VisorDetalleArchivosInterno({ elementoNombre, archivos, datosAdicionales, isLoading = false, error = null }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checklistStatus, setChecklistStatus] = useState({}); 
  const [savedChecklistStatus, setSavedChecklistStatus] = useState({});
  const [isChecklistEditing, setIsChecklistEditing] = useState(false);

  const archivoActual = archivos && archivos.length > 0 ? archivos[currentIndex] : null;

  const getFileType = (extension) => {
    if (!extension) return 'unknown';
    const ext = extension.startsWith('.') ? extension.substring(1).toLowerCase() : extension.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['xlsx', 'xlsm'].includes(ext)) return 'excel';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    return 'other';
  };

  const fileType = archivoActual ? getFileType(archivoActual.extension) : 'unknown';

  useEffect(() => {
    setCurrentIndex(0); 
    setChecklistStatus({}); 
    setSavedChecklistStatus({}); 
    setIsChecklistEditing(false); 
  }, [archivos]);
  
  const irAnterior = () => {
    if (isChecklistEditing) {
        // console.warn("Navegación mientras se edita el checklist. Considere guardar o cancelar.");
    }
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const irSiguiente = () => {
    if (isChecklistEditing) {
        // Opcional: Advertir al usuario
    }
    setCurrentIndex((prev) => (archivos && prev < archivos.length - 1 ? prev + 1 : prev));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateString)); }
    catch (e) { return dateString; }
  };

  const handleChecklistChange = (criterionId) => {
    if (!isChecklistEditing) return; 
    setChecklistStatus(prevStatus => ({
      ...prevStatus,
      [criterionId]: !prevStatus[criterionId]
    }));
  };

  const handleEditChecklist = () => {
    setIsChecklistEditing(true);
  };

  const handleSaveChecklist = () => {
    setSavedChecklistStatus({ ...checklistStatus }); 
    setIsChecklistEditing(false);
    // console.log("Checklist guardado:", checklistStatus);
  };

  const handleCancelChecklist = () => {
    setChecklistStatus({ ...savedChecklistStatus }); 
    setIsChecklistEditing(false);
  };

  // --- Cálculo de estados del checklist ---
  const getChecklistCompletionStatus = (criteriaList, savedStatus) => {
    if (Object.keys(savedStatus).length === 0 && criteriaList.length > 0) {
        return 'pendiente'; // Si no se ha guardado nada, está pendiente
    }
    const checkedCount = criteriaList.reduce((count, criterion) => {
        return savedStatus[criterion.id] ? count + 1 : count;
    }, 0);

    if (checkedCount === 0 && criteriaList.length > 0) return 'pendiente'; // Ninguno marcado
    if (checkedCount === criteriaList.length) return 'completo'; // Todos marcados
    return 'pendiente'; // Algunos marcados o ninguno (lo trata como pendiente)
  };

  const especialistaStatus = getChecklistCompletionStatus(criteriosFormaEspecialista, savedChecklistStatus);
  const coordinadoraStatus = getChecklistCompletionStatus(criteriosCalidadCoordinadora, savedChecklistStatus);

  const StatusIndicator = ({ role, status }) => {
    let bgColor, textColor, IconComponent, statusText;

    if (status === 'completo') {
        bgColor = 'bg-green-100';
        textColor = 'text-green-700';
        IconComponent = CheckCircleIcon;
        statusText = 'Completo';
    } else { // 'pendiente' o cualquier otro caso
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-700';
        IconComponent = ClockIcon;
        statusText = 'Pendiente';
    }

    return (
        <div className={`p-3 rounded-lg shadow-sm flex items-center ${bgColor} ${textColor}`}>
            <IconComponent />
            <div>
                <p className="font-semibold text-sm">{role}</p>
                <p className="text-xs">{statusText}</p>
            </div>
        </div>
    );
  };


  if (isLoading && (!archivos || archivos.length === 0) && !datosAdicionales) { 
    return ( <div className="bg-white shadow-lg rounded-xl p-6 md:p-8"> <div className="flex justify-center items-center py-10"> <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div> <p className="ml-3 text-gray-600">Cargando información y documentos...</p> </div> </div> );
  }

  if (error) {
    return ( 
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{typeof error === 'string' ? error : 'Ha ocurrido un problema al cargar los datos.'}</p>
        </div> 
    );
  }
  
  const iframeHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(100vh - 450px)' : 'calc(100vh - 390px)'; 

  const renderFileIcon = () => {
    switch (fileType) {
      case 'pdf': return <PDFFileIcon />;
      case 'excel': return <ExcelFileIcon />;
      case 'word': return <WordFileIcon />;
      case 'powerpoint': return <PowerPointFileIcon />;
      default: return <GenericFileIcon />;
    }
  };

  const officeViewerUrl = archivoActual && ['excel', 'word', 'powerpoint'].includes(fileType) && archivoActual.url && archivoActual.url !== "#"
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(archivoActual.url)}`
    : null;

  return (
    <div className="bg-white shadow-2xl rounded-xl p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
      <header className="mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          {elementoNombre || "Visor de Documentos"}
        </h2>
      </header>

      {/* --- INICIO: Indicadores de Estado de Revisión --- */}
      <section className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatusIndicator role="Especialista Revisor (Forma)" status={especialistaStatus} />
        <StatusIndicator role="Coordinadora (Calidad)" status={coordinadoraStatus} />
      </section>
      {/* --- FIN: Indicadores de Estado de Revisión --- */}

      {datosAdicionales && Object.keys(datosAdicionales).length > 0 && (
        <section className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-3 flex items-center"> <InfoIcon /> Información Detallada </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 text-sm">
            {Object.entries(datosAdicionales).map(([key, value]) => (
              <div key={key} className="p-2 bg-white rounded-md shadow-sm border border-slate-100 break-words">
                <dt className="font-medium text-slate-600 capitalize">{key.replace(/_/g, ' ').toLowerCase()}:</dt>
                <dd className="text-slate-800 mt-0.5"> {key.toLowerCase().includes('fecha') ? formatDate(value) : (value || 'N/A')} </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      
      {isLoading && (!archivos || archivos.length === 0) && !error && ( 
        <div className="flex justify-center items-center py-10"> <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div> <p className="ml-3 text-gray-500">Cargando lista de archivos...</p> </div>
      )}

      {!isLoading && (!archivos || archivos.length === 0) && !error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-3 sm:p-4 rounded-md mt-4" role="alert">
          <p className="font-medium text-sm sm:text-base">No hay archivos para mostrar.</p>
        </div>
      )}

      {archivos && archivos.length > 0 && archivoActual && (
        <>
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-100 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
              <div className="flex items-center w-full sm:w-auto min-w-0"> {renderFileIcon()} <h3 className="text-sm sm:text-md md:text-lg font-semibold text-gray-700 truncate flex-grow" title={archivoActual.filename}> {archivoActual.filename || `Archivo ${currentIndex + 1}`} </h3> </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"> <button onClick={irAnterior} disabled={currentIndex === 0} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm" aria-label="Anterior"> <ChevronLeftIcon /> <span className="ml-1 hidden md:inline">Anterior</span> </button> <span className="text-xs sm:text-sm text-gray-600 px-1 sm:px-2"> {currentIndex + 1} de {archivos.length} </span> <button onClick={irSiguiente} disabled={currentIndex === archivos.length - 1} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center text-xs sm:text-sm" aria-label="Siguiente"> <span className="mr-1 hidden md:inline">Siguiente</span> <ChevronRightIcon /> </button> </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden shadow-inner bg-slate-100" style={{ height: iframeHeight, minHeight: '450px', maxHeight: '70vh' }}>
            {fileType === 'pdf' && archivoActual.url && archivoActual.url !== "#" && (
              <iframe key={archivoActual.url} src={archivoActual.url} title={`Visor PDF: ${archivoActual.filename}`} width="100%" height="100%" className="border-0" />
            )}
            {officeViewerUrl && (
              <iframe key={officeViewerUrl} src={officeViewerUrl} title={`Visor Office: ${archivoActual.filename}`} width="100%" height="100%" frameBorder="0" className="border-0" />
            )}
            {fileType === 'other' && (
                <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-gray-500 p-4 text-center">
                <p className="mb-2">Vista previa no disponible para este tipo de archivo ({archivoActual.extension || 'desconocido'}).</p>
                {archivoActual.url && archivoActual.url !== "#" && ( <a href={archivoActual.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Descargar archivo: {archivoActual.filename}</a> )}
                </div>
            )}
            {((fileType === 'pdf' && (!archivoActual.url || archivoActual.url === "#")) || (['excel', 'word', 'powerpoint'].includes(fileType) && !officeViewerUrl) ) && fileType !== 'other' && (
                <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500 p-4 text-center"> <p>URL de archivo no válida o es un enlace de ejemplo. No se puede mostrar la vista previa.</p> </div>
            )}
          </div>
        </>
      )}

      {/* --- INICIO: Sección de Checklist --- */}
      {(!isLoading && !error) && ( 
        <section className={`mt-6 sm:mt-8 p-3 sm:p-4 rounded-lg border ${isChecklistEditing ? 'bg-sky-100 border-sky-300 shadow-md' : 'bg-sky-50 border-sky-200'}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-sky-800 flex items-center">
                    <CheckSquareIcon />
                    Checklist de Revisión
                </h3>
                <div className="flex items-center space-x-2">
                    {!isChecklistEditing ? (
                        <button 
                            onClick={handleEditChecklist}
                            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm flex items-center transition-colors"
                        >
                            <EditIcon /> Editar Checklist
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleSaveChecklist}
                                className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-sm flex items-center transition-colors"
                            >
                                <SaveIcon /> Guardar
                            </button>
                            <button 
                                onClick={handleCancelChecklist}
                                className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow-sm flex items-center transition-colors"
                            >
                                <CancelIcon/> Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 ${isChecklistEditing ? '' : 'opacity-75'}`}>
                {/* Checklist para Especialista Revisor */}
                <div>
                    <h4 className="text-md sm:text-lg font-medium text-slate-700 mb-3 pb-1 border-b border-slate-300">
                        FORMA - Especialista Revisor
                    </h4>
                    <ul className="space-y-2">
                        {criteriosFormaEspecialista.map(criterio => (
                            <li key={criterio.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={criterio.id}
                                    checked={!!checklistStatus[criterio.id]}
                                    onChange={() => handleChecklistChange(criterio.id)}
                                    disabled={!isChecklistEditing}
                                    className={`h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mr-2 sm:mr-3 ${!isChecklistEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                />
                                <label htmlFor={criterio.id} className={`text-sm sm:text-base text-slate-600 ${!isChecklistEditing ? 'text-slate-500' : ''}`}>
                                    {criterio.label}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Checklist para Coordinadora */}
                <div>
                    <h4 className="text-md sm:text-lg font-medium text-slate-700 mb-3 pb-1 border-b border-slate-300">
                        CALIDAD - Coordinadora
                    </h4>
                    <ul className="space-y-2">
                        {criteriosCalidadCoordinadora.map(criterio => (
                            <li key={criterio.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={criterio.id}
                                    checked={!!checklistStatus[criterio.id]}
                                    onChange={() => handleChecklistChange(criterio.id)}
                                    disabled={!isChecklistEditing}
                                    className={`h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mr-2 sm:mr-3 ${!isChecklistEditing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                />
                                <label htmlFor={criterio.id} className={`text-sm sm:text-base text-slate-600 ${!isChecklistEditing ? 'text-slate-500' : ''}`}>
                                    {criterio.label}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
      )}
      {/* --- FIN: Sección de Checklist --- */}

    </div>
  );
}

// --- Datos de Demostración Internos ---
const mockDatosAdicionales = { 
  "ID BANNER": "N00000000_Demo",
  "APELLIDOS NOMBRES DOCENTE": "DOCENTE DE PRUEBA, DEMOSTRACIÓN",
  "NRC CURSO": "1234_Demo",
  "NOMBRE DEL CURSO": "CURSO DE EJEMPLO (DEMO)",
  "FECHA_REVISION": "2024-01-15T10:00:00Z",
  "ESTADO_APROBACION": "Pendiente"
};

// --- Componente Principal Exportado: VisorDeArchivosDesdeAPI ---
export default function VisorDeArchivosDesdeAPI({ nombreElemento = "Lista de Archivos", datosAdicionales }) {
  const [archivosListados, setArchivosListados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const endpointArchivos = "https://kali-ftp-server.beesoftware.net/api/files_list"; 
  const datosParaMostrar = datosAdicionales || mockDatosAdicionales;

  useEffect(() => {
    const fetchArchivos = async () => {
      setIsLoading(true); 
      setError(null); 
      try {
        const response = await fetch(endpointArchivos);
        if (!response.ok) {
          let errorBody = "";
          try { errorBody = await response.text(); } catch (e) { /* No hacer nada si falla */ }
          throw new Error(`Error ${response.status} al obtener la lista de archivos: ${response.statusText}. ${errorBody}`);
        }
        const data = await response.json();

        // --- DATOS DE EJEMPLO (COMENTAR O ELIMINAR AL USAR API REAL) ---
        // console.log(`Simulando fetch de archivos desde: ${endpointArchivos}`);
        // await new Promise(resolve => setTimeout(resolve, 1200)); 
        // const mockApiResponse = {
        //   "count": 5,
        //   "files": [
        //     { "extension": ".txt", "filename": "demo_file_to_test_long_name_truncation.txt", "url": "#" }, 
        //     { "extension": ".xlsx", "filename": "Rúbrica Monitoreo SINCRONO SALUD 2025-1_VF.xlsx", "url": "http://kali-ftp-server.beesoftware.net/file/1/R%C3%BAbrica%20Monitoreo%20SINCRONO%20SALUD%202025-1_VF.xlsx" },
        //     { "extension": ".pdf", "filename": "Rúbrica Seguimiento Pedagógico Posgrado_CARTILLA.pdf", "url": "http://kali-ftp-server.beesoftware.net/file/1/R%C3%BAbrica%20Seguimiento%20Pedag%C3%B3gico%20Posgrado_M%C3%93DULO%20DE%20INVESTIGACI%C3%93N%202025-1%20060525_CARTILLA.pdf" },
        //     { "extension": ".docx", "filename": "Documento Word Ejemplo.docx", "url": "https://calibre-ebook.com/downloads/demos/demo.docx" }, 
        //     { "extension": ".pptx", "filename": "Presentacion Ejemplo.pptx", "url": "https://scholar.harvard.edu/files/torman_personal/files/samplepptx.pptx" } 
        //   ]
        // };
        // const data = mockApiResponse;
        // --- FIN DATOS DE EJEMPLO ---

        if (!data || !Array.isArray(data.files)) {
          throw new Error("La respuesta de la API de archivos no tiene el formato esperado (objeto con propiedad 'files' que es un array).");
        }

        const archivosFormateados = data.files.map(item => {
          if (!item.filename || typeof item.url === 'undefined' || !item.extension) { 
            console.warn("Elemento de archivo incompleto en la API:", item); return null;
          }
          return { 
            filename: item.filename,
            url: item.url,
            extension: item.extension 
          };
        }).filter(item => item !== null);
        
        setArchivosListados(archivosFormateados);

      } catch (err) {
        console.error("Error obteniendo archivos:", err);
        setError(err.message || "Ocurrió un error desconocido al cargar los archivos.");
        setArchivosListados([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchArchivos();
  }, [endpointArchivos]); 

  return (
    <VisorDetalleArchivosInterno
      elementoNombre={nombreElemento} 
      archivos={archivosListados}
      datosAdicionales={datosParaMostrar} 
      isLoading={isLoading}
      error={error}
    />
  );
}
