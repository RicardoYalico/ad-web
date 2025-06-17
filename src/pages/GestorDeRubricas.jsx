import React, { useState, useEffect } from 'react';

// --- Iconos ---
const EyeIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PresentationChartLineIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M16.5 3.75h.008v.008H16.5V3.75zM9 7.5h6m-6 3.75h6m-6 3.75h6" />
    </svg>
);

const ChatBubbleLeftRightIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.687-3.687A3.75 3.75 0 0112.408 15H9.75a3.75 3.75 0 01-3.75-3.75V8.25c0-1.136.847-2.1 1.98-2.193.34.027-.68.052 1.02.072V3.75a3.75 3.75 0 013.75-3.75h3.75A3.75 3.75 0 0118 3.75v2.25c.647.101 1.25.295 1.796.545-.328.141-.66.298-.996.466zM6.75 12H9A2.25 2.25 0 0011.25 9.75V7.5H9A2.25 2.25 0 006.75 5.25v6.75z" />
    </svg>
);

const DownloadIcon = ({ className = "w-5 h-5 mr-1.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v6.19l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3.75A.75.75 0 0110 3zM3.75 13a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" clipRule="evenodd" />
    </svg>
);

const UploadIcon = ({ className = "w-5 h-5 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338 0 4.5 4.5 0 01-1.41 8.775H6.75z" />
    </svg>
);

const TrashIcon = ({ className = "w-5 h-5 mr-1.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const XMarkIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


// --- Datos Iniciales de las Rúbricas ---
const initialRubricasData = [
  {
    categoria: "MONITOREO",
    id: "monitoreo",
    descripcion: "Rúbricas para el monitoreo y acompañamiento docente en diversas modalidades.",
    color: "blue",
    icon: <EyeIcon className="w-8 h-8 text-blue-600" />,
    subtipos: [
      { nombre: "PRESENCIAL", url: "#", id: "mon_presencial", fechaCarga: "2023-10-15", version: "1.2", tipoArchivo: "xlsx" },
      { nombre: "PRESENCIAL SALUD", url: "#", id: "mon_presencial_salud", fechaCarga: "2023-11-01", version: "1.1", tipoArchivo: "xlsx" },
      { nombre: "VIRTUAL SÍNCRONO", url: "#", id: "mon_virtual_sincrono", fechaCarga: "2024-01-20", version: "2.0", tipoArchivo: "xlsx" },
      { nombre: "VIRTUAL SÍNCRONO SALUD", url: "#", id: "mon_virtual_sincrono_salud", fechaCarga: "2024-02-10", version: "1.5", tipoArchivo: "xlsx" },
    ],
  },
  {
    categoria: "SEGUIMIENTO PEDAGÓGICO",
    id: "seguimiento",
    descripcion: "Instrumentos para el seguimiento pedagógico continuo y efectivo.",
    color: "emerald",
    icon: <PresentationChartLineIcon className="w-8 h-8 text-emerald-600" />,
    subtipos: [
      { nombre: "PRESENCIAL", url: "#", id: "seg_presencial", fechaCarga: "2023-09-05", version: "1.0", tipoArchivo: "xlsx" },
      { nombre: "PRESENCIAL SALUD", url: "#", id: "seg_presencial_salud", fechaCarga: "2023-09-22", version: "1.0", tipoArchivo: "xlsx" },
      { nombre: "VIRTUAL SÍNCRONO", url: "#", id: "seg_virtual_sincrono", fechaCarga: "2024-03-01", version: "1.8", tipoArchivo: "xlsx" },
      { nombre: "VIRTUAL SÍNCRONO SALUD", url: "#", id: "seg_virtual_sincrono_salud", fechaCarga: "2024-03-15", version: "1.3", tipoArchivo: "xlsx" },
    ],
  },
  {
    categoria: "ASESORÍAS DE ORIENTACIÓN",
    id: "asesorias",
    descripcion: "Formatos guía para desarrollar asesorías de orientación pedagógica.",
    color: "purple",
    icon: <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600" />,
    subtipos: [
      { nombre: "FORMATO ASESORÍA DE ORIENTACIÓN", url: "#", id: "ase_formato_orientacion", fechaCarga: "2023-08-10", version: "2.5", tipoArchivo: "xlsx" },
    ],
  },
];

// Base64 de un archivo XLSX mínimo y válido con "Rúbrica Demo" en la celda A1
const demoXLSXBase64 = "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";


// --- Componente de Tarjeta de Rubrica (Subtipo) ---
const RubricaCard = ({ rubrica, categoriaColor, isAdmin, onDelete }) => {
    const colorConfig = {
        blue: {
            border: 'border-blue-500',
            bgButton: 'bg-blue-600',
            hoverBgButton: 'hover:bg-blue-700',
            focusRingButton: 'focus:ring-blue-500',
        },
        emerald: {
            border: 'border-emerald-500',
            bgButton: 'bg-emerald-600',
            hoverBgButton: 'hover:bg-emerald-700',
            focusRingButton: 'focus:ring-emerald-500',
        },
        purple: {
            border: 'border-purple-500',
            bgButton: 'bg-purple-600',
            hoverBgButton: 'hover:bg-purple-700',
            focusRingButton: 'focus:ring-purple-500',
        },
        gray: { 
            border: 'border-gray-500',
            bgButton: 'bg-gray-600',
            hoverBgButton: 'hover:bg-gray-700',
            focusRingButton: 'focus:ring-gray-500',
        }
    };

    const currentColors = colorConfig[categoriaColor] || colorConfig.gray;

    const handleDownloadSim = () => {
        console.log(`Iniciando descarga simulada de: ${rubrica.nombre} (Versión: ${rubrica.version}, Tipo: .${rubrica.tipoArchivo})`);
        
        const fileName = `${rubrica.nombre.replace(/ /g, '_')}_V${rubrica.version}.xlsx`;
        try {
            const byteCharacters = atob(demoXLSXBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href); // Limpiar el object URL
            console.log(`Archivo "${fileName}" descargado (simulado).`);
        } catch (error) {
            console.error("Error al decodificar o generar el archivo XLSX de demostración:", error);
            // Podrías mostrar una notificación al usuario aquí si falla la decodificación
            alert("Error al generar el archivo de demostración. La cadena Base64 podría ser inválida.");
        }
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 ${currentColors.border} flex flex-col justify-between`}>
            <div>
                <h4 className="text-md font-semibold text-slate-800 mb-1 truncate" title={rubrica.nombre}>
                    {rubrica.nombre}
                </h4>
                <p className="text-xs text-slate-500 mb-0.5">Versión: {rubrica.version}</p>
                <p className="text-xs text-slate-500 mb-0.5">Cargado: {rubrica.fechaCarga}</p>
                <p className="text-xs text-slate-500 mb-3">Tipo: .{rubrica.tipoArchivo || 'xlsx'}</p>
            </div>
            <div className="mt-auto">
                <button
                    onClick={handleDownloadSim}
                    className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white ${currentColors.bgButton} ${currentColors.hoverBgButton} rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentColors.focusRingButton} mb-2`}
                >
                    <DownloadIcon />
                    Descargar
                </button>
                {isAdmin && (
                    <button
                        onClick={onDelete}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 border border-red-300 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                        aria-label={`Eliminar ${rubrica.nombre}`}
                    >
                        <TrashIcon />
                        Eliminar
                    </button>
                )}
            </div>
        </div>
    );
};

// --- Componente Modal de Carga ---
const UploadModal = ({ isOpen, onClose, onUpload, categorias }) => {
    const [nombre, setNombre] = useState('');
    const [version, setVersion] = useState('');
    const [categoriaId, setCategoriaId] = useState(categorias.length > 0 ? categorias[0].id : '');
    const [archivo, setArchivo] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => { 
        if (isOpen) {
            setNombre('');
            setVersion('');
            setCategoriaId(categorias.length > 0 ? categorias[0].id : '');
            setArchivo(null);
            setError('');
        }
    }, [isOpen, categorias]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nombre.trim() || !version.trim() || !categoriaId || !archivo) {
            setError('Todos los campos son obligatorios, incluyendo el archivo.');
            return;
        }
        if (!archivo.name.toLowerCase().endsWith('.xlsx')) {
            setError('El archivo debe ser de tipo XLSX (.xlsx).');
            return;
        }

        onUpload({
            nombre,
            version,
            categoriaId,
            url: URL.createObjectURL(archivo), // URL temporal solo para simulación interna, no se usa para descarga.
            fechaCarga: new Date().toISOString().split('T')[0], 
            id: `rub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
            tipoArchivo: "xlsx", // Forzado a xlsx
            archivoNombreOriginal: archivo.name // Guardar nombre original para referencia si se necesita
        });
        onClose(); 
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Cargar Nueva Rúbrica XLSX</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition-colors">
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="nombreRubrica" className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Rúbrica</label>
                        <input type="text" id="nombreRubrica" value={nombre} onChange={(e) => setNombre(e.target.value)} required
                               className="w-full px-4 py-2.5 text-slate-700 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"/>
                    </div>
                    <div>
                        <label htmlFor="versionRubrica" className="block text-sm font-medium text-slate-700 mb-1">Versión</label>
                        <input type="text" id="versionRubrica" value={version} onChange={(e) => setVersion(e.target.value)} required
                               className="w-full px-4 py-2.5 text-slate-700 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"/>
                    </div>
                    <div>
                        <label htmlFor="categoriaRubrica" className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                        <select id="categoriaRubrica" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required
                                className="w-full px-4 py-2.5 text-slate-700 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow appearance-none">
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.categoria}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="archivoRubrica" className="block text-sm font-medium text-slate-700 mb-1">Archivo de Rúbrica (.xlsx)</label>
                        <input type="file" id="archivoRubrica" onChange={(e) => setArchivo(e.target.files[0])} required
                               accept=".xlsx" // Restringido a XLSX
                               className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"/>
                        {archivo && <p className="mt-1 text-xs text-slate-600">Archivo seleccionado: {archivo.name}</p>}
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1">
                            Cancelar
                        </button>
                        <button type="submit"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                            Cargar Rúbrica
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principal: GestorDeRubricas ---
export default function GestorDeRubricas() {
  const [rubricas, setRubricas] = useState(initialRubricasData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleOpenUploadModal = () => {
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleActualUpload = (nuevaRubricaData) => {
    setRubricas(prevRubricas => {
        return prevRubricas.map(cat => {
            if (cat.id === nuevaRubricaData.categoriaId) {
                const newSubtipos = [...cat.subtipos, {
                    nombre: nuevaRubricaData.nombre,
                    version: nuevaRubricaData.version,
                    url: nuevaRubricaData.url, // Se guarda la URL del blob temporalmente (para consistencia)
                    fechaCarga: nuevaRubricaData.fechaCarga,
                    id: nuevaRubricaData.id,
                    tipoArchivo: "xlsx" 
                }];
                return { ...cat, subtipos: newSubtipos };
            }
            return cat;
        });
    });
    console.log("Nueva rúbrica cargada (simulado):", nuevaRubricaData);
  };


  const handleDeleteRubrica = (categoriaId, rubricaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta rúbrica? Esta acción no se puede deshacer.")) {
        setRubricas(prevRubricas =>
            prevRubricas.map(cat => {
                if (cat.id === categoriaId) {
                    return {
                        ...cat,
                        subtipos: cat.subtipos.filter(sub => sub.id !== rubricaId),
                    };
                }
                return cat;
            })
        );
        console.log(`Rúbrica eliminada: Categoria ID ${categoriaId}, Rúbrica ID ${rubricaId}`);
    }
  };
  
  const filteredRubricasData = rubricas.map(categoria => ({
    ...categoria,
    subtipos: categoria.subtipos.filter(subtipo =>
      subtipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(categoria => categoria.subtipos.length > 0 || !searchTerm );


  return (
    <>
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto">
            <header className="mb-6 md:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-2">
                Centro de Rúbricas Docentes
            </h1>
            <p className="text-md sm:text-lg text-slate-600 text-center">
                Encuentra, descarga y gestiona las rúbricas (XLSX) para el acompañamiento docente.
            </p>
            </header>

            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row gap-4 items-center">
                <input
                    type="text"
                    placeholder="Buscar rúbrica XLSX por nombre..."
                    className="w-full sm:flex-grow px-4 py-3 text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isAdmin && (
                    <button
                        onClick={handleOpenUploadModal}
                        className="w-full sm:w-auto flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <UploadIcon />
                        Cargar Rúbrica
                    </button>
                )}
            </div>


            {filteredRubricasData.length === 0 && searchTerm ? (
                <div className="text-center py-12">
                    <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 17.25v-.228c0-.597-.237-1.17-.659-1.591l-4.772-4.772a1.875 1.875 0 00-2.652 0L7.172 15H2.969C.75 15-.031 18.031 1.343 19.657l5.375 5.375a1.875 1.875 0 002.652 0l11.719-11.719c.422-.422.659-.994.659-1.591zM16.5 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-slate-800">No se encontraron rúbricas XLSX</h3>
                    <p className="mt-2 text-md text-slate-500">Prueba con otros términos de búsqueda o verifica la ortografía.</p>
                </div>
            ) : (
                <div className="space-y-8">
                {filteredRubricasData.map((categoria) => {
                    const headerBgColorClass = `bg-${categoria.color}-100`;
                    const headerTextColorClass = `text-${categoria.color}-700`;
                    const borderColorClass = `border-${categoria.color}-500`;

                    if (categoria.subtipos.length > 0 || !searchTerm) {
                        return (
                            <section key={categoria.id} aria-labelledby={`${categoria.id}-heading`}>
                                <div className={`p-4 rounded-t-lg ${headerBgColorClass} border-b-2 ${borderColorClass} flex items-center space-x-3 shadow-sm`}>
                                    {React.cloneElement(categoria.icon, { className: `w-7 h-7 ${headerTextColorClass}` })}
                                    <div>
                                        <h2 id={`${categoria.id}-heading`} className={`text-xl font-bold ${headerTextColorClass}`}>
                                            {categoria.categoria}
                                        </h2>
                                        <p className={`text-xs ${headerTextColorClass} opacity-80`}>{categoria.descripcion}</p>
                                    </div>
                                </div>

                                {categoria.subtipos && categoria.subtipos.length > 0 ? (
                                    <div className="p-1 pt-6 bg-white rounded-b-lg shadow-sm">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 p-4">
                                            {categoria.subtipos.map((rubrica) => (
                                                <RubricaCard 
                                                    key={rubrica.id} 
                                                    rubrica={rubrica} 
                                                    categoriaColor={categoria.color}
                                                    isAdmin={isAdmin}
                                                    onDelete={() => handleDeleteRubrica(categoria.id, rubrica.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    searchTerm && categoria.subtipos.length === 0 && (
                                        <div className="p-6 bg-white rounded-b-lg shadow-sm text-center">
                                            <p className="text-slate-500">No hay rúbricas que coincidan con tu búsqueda en esta categoría.</p>
                                        </div>
                                    )
                                )}
                            </section>
                        );
                    }
                    return null; 
                })}
                </div>
            )}
        </div>
        </div>
        <UploadModal 
            isOpen={showUploadModal} 
            onClose={handleCloseUploadModal} 
            onUpload={handleActualUpload}
            categorias={rubricas}
        />
    </>
  );
}
