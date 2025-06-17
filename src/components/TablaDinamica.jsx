// src/components/TablaDinamica.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import VisorDeArchivosDesdeAPI from './DetalleRubricaPDF'; // Comentado según solicitud
// NOTA: Asegúrate de que la biblioteca SheetJS (xlsx) esté disponible.
// Puedes añadirla a tu index.html: <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
// O instalarla vía npm/yarn e importarla si usas un bundler: import * as XLSX from 'xlsx';

// --- Componente FilterIcon ---
const FilterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

// --- Componente SortIndicator ---
const SortIndicator = ({ direction }) => {
    if (direction === 'ascending') return <span style={{ marginLeft: '5px' }}>▲</span>;
    if (direction === 'descending') return <span style={{ marginLeft: '5px' }}>▼</span>;
    return <span style={{ marginLeft: '5px', color: '#ccc' }}>↕</span>; // Neutral indicator
};


// --- Componente Universal FilterDropdown ---
const UniversalFilterDropdown = ({
    columnName,
    filterState,
    setFilterState,
    allAvailableOptions,
    onClose,
    uniqueId,
    triggerType = 'button',
    usePortal = false,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [opensUpward, setOpensUpward] = useState(false);
    const dropdownRef = useRef(null);
    const panelRef = useRef(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return allAvailableOptions;
        return allAvailableOptions.filter(option =>
            String(option).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allAvailableOptions, searchTerm]);

    const handleToggleValue = (value) => {
        setFilterState(prevSelected =>
            prevSelected.includes(value) ? prevSelected.filter(item => item !== value) : [...prevSelected, value]
        );
    };

    const handleSelectAll = () => {
        setFilterState(allAvailableOptions);
        setDropdownOpen(false);
        if (onClose) onClose();
    };

    const handleClearSelection = () => {
        setFilterState([]);
        setDropdownOpen(false);
        if (onClose) onClose();
    };

    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            const triggerElement = dropdownRef.current;
            const rect = triggerElement.getBoundingClientRect();
            const estimatedPanelHeight = 300;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < estimatedPanelHeight && (spaceAbove >= estimatedPanelHeight || spaceAbove > spaceBelow)) {
                setOpensUpward(true);
            } else {
                setOpensUpward(false);
            }
        } else if (!dropdownOpen) {
            setOpensUpward(false);
        }
    }, [dropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                (!panelRef.current || !panelRef.current.contains(event.target))) {
                setDropdownOpen(false);
                if (onClose) onClose();
            }
        };
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen, onClose]);

    const getContainerStyle = () => ({
        position: 'relative',
        minWidth: triggerType === 'button' ? '220px' : 'auto',
        flexShrink: 0,
        display: triggerType === 'icon' ? 'inline-flex' : 'block',
        alignItems: triggerType === 'icon' ? 'center' : 'stretch',
        verticalAlign: triggerType === 'icon' ? 'middle' : 'initial',
    });

    const getTriggerButtonStyle = () => {
        if (triggerType === 'icon') {
            return {
                background: 'none', border: 'none', padding: '2px', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center',
                color: filterState && filterState.length > 0 ? '#007bff' : 'inherit',
            };
        }
        return {
            padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc',
            backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center', width: '100%',
            minHeight: '38px', boxSizing: 'border-box'
        };
    };

    const getDropdownContentStyle = () => {
        const basePanelWidth = 280;
        const baseStyle = {
            backgroundColor: 'white',
            border: '1px solid #ddd', borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '300px',
            overflowY: 'auto', width: `${basePanelWidth}px`, boxSizing: 'border-box',
        };

        if (usePortal && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            let dynamicStyles = { position: 'fixed', zIndex: 10050 };

            if (opensUpward) dynamicStyles.bottom = window.innerHeight - rect.top + 5;
            else dynamicStyles.top = rect.bottom + 5;

            if (triggerType === 'icon' && columnName.length > 15) {
                 dynamicStyles.left = Math.max(0, rect.right - basePanelWidth);
            } else {
                if (rect.left + basePanelWidth > window.innerWidth) {
                    dynamicStyles.left = Math.max(0, window.innerWidth - basePanelWidth - 5);
                } else {
                    dynamicStyles.left = rect.left;
                }
            }
            return { ...baseStyle, ...dynamicStyles };
        }

        const verticalPositionStyle = opensUpward ?
            { bottom: '100%', top: 'auto', marginBottom: '5px' } :
            { top: '100%', bottom: 'auto', marginTop: '5px' };

        const horizontalPositionStyle = (triggerType === 'icon' && columnName.length > 15) ?
            { left: 'auto', right: 0 } : { left: 0, right: 'auto' };

        return { ...baseStyle, position: 'absolute', zIndex: 1000, ...verticalPositionStyle, ...horizontalPositionStyle };
    };

    const filterSearchInputStyle = {
        width: 'calc(100% - 20px)', padding: '8px 10px', margin: '10px',
        borderRadius: '4px', border: '1px solid #eee', boxSizing: 'border-box',
    };

    const filterOptionLabelStyle = {
        display: 'flex', alignItems: 'center', cursor: 'pointer',
        padding: '5px 10px', gap: '5px', whiteSpace: 'nowrap',
        overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9em',
    };

    const filterOptionCheckboxStyle = { marginRight: '5px' };

    const currentFilterState = Array.isArray(filterState) ? filterState : [];

    const panelContent = (
        <div ref={panelRef} style={getDropdownContentStyle()} onClick={e => e.stopPropagation()}>
            <input
                type="text" id={`${uniqueId}-search-input`}
                placeholder={`Buscar ${columnName.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => { e.stopPropagation(); setSearchTerm(e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                style={filterSearchInputStyle}
            />
            <div style={{ padding: '0 5px 10px' }}>
                <label style={{ ...filterOptionLabelStyle, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    <input type="checkbox"
                        checked={allAvailableOptions.length > 0 && currentFilterState.length === allAvailableOptions.length}
                        onChange={handleSelectAll}
                        disabled={allAvailableOptions.length === 0}
                        style={filterOptionCheckboxStyle} />
                    Seleccionar Todos
                </label>
                <label style={{ ...filterOptionLabelStyle, fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                    <input type="checkbox"
                        checked={currentFilterState.length === 0 && allAvailableOptions.length > 0}
                        onChange={handleClearSelection}
                        disabled={currentFilterState.length === 0}
                        style={filterOptionCheckboxStyle} />
                    Limpiar Selección
                </label>
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((value, index) => (
                        <label key={`${uniqueId}-opt-${String(value)}-${index}`} style={filterOptionLabelStyle} title={String(value)}>
                            <input type="checkbox"
                                checked={currentFilterState.includes(value)}
                                onChange={() => handleToggleValue(value)}
                                style={filterOptionCheckboxStyle} />
                            {String(value).length > 30 ? String(value).substring(0, 27) + '...' : value}
                        </label>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9em', padding: '10px' }}>
                        {searchTerm ? 'No coinciden con la búsqueda.' : 'No hay opciones disponibles.'}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div ref={dropdownRef} style={getContainerStyle()}>
            {triggerType === 'button' && (
                <h3>
                    {columnName === "APELLIDOS NOMBRES DOCENTE" ? "Filtro Docente" : `Filtro ${columnName.replace(/ /g, '')}`}
                </h3>
            )}
            <button
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(prev => !prev); }}
                style={getTriggerButtonStyle()}
                title={triggerType === 'icon' ? `Filtrar ${columnName}` : undefined}
            >
                {triggerType === 'icon' ? <FilterIcon /> : (
                    currentFilterState.length === 0 ? `Seleccionar ${columnName}` :
                        currentFilterState.length === 1 ? `${currentFilterState[0]}` :
                            `${currentFilterState.length} seleccionados`
                )}
                <span style={{ marginLeft: triggerType === 'icon' ? '2px' : 'auto' }}>
                    {dropdownOpen ? '▲' : '▼'}
                </span>
            </button>
            {dropdownOpen && (usePortal ? ReactDOM.createPortal(panelContent, document.body) : panelContent)}
        </div>
    );
};


// --- Componente para Ver Registro (Ajustado para estar contenido) ---
const ViewRecordComponent = ({ record, onClose }) => {
    if (!record) return null;

    const recordId = record["ID BANNER"] || 'ID Desconocido';
    const iframeUrl = record.UrlContenidoExterno || "about:blank"; 

    const viewStyle = {
        // Ya no es 'fixed', se renderizará dentro del flujo del div padre
        width: '100%', // Ocupa el ancho del contenedor padre
        minHeight: '80vh', // Altura mínima para asegurar espacio para el iframe
        backgroundColor: '#ffffff', // Fondo blanco sólido
        border: '1px solid #dee2e6', // Borde sutil
        borderRadius: '8px', // Bordes redondeados
        boxShadow: '0 4px 8px rgba(0,0,0,0.07)', // Sombra suave
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', 
        marginTop: '20px', // Margen superior para separarlo de otros elementos
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '15px 20px',
        backgroundColor: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
    };

    const backButtonStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        marginRight: '15px',
        display: 'inline-flex',
        alignItems: 'center',
        color: '#007bff', 
    };

    const titleStyle = {
        fontSize: '1.4em',
        color: '#343a40', 
        fontWeight: '500',
        margin: 0,
    };

    const iframeContainerStyle = {
        flexGrow: 1, 
        border: 'none', 
        width: '100%',
        // La altura se gestionará por flexGrow y minHeight del contenedor principal
        // Es importante que el iframe en sí mismo pueda ser 100% de su contenedor
        height: 'calc(80vh - 70px)', // Ajustar restando la altura aproximada del header
    };

    return (
        <div style={viewStyle}>
            <div style={headerStyle}>
                <button onClick={onClose} title="Retroceder" style={backButtonStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2 style={titleStyle}>
                    Visualizando Registro: <span style={{ fontWeight: 'normal', color: '#555' }}>{recordId}</span>
                </h2>
            </div>
            
            <VisorDeArchivosDesdeAPI/>
        </div>
    );
};


// --- Componente para Editar Registro ---
const EditRecordComponent = ({ record, onClose, onSave }) => {
    const [formData, setFormData] = useState(record ? { ...record } : {});

    useEffect(() => {
        setFormData(record ? { ...record } : {});
    }, [record]);

    if (!record) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Guardando:", formData);
        if (onSave) {
            onSave(formData);
        }
    };

    const recordId = record["ID BANNER"] || 'ID Desconocido';

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px auto', maxWidth: '700px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                Editar Registro: <span style={{ fontWeight: 'normal' }}>{recordId}</span>
            </h2>
            <form onSubmit={handleSubmit}>
                <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '15px' }}>
                    {Object.keys(formData).map(key => (
                        <div key={key} style={{ marginBottom: '15px' }}>
                            <label htmlFor={`edit-${key}`} style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </label>
                            <input
                                type="text"
                                id={`edit-${key}`}
                                name={key}
                                value={formData[key] || ''}
                                onChange={handleChange}
                                readOnly={key === "ID BANNER"}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box',
                                    fontSize: '0.95em',
                                    backgroundColor: key === "ID BANNER" ? '#e9ecef' : 'white',
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '25px', textAlign: 'right', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '10px 20px', marginRight: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold' }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.95em', fontWeight: 'bold' }}
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Componente Principal TablaDinamica ---
const TablaDinamica = () => {
    const [registrosCompletos, setRegistrosCompletos] = useState([]);
    const [columnasDisponibles, setColumnasDisponibles] = useState([]);
    const [columnasVisibles, setColumnasVisibles] = useState([]);
    const [searchTermColumnas, setSearchTermColumnas] = useState('');
    const [dropdownColumnasOpen, setDropdownColumnasOpen] = useState(false);
    const dropdownColumnasRef = useRef(null);

    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [editingRecord, setEditingRecord] = useState(null);
    const [viewingRecord, setViewingRecord] = useState(null);

    const columnasPorDefecto = useMemo(() => [
        "APELLIDOS NOMBRES DOCENTE", "PROGRAMA", "SEGMENTO DOCENTE",
        "CARRERA", "FACULTAD", "ESPECIALISTA", "Ruta 1"
    ], []);

    const columnasConFiltroPredefinido = useMemo(() => [
        'Ruta 1', 'ESPECIALISTA', 'APELLIDOS NOMBRES DOCENTE', 'Ruta General'
    ], []);

    useEffect(() => {
        const initialFilters = {};
        columnasConFiltroPredefinido.forEach(colName => {
            initialFilters[colName] = [];
        });
        setFilters(initialFilters);
    }, [columnasConFiltroPredefinido]);


    const updateFilter = useCallback((columnName, newSelectedValuesOrCallback) => {
        setFilters(prevFilters => {
            const currentSelected = prevFilters[columnName] || [];
            const newSelected = typeof newSelectedValuesOrCallback === 'function'
                ? newSelectedValuesOrCallback(currentSelected)
                : newSelectedValuesOrCallback;
            return {
                ...prevFilters,
                [columnName]: newSelected
            };
        });
    }, []);


    useEffect(() => {
        const cargarRegistros = async () => {
            try {
                const response = await fetch('https://kali-ad-web.beesoftware.net/api/rubricas');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    const dataConUrls = data.map((item, index) => ({
                        ...item,
                        UrlContenidoExterno: index % 3 === 0 ? `https://onedrive.live.com/embed?resid=YOUR_RESID&authkey=YOUR_AUTHKEY&em=2&wdAr=1.77` : null 
                        // Asegúrate de que 'YOUR_RESID' y 'YOUR_AUTHKEY' sean válidos o usa una URL de iframe de prueba funcional.
                        // Ejemplo de URL de prueba para iframe: `https://www.example.com` (si permite ser embebida)
                        // O para pruebas locales: `http://localhost:PUERTO_DE_OTRA_APP_LOCAL`
                    }));
                    setRegistrosCompletos(dataConUrls);

                    const todasLasColumnas = Object.keys(data[0]);
                    setColumnasDisponibles(todasLasColumnas);
                    const defaultVisible = columnasPorDefecto.filter(col => todasLasColumnas.includes(col));
                    setColumnasVisibles(defaultVisible);
                    const initialFiltersWithAllCols = {};
                    todasLasColumnas.forEach(colName => {
                        initialFiltersWithAllCols[colName] = [];
                    });
                    setFilters(prev => ({ ...initialFiltersWithAllCols, ...prev }));
                } else {
                    console.warn("API response is not a valid array or is empty.");
                    setRegistrosCompletos([]); setColumnasDisponibles([]); setColumnasVisibles([]);
                }
            } catch (error) {
                console.error("Error loading records:", error);
                setRegistrosCompletos([]); setColumnasDisponibles([]); setColumnasVisibles([]);
            }
        };
        cargarRegistros();
    }, [columnasPorDefecto]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'none';
            key = null;
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };


    const registrosFiltradosYOrdenados = useMemo(() => {
        let datosFiltrados = [...registrosCompletos];
        Object.entries(filters).forEach(([columnName, selectedValues]) => {
            if (selectedValues && selectedValues.length > 0) {
                datosFiltrados = datosFiltrados.filter(registro => {
                    const registroValue = String(registro[columnName]);
                    return selectedValues.some(filterVal => String(filterVal) === registroValue);
                });
            }
        });

        if (sortConfig.key && sortConfig.direction !== 'none') {
            datosFiltrados.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];

                if (valA == null && valB == null) return 0;
                if (valA == null) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (valB == null) return sortConfig.direction === 'ascending' ? -1 : 1;

                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
                }

                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();

                if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return datosFiltrados;
    }, [registrosCompletos, filters, sortConfig]);

    const getFilteredOptionsForColumn = useCallback((currentColumnName) => {
        let recordsToFilter = [...registrosCompletos];

        Object.entries(filters).forEach(([colName, selectedValues]) => {
            if (colName !== currentColumnName && selectedValues && selectedValues.length > 0) {
                const isPredefinedCurrent = columnasConFiltroPredefinido.includes(currentColumnName);
                const isPredefinedOther = columnasConFiltroPredefinido.includes(colName);

                if (isPredefinedCurrent && isPredefinedOther) {
                    const currentIndex = columnasConFiltroPredefinido.indexOf(currentColumnName);
                    const otherIndex = columnasConFiltroPredefinido.indexOf(colName);
                    if (otherIndex < currentIndex) {
                        recordsToFilter = recordsToFilter.filter(r => selectedValues.includes(r[colName]));
                    }
                } else if (!isPredefinedCurrent && isPredefinedOther) {
                    recordsToFilter = recordsToFilter.filter(r => selectedValues.includes(r[colName]));
                } else if (!isPredefinedCurrent && !isPredefinedOther) {
                    recordsToFilter = recordsToFilter.filter(r => selectedValues.includes(r[colName]));
                }
            }
        });

        const values = recordsToFilter
            .map(registro => registro[currentColumnName])
            .filter(value => value !== undefined && value !== null && String(value).trim() !== '')
            .sort((a, b) => String(a).localeCompare(String(b)));
        return [...new Set(values)];
    }, [registrosCompletos, filters, columnasConFiltroPredefinido]);

    const createDependentFilterCleaner = (colToCleanIndex) => {
        return () => {
            if (colToCleanIndex < 0 || colToCleanIndex >= columnasConFiltroPredefinido.length) return;
            const colToClean = columnasConFiltroPredefinido[colToCleanIndex];
            if (!colToClean) return;

            const dependingOnCols = columnasConFiltroPredefinido.slice(0, colToCleanIndex);

            if (!filters[colToClean] || dependingOnCols.some(depCol => !filters[depCol])) {
                return;
            }

            const availableOptions = getFilteredOptionsForColumn(colToClean);
            const currentSelection = filters[colToClean] || [];
            const newSelection = currentSelection.filter(val => availableOptions.includes(val));

            if (newSelection.length !== currentSelection.length) {
                updateFilter(colToClean, newSelection);
            }
        };
    };

    useEffect(createDependentFilterCleaner(1), [filters[columnasConFiltroPredefinido[0]], getFilteredOptionsForColumn, updateFilter, columnasConFiltroPredefinido]);
    useEffect(createDependentFilterCleaner(2), [filters[columnasConFiltroPredefinido[0]], filters[columnasConFiltroPredefinido[1]], getFilteredOptionsForColumn, updateFilter, columnasConFiltroPredefinido]);
    useEffect(createDependentFilterCleaner(3), [filters[columnasConFiltroPredefinido[0]], filters[columnasConFiltroPredefinido[1]], filters[columnasConFiltroPredefinido[2]], getFilteredOptionsForColumn, updateFilter, columnasConFiltroPredefinido]);


    useEffect(() => {
        setCurrentPage(1);
    }, [filters, rowsPerPage, sortConfig]);


    const handleClearAllFilters = () => {
        setFilters(prevFilters => {
            const clearedFilters = {};
            Object.keys(prevFilters).forEach(key => {
                clearedFilters[key] = [];
            });
            return clearedFilters;
        });
        setSortConfig({ key: null, direction: 'none' });
    };

    useEffect(() => {
        const handleClickOutsideColumnas = (event) => {
            if (dropdownColumnasRef.current && !dropdownColumnasRef.current.contains(event.target)) {
                setDropdownColumnasOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutsideColumnas);
        return () => document.removeEventListener('mousedown', handleClickOutsideColumnas);
    }, []);

    const handleToggleColumnaAdicional = (columna) => {
        setColumnasVisibles(prev => {
            if (columnasPorDefecto.includes(columna)) return prev;

            const newVisibleBase = prev.includes(columna)
                ? prev.filter(c => c !== columna)
                : [...prev, columna];

            if (newVisibleBase.includes(columna) && !filters.hasOwnProperty(columna)) {
                updateFilter(columna, []);
            }

            const newVisibleDefault = columnasPorDefecto.filter(c => newVisibleBase.includes(c));
            const newVisibleAdditional = newVisibleBase.filter(c => !columnasPorDefecto.includes(c)).sort();

            return [...newVisibleDefault, ...newVisibleAdditional];
        });
    };

    const handleSelectAllColumns = () => {
        const todasLasColumnasExistentes = [...new Set([...columnasPorDefecto, ...columnasDisponibles])];
        todasLasColumnasExistentes.forEach(col => {
            if (!filters.hasOwnProperty(col)) {
                updateFilter(col, []);
            }
        });
        const defaultSorted = columnasPorDefecto.filter(c => todasLasColumnasExistentes.includes(c));
        const additionalSorted = todasLasColumnasExistentes.filter(c => !columnasPorDefecto.includes(c)).sort();
        setColumnasVisibles([...defaultSorted, ...additionalSorted]);
        setDropdownColumnasOpen(false);
    };

    const handleTipoTablaChange = (event) => {
        const tipo = event.target.value;
        const todasLasColumnas = Object.keys(registrosCompletos[0] || {});
        let newColumnasVisibles = [];
        switch (tipo) {
            case 'DEFAULT': newColumnasVisibles = columnasPorDefecto.filter(col => todasLasColumnas.includes(col)); break;
            case 'PLANILLA': newColumnasVisibles = ["PROGRAMA", "APELLIDOS NOMBRES DOCENTE", "CARRERA"].filter(col => todasLasColumnas.includes(col)); break;
            case 'DEMO': newColumnasVisibles = ["ESPECIALISTA", "PROGRAMA", "Ruta 1"].filter(col => todasLasColumnas.includes(col)); break;
            default: newColumnasVisibles = columnasPorDefecto.filter(col => todasLasColumnas.includes(col)); break;
        }
        setColumnasVisibles(newColumnasVisibles);
        newColumnasVisibles.forEach(col => {
            if (!filters.hasOwnProperty(col)) {
                updateFilter(col, []);
            }
        });
        handleClearAllFilters();
    };

    const columnasAdicionales = columnasDisponibles.filter(col => !columnasPorDefecto.includes(col)).sort((a, b) => String(a).localeCompare(String(b)));
    const filteredColumnasParaSelector = columnasAdicionales.filter(col => col.toLowerCase().includes(searchTermColumnas.toLowerCase()));

    const totalPages = Math.ceil(registrosFiltradosYOrdenados.length / rowsPerPage);
    const currentRecords = useMemo(() => {
        const indexOfLastRecord = currentPage * rowsPerPage;
        const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
        return registrosFiltradosYOrdenados.slice(indexOfFirstRecord, indexOfLastRecord);
    }, [registrosFiltradosYOrdenados, currentPage, rowsPerPage]);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(Number(event.target.value));
    };

    const getPaginationButtons = () => {
        const buttons = []; const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        if (totalPages <= maxButtons) { startPage = 1; endPage = totalPages; }
        else if (endPage - startPage + 1 < maxButtons) { startPage = Math.max(1, endPage - maxButtons + 1); }

        if (startPage > 1) {
            buttons.push(<button key="first" onClick={() => handlePageChange(1)} style={paginationButtonStyle}>1</button>);
            if (startPage > 2) buttons.push(<span key="dots-prev" style={paginationDotsStyle}>...</span>);
        }
        for (let i = startPage; i <= endPage; i++) {
            if (i > 0) {
                buttons.push(<button key={i} onClick={() => handlePageChange(i)} style={currentPage === i ? activePaginationButtonStyle : paginationButtonStyle}>{i}</button>);
            }
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) buttons.push(<span key="dots-next" style={paginationDotsStyle}>...</span>);
            buttons.push(<button key="last" onClick={() => handlePageChange(totalPages)} style={paginationButtonStyle}>{totalPages}</button>);
        }
        return buttons;
    };

    const exportToXLSX = () => {
        // @ts-ignore
        if (typeof XLSX === 'undefined') {
            alert("La biblioteca de exportación (SheetJS) no está cargada. Por favor, recarga la página o verifica la consola.");
            console.error("SheetJS (XLSX) library is not available.");
            return;
        }

        if (registrosFiltradosYOrdenados.length === 0) {
            alert("No hay datos para exportar según los filtros actuales.");
            return;
        }

        const dataToExport = registrosFiltradosYOrdenados.map(registro => {
            const filteredRegistro = {};
            const colsToExport = columnasVisibles.filter(col => col !== 'Acciones' && col !== 'UrlContenidoExterno');
            
            colsToExport.forEach(columna => {
                filteredRegistro[columna] = registro[columna];
            });
            return filteredRegistro;
        });
        // @ts-ignore
        const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: columnasVisibles.filter(col => col !== 'Acciones' && col !== 'UrlContenidoExterno') });
        // @ts-ignore
        const workbook = XLSX.utils.book_new();
        // @ts-ignore
        XLSX.utils.book_append_sheet(workbook, worksheet, "DatosExportados");

        const date = new Date();
        const filename = `tabla_exportada_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}.xlsx`;
        // @ts-ignore
        XLSX.writeFile(workbook, filename);
    };

    // --- HANDLERS PARA ACCIONES ---
    const handleView = (record) => {
        setViewingRecord(record);
        setEditingRecord(null);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setViewingRecord(null);
    };

    const handleDelete = (recordIdToDelete) => {
        if (window.confirm(`¿Está seguro de que desea eliminar el registro con ID BANNER: ${recordIdToDelete}? Esta acción no se puede deshacer.`)) {
            console.log("Eliminar registro con ID BANNER:", recordIdToDelete);
            setRegistrosCompletos(prev => prev.filter(r => r["ID BANNER"] !== recordIdToDelete));
            if (editingRecord && editingRecord["ID BANNER"] === recordIdToDelete) {
                setEditingRecord(null);
            }
            if (viewingRecord && viewingRecord["ID BANNER"] === recordIdToDelete) {
                setViewingRecord(null);
            }
        }
    };

    const handleCloseView = () => {
        setViewingRecord(null);
    };

    const handleCloseEdit = () => {
        setEditingRecord(null);
    };

    const handleSaveEdit = (updatedRecord) => {
        console.log("Registro guardado desde TablaDinamica:", updatedRecord);
        setRegistrosCompletos(prevRecords =>
            prevRecords.map(r =>
                r["ID BANNER"] === updatedRecord["ID BANNER"] ? updatedRecord : r
            )
        );
        setEditingRecord(null);
    };


    // --- ESTILOS ---
    const mainContainerStyle = { padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f8' };
    const paginationContainerStyle = { marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', flexWrap: 'wrap' };
    const paginationButtonStyle = { padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f0f0f0', cursor: 'pointer', minWidth: '30px', textAlign: 'center', fontSize: '0.9em' };
    const activePaginationButtonStyle = { ...paginationButtonStyle, backgroundColor: '#007bff', color: 'white', borderColor: '#007bff' };
    const paginationDotsStyle = { padding: '8px 2px', color: '#888', fontSize: '0.9em' };
    const filterControlSectionStyle = { marginBottom: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-start' };

    const baseTableHeaderCellStyle = (columna) => ({
        border: '1px solid #ddd', padding: '10px 8px', textAlign: 'left',
        backgroundColor: columnasPorDefecto.includes(columna) ? '#e0f7fa' : '#f2f2f2',
        fontWeight: columnasPorDefecto.includes(columna) ? 'bold' : '600',
        color: columnasPorDefecto.includes(columna) ? '#00796b' : '#333',
        verticalAlign: 'middle',
        userSelect: 'none',
    });

    const tableHeaderCellStyle = (columna, isSorted) => ({
        ...baseTableHeaderCellStyle(columna),
        backgroundColor: isSorted ? '#d0eaff' : (columnasPorDefecto.includes(columna) ? '#e0f7fa' : '#f2f2f2'),
        cursor: 'pointer',
        position: 'sticky',
        top: 0,
        zIndex: 2,
    });

    const actionsHeaderStyle = {
        ...baseTableHeaderCellStyle('Acciones'),
        width: '160px', 
        minWidth: '160px', 
        position: 'sticky',
        left: 0,
        top: 0,
        zIndex: 3,
        backgroundColor: '#e9ecef',
    };

    const tableCellStyle = (columna) => ({
        border: '1px solid #ddd', padding: '8px', fontSize: '0.9em',
        backgroundColor: columnasPorDefecto.includes(columna) ? '#f8fcfd' : 'white',
        color: columnasPorDefecto.includes(columna) ? '#004d40' : '#444',
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    });

    const actionsCellStyle = (isEvenRow) => ({
        ...tableCellStyle('Acciones'),
        width: '160px', 
        minWidth: '160px', 
        textAlign: 'center',
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: isEvenRow ? 'white' : '#f9f9f9',
        overflow: 'visible',
    });

    // --- RENDERIZADO CONDICIONAL ---
    // El componente de vista/edición se renderizará *dentro* del div principal de TablaDinamica
    return (
        <div style={mainContainerStyle}>
            {viewingRecord ? (
                <ViewRecordComponent record={viewingRecord} onClose={handleCloseView} />
            ) : editingRecord ? (
                <EditRecordComponent record={editingRecord} onClose={handleCloseEdit} onSave={handleSaveEdit} />
            ) : (
                <> {/* Fragmento para renderizar la tabla y controles cuando no se está viendo/editando */}
                    <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>Tabla Dinámica de Registros</h1>

                    <div style={filterControlSectionStyle}>
                        <div>
                            <h3>Tipo de Tabla:</h3>
                            <select onChange={handleTipoTablaChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '180px' }}>
                                <option value="">Seleccionar tipo</option>
                                <option value="DEFAULT">Por Defecto</option>
                                <option value="PLANILLA">Planilla</option>
                                <option value="DEMO">Demo</option>
                            </select>
                        </div>
                        <div ref={dropdownColumnasRef} style={{ position: 'relative', minWidth: '250px' }}>
                            <h3>Añadir Columnas:</h3>
                            <button onClick={() => setDropdownColumnasOpen(!dropdownColumnasOpen)} style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', minHeight: '38px', boxSizing: 'border-box' }}>
                                Seleccionar columnas adicionales
                                <span>{dropdownColumnasOpen ? '▲' : '▼'}</span>
                            </button>
                            {dropdownColumnasOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: '0', zIndex: 2000, backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', marginTop: '5px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', maxHeight: '300px', overflowY: 'auto', width: '100%', boxSizing: 'border-box' }}>
                                    <input type="text" id="search-column-selector-input" placeholder="Buscar columna..." value={searchTermColumnas} onChange={(e) => { e.stopPropagation(); setSearchTermColumnas(e.target.value); }} onClick={(e) => e.stopPropagation()} style={{ width: 'calc(100% - 20px)', padding: '8px 10px', margin: '10px', borderRadius: '4px', border: '1px solid #eee' }} />
                                    <div style={{ padding: '0 10px 10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 10px', gap: '8px', fontWeight: 'bold', borderBottom: '1px solid #eee', fontSize: '0.9em' }}>
                                            <input type="checkbox" onChange={handleSelectAllColumns} checked={columnasAdicionales.length > 0 && columnasAdicionales.every(col => columnasVisibles.includes(col))} disabled={columnasAdicionales.length === 0} style={{ marginRight: '5px', transform: 'scale(0.9)' }} />
                                            Seleccionar Todas
                                        </label>
                                        {filteredColumnasParaSelector.map(col => (
                                            <label key={col} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 10px', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9em' }}>
                                                <input type="checkbox" checked={columnasVisibles.includes(col)} onChange={() => handleToggleColumnaAdicional(col)} style={{ marginRight: '5px', transform: 'scale(0.9)' }} />
                                                {col}
                                                {columnasVisibles.includes(col) && (<span style={{ marginLeft: 'auto', color: 'green', fontSize: '0.8em' }}>✓</span>)}
                                            </label>
                                        ))}
                                        {filteredColumnasParaSelector.length === 0 && (<p style={{ textAlign: 'center', color: '#888', fontSize: '0.9em', padding: '10px' }}>No se encontraron columnas.</p>)}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ alignSelf: 'flex-end', paddingBottom: '5px', marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={exportToXLSX}
                                style={{ padding: '10px 15px', backgroundColor: '#1e6f42', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9em' }}
                                title="Exportar los datos filtrados actualmente visibles en la tabla a un archivo XLSX"
                            >
                                Exportar a XLSX
                            </button>
                            <button onClick={handleClearAllFilters} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9em' }}>
                                Limpiar Todos los Filtros
                            </button>
                        </div>
                    </div>

                    <div style={filterControlSectionStyle}>
                        {columnasConFiltroPredefinido.map(colName =>
                            columnasDisponibles.includes(colName) && (
                                <UniversalFilterDropdown
                                    key={`${colName}-panel-filter`}
                                    columnName={colName}
                                    filterState={filters[colName] || []}
                                    setFilterState={(newValOrCallback) => updateFilter(colName, newValOrCallback)}
                                    allAvailableOptions={getFilteredOptionsForColumn(colName)}
                                    uniqueId={`${colName.replace(/\s+/g, '-')}-panel-filter`}
                                    triggerType="button"
                                    usePortal={false}
                                />
                            )
                        )}
                    </div>

                    {registrosCompletos.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#555', fontSize: '1.1em' }}>Cargando registros...</p>}
                    {registrosCompletos.length > 0 && (
                        columnasVisibles.length > 0 ? (
                            <>
                                <div style={{ overflowX: 'auto', marginTop: '20px', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '60vh' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1090px' }}>
                                        <thead style={{ backgroundColor: '#f2f2f2', position: 'sticky', top: 0, zIndex: 4 }}>
                                            <tr>
                                                <th style={actionsHeaderStyle}>Acciones</th>
                                                {columnasVisibles.map((columna) => (
                                                    <th
                                                        key={columna}
                                                        style={tableHeaderCellStyle(columna, sortConfig.key === columna && sortConfig.direction !== 'none')}
                                                        onClick={() => requestSort(columna)}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
                                                            <span title={columna} style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {columna}
                                                            </span>
                                                            {sortConfig.key === columna ? <SortIndicator direction={sortConfig.direction} /> : <SortIndicator direction="none" />}
                                                            {columnasDisponibles.includes(columna) && (
                                                                <UniversalFilterDropdown
                                                                    columnName={columna}
                                                                    filterState={filters[columna] || []}
                                                                    setFilterState={(newValOrCallback) => updateFilter(columna, newValOrCallback)}
                                                                    allAvailableOptions={getFilteredOptionsForColumn(columna)}
                                                                    uniqueId={`${columna.replace(/\s+/g, '-')}-header-filter`}
                                                                    triggerType="icon"
                                                                    usePortal={true}
                                                                />
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRecords.map((registro, index) => (
                                                <tr key={registro["ID BANNER"] || `row-${index}`} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                                                    <td style={actionsCellStyle(index % 2 === 0)}>
                                                        <button
                                                            onClick={() => handleView(registro)}
                                                            title="Ver registro"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#17a2b8', display: 'inline-flex', alignItems: 'center' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(registro)}
                                                            title="Editar registro"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#007bff', marginLeft: '4px', display: 'inline-flex', alignItems: 'center' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(registro["ID BANNER"])}
                                                            title="Eliminar registro"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#dc3545', marginLeft: '4px', display: 'inline-flex', alignItems: 'center' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </button>
                                                    </td>

                                                    {columnasVisibles.map(columna => (
                                                        <td key={`${registro["ID BANNER"] || `row-${index}`}-${columna}`} style={tableCellStyle(columna)} title={String(registro[columna] || '')}>
                                                            {String(registro[columna] || 'N/A').length > 70 ? String(registro[columna]).substring(0, 67) + '...' : (registro[columna] || 'N/A')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {currentRecords.length === 0 && registrosFiltradosYOrdenados.length > 0 && (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#777', fontSize: '1em' }}>No hay registros en esta página. Pruebe ajustar la paginación o los filtros.</p>
                                )}
                                {registrosFiltradosYOrdenados.length === 0 && registrosCompletos.length > 0 && (
                                    <p style={{ textAlign: 'center', padding: '20px', color: '#777', fontSize: '1em' }}>No hay registros que coincidan con los filtros aplicados.</p>
                                )}
                                {totalPages > 0 && (
                                    <div style={paginationContainerStyle}>
                                        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} style={paginationButtonStyle}>&laquo; Primera</button>
                                        <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={paginationButtonStyle}>‹ Anterior</button>
                                        {getPaginationButtons()}
                                        <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0} style={paginationButtonStyle}>Siguiente ›</button>
                                        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0} style={paginationButtonStyle}>Última &raquo;</button>
                                        <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#555' }}>Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
                                        <select onChange={handleRowsPerPageChange} value={rowsPerPage} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9em', marginLeft: '10px' }}>
                                            {[5, 10, 20, 50, 100].map(size => <option key={size} value={size}>{size} por pág.</option>)}
                                        </select>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ textAlign: 'center', padding: '20px', color: '#555', fontSize: '1.1em' }}>
                                No hay columnas seleccionadas para mostrar. Por favor, seleccione columnas usando el control "Añadir Columnas".
                            </p>
                        )
                    )}
                </>
            )}
        </div>
    );
};

export default TablaDinamica;
