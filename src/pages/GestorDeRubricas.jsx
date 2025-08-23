import React, { useState, useMemo, useEffect, useCallback } from 'react';
// Make sure the path to your Rubrica component is correct
// For this example, we'll assume a placeholder for the Rubrica component
import Rubrica from '../components/Rubrica';

// Placeholder for the Rubrica component as it's not provided
// const Rubrica = ({ onCancel, onSave, initialData, rubricTemplate, isLoading }) => (
//     <div className="bg-white p-8 rounded-2xl shadow-md">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">
//             {initialData ? `Editing: ${rubricTemplate?.name}` : `Creating New Evaluation: ${rubricTemplate?.name}`}
//         </h2>
//         <p className="mb-4">This is a placeholder for the <strong>Rubrica</strong> component.</p>
//         <div className="space-y-4">
//             <div><strong>Template:</strong> {rubricTemplate?.name} v{rubricTemplate?.version}</div>
//             <div><strong>Initial Data:</strong> {initialData ? `Editing existing entry ID: ${initialData._id}` : 'Creating new entry.'}</div>
//             {isLoading && <p>Loading...</p>}
//         </div>
//         <div className="flex justify-end space-x-4 mt-8">
//             <button onClick={onCancel} className="px-6 py-2 text-base font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
//             <button onClick={() => onSave({})} className="px-6 py-2 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
//         </div>
//     </div>
// );


// --- Iconos y Componentes de UI (sin cambios) ---
const EyeIcon = ({ className = 'w-6 h-6' }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg> );
const EditIcon = ({ className = 'w-6 h-6' }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg> );
const TrashIcon = ({ className = 'w-6 h-6' }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg> );
const SearchIcon = ({ className = 'w-6 h-6', size = 20 }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );
const PlusIcon = ({ className = 'w-6 h-6', size = 16 }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> );
const AlertTriangleIcon = ({ className = 'w-12 h-12' }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> );

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <div className="text-base text-gray-600 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 text-base bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-base bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmar</button>
                </div>
            </div>
        </div>
    );
};

const SelectRubricTypeModal = ({ isOpen, onClose, onConfirm, templates, isLoading }) => {
    const [selectedId, setSelectedId] = useState('');

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedId) {
            onConfirm(selectedId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                <h3 className="text-2xl font-bold mb-2">Seleccionar Plantilla de Rúbrica</h3>
                <p className="text-gray-600 mb-6">Elige la plantilla que deseas utilizar para crear tu nueva evaluación.</p>
                
                <div className="space-y-4 mb-8 min-h-[150px]">
                    {isLoading ? (
                        <p className="text-center text-gray-500">Cargando plantillas...</p>
                    ) : (
                        templates.map(template => (
                            <label key={template._id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedId === template._id ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:bg-gray-100'}`}>
                                <input type="radio" name="rubricType" value={template._id} checked={selectedId === template._id} onChange={() => setSelectedId(template._id)} className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                <span className="ml-4 text-lg font-medium text-gray-800">{template.name} <span className="text-sm font-normal text-gray-500">v{template.version}</span></span>
                            </label>
                        ))
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-6 py-2 text-base font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button onClick={handleConfirm} disabled={!selectedId || isLoading} className="px-6 py-2 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">Continuar</button>
                </div>
            </div>
        </div>
    );
};

const RubricDetailView = ({ onBackToList, onSave, initialData, rubricTemplate, isLoading }) => {
    const isCreating = !initialData;

    return (
        <Rubrica 
            onCancel={onBackToList} 
            onSave={onSave}
            initialData={initialData} 
            rubricTemplate={rubricTemplate}
            isLoading={isLoading}
        />
    );
};

// --- Componente Principal ---
function App() {
    const [rubrics, setRubrics] = useState([]);
    const [filters, setFilters] = useState({ searchTerm: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, rubricId: null });
    const [typeModalState, setTypeModalState] = useState({ isOpen: false });
    const [currentView, setCurrentView] = useState('list');
    const [selectedRubric, setSelectedRubric] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Estados para gestionar las plantillas ---
    const [rubricTemplates, setRubricTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isTemplateLoading, setIsTemplateLoading] = useState(false);

    const ITEMS_PER_PAGE = 5;
    const API_URL_RUBRICAS = 'http://localhost:3002/api/rubricas';
    const API_URL_TEMPLATES = 'http://localhost:3002/api/rubrica-templates';

    // --- [MODIFICADO] Lógica para obtener datos de la API ---
    const fetchRubrics = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL_RUBRICAS);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            const data = await response.json();
            // Map data to the new structure requested, including template name
            const formattedData = data.map(item => ({
                id: item._id,
                teacherName: item.teacherInfo?.teacherName || 'No especificado',
                specialistName: item.teacherInfo?.specialistName || 'No especificado',
                program: item.teacherInfo?.program || 'No especificado',
                observationNumber: item.teacherInfo?.observationNumber || 'N/A',
                templateName: item.templateInfo?.name || 'No especificado', // <-- AÑADIDO
            }));
            setRubrics(formattedData);
        } catch (err) {
            console.error("Error al obtener las rúbricas:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (currentView === 'list') {
            fetchRubrics();
        }
    }, [currentView, fetchRubrics]);
    
    // --- Lógica para manejar las vistas y datos seleccionados ---
    const handleViewOrEditRubric = useCallback(async (rubricId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL_RUBRICAS}/${rubricId}`);
            if (!response.ok) throw new Error(`Observación no encontrada (ID: ${rubricId})`);
            const data = await response.json();
            setSelectedRubric(data);
            console.log("Datos de la rúbrica seleccionada:", data);

            // Transforma el documento "congelado" en un objeto de plantilla que el componente Rubrica entiende.
            const templateForViewing = {
                name: data.templateInfo.name,
                version: data.templateInfo.version,
                _id: data.templateInfo.templateId,
                structure: data.rubricDetails, // La estructura ya está congelada aquí
                evaluationLevels: data.evaluationLevels || ['NO SE OBSERVÓ', 'AUSENTE', 'INCIPIENTE', 'EN DESARROLLO', 'REFERENTE'],
                levelOrder: data.levelOrder || { "NO SE OBSERVÓ": 0, "AUSENTE": 1, "INCIPIENTE": 2, "EN DESARROLLO": 3, "REFERENTE": 4 },
                competencies: data.reportSummary.competencies.reduce((acc, comp) => {
                    acc[comp.name] = comp.description;
                    return acc;
                }, {})
            };
            setSelectedTemplate(templateForViewing);
            setCurrentView('detail');
        } catch (err) {
            console.error("Error al obtener el detalle de la rúbrica:", err);
            setError(err.message);
            setCurrentView('list');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleGenerateRubric = async () => {
        setIsTemplateLoading(true);
        setTypeModalState({ isOpen: true });
        try {
            const response = await fetch(API_URL_TEMPLATES);
            if (!response.ok) throw new Error('No se pudieron cargar las plantillas.');
            const templatesData = await response.json();
            setRubricTemplates(templatesData);
        } catch (err) {
            console.error(err);
            // Aquí podrías mostrar una notificación de error en el modal
        } finally {
            setIsTemplateLoading(false);
        }
    };
    
    const handleTypeSelected = async (templateId) => {
        setTypeModalState({ isOpen: false });
        setIsLoading(true);
        setCurrentView('detail');
        try {
            const response = await fetch(`${API_URL_TEMPLATES}/${templateId}`);
            if (!response.ok) throw new Error('No se pudo cargar la plantilla seleccionada.');
            const templateData = await response.json();
            setSelectedTemplate(templateData);
            setSelectedRubric(null); // Aseguramos que estamos en modo creación
        } catch (err) {
            console.error(err);
            setError(err.message);
            setCurrentView('list'); // Si falla, volvemos a la lista
        } finally {
            setIsLoading(false);
        }
    };

    // --- Lógica de Guardado ---
    const handleSave = async (payload) => {
        const isUpdating = selectedRubric && selectedRubric._id;
        const url = isUpdating ? `${API_URL_RUBRICAS}/${selectedRubric._id}` : API_URL_RUBRICAS;
        const method = isUpdating ? 'PUT' : 'POST';

        setIsLoading(true);
        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al ${isUpdating ? 'actualizar' : 'guardar'} la rúbrica.`);
            }
            handleBackToList(); // Volver a la lista si todo fue bien
        } catch (err) {
            console.error("Error en la operación de guardado:", err);
            setError(err.message); // Podrías mostrar este error en una notificación
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToList = () => {
        setSelectedRubric(null);
        setSelectedTemplate(null);
        setCurrentView('list');
    };

    // --- Lógica para el modal y eliminación ---
    const openDeleteModal = (rubricId) => setDeleteModalState({ isOpen: true, rubricId: rubricId });
    const closeDeleteModal = () => setDeleteModalState({ isOpen: false, rubricId: null });
    const handleDelete = async () => {
        if (!deleteModalState.rubricId) return;
        try {
            const response = await fetch(`${API_URL_RUBRICAS}/${deleteModalState.rubricId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('No se pudo eliminar la rúbrica.');
            fetchRubrics(); // Recargar la lista después de eliminar
        } catch (err) {
            console.error("Error al eliminar la rúbrica:", err);
            setError(err.message);
        } finally {
            closeDeleteModal();
        }
    };
    
    // --- [MODIFICADO] Lógica de filtrado y paginación ---
    const handleFilterChange = (e) => { setFilters(prev => ({ ...prev, [e.target.name]: e.target.value })); setCurrentPage(1); };
    
    const filteredRubrics = useMemo(() => 
        rubrics.filter(r =>
            (r.teacherName?.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
            (r.specialistName?.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
            (r.program?.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
            (r.templateName?.toLowerCase().includes(filters.searchTerm.toLowerCase())) // <-- AÑADIDO
        ), [rubrics, filters]
    );

    const paginatedRubrics = useMemo(() => { const start = (currentPage - 1) * ITEMS_PER_PAGE; return filteredRubrics.slice(start, start + ITEMS_PER_PAGE); }, [filteredRubrics, currentPage]);
    const totalPages = Math.ceil(filteredRubrics.length / ITEMS_PER_PAGE);

    // --- [MODIFICADO] Columnas de la tabla ---
    const tableColumns = [
        { header: 'Nombre del docente', accessor: 'teacherName' },
        { header: 'Nombre del especialista', accessor: 'specialistName' },
        { header: 'Programa', accessor: 'program' },
        { header: 'Nombre de Rúbrica', accessor: 'templateName' }, // <-- AÑADIDO
        { header: 'Nro de observación', accessor: 'observationNumber' },
        { 
            header: 'Acciones', accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex items-center justify-center space-x-4">
                    <button onClick={() => handleViewOrEditRubric(row.id)} className="text-blue-600 hover:text-blue-800" title="Ver"><EyeIcon className="w-5 h-5"/></button>
                    <button onClick={() => handleViewOrEditRubric(row.id)} className="text-green-600 hover:text-green-800" title="Editar"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => openDeleteModal(row.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                </div>
            )
        },
    ];

    const renderContent = () => {
        if (isLoading) return (<tr><td colSpan={tableColumns.length} className="text-center py-20"><p>Cargando...</p></td></tr>);
        if (error) return (<tr><td colSpan={tableColumns.length} className="text-center py-20 text-red-600"><p>Error: {error}</p></td></tr>);
        if (paginatedRubrics.length === 0) return (<tr><td colSpan={tableColumns.length} className="text-center py-20"><p>No se encontraron rúbricas.</p></td></tr>);
        return paginatedRubrics.map((record) => (
            <tr key={record.id} className="border-b hover:bg-gray-50">
                {tableColumns.map(col => (
                    <td key={col.accessor} className="px-6 py-5 whitespace-nowrap text-gray-800">
                        {col.Cell ? <col.Cell row={record} /> : record[col.accessor] || 'N/A'}
                    </td>
                ))}
            </tr>
        ));
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900 p-4 sm:p-6 lg:p-8">
            <div>
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">Ejecución del Acompañamiento</h1>
                    <p className="text-lg text-gray-600 mt-2">Crea, busca y administra tus rúbricas de evaluación.</p>
                </header>

                {currentView === 'list' ? (
                    <>
                        <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
                            <div className="flex flex-wrap gap-6 justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Mis Rúbricas</h2>
                                <button onClick={handleGenerateRubric} className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <PlusIcon size={20} className="mr-2" /> Generar Rúbrica
                                </button>
                            </div>
                            <fieldset>
                                <div className="relative">
                                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                                    {/* --- [MODIFICADO] Placeholder del buscador --- */}
                                    <input type="text" name="searchTerm" placeholder="Buscar por docente, especialista, programa o rúbrica..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full text-base pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                                </div>
                            </fieldset>
                        </div>
                        <div className="overflow-hidden bg-white rounded-2xl shadow-md">
                            <div className="p-8">
                                <div className="text-base text-gray-600 mb-5">Mostrando <strong>{paginatedRubrics.length}</strong> de <strong>{filteredRubrics.length}</strong> registros.</div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-base text-left text-gray-600">
                                        <thead className="text-sm text-gray-700 uppercase bg-gray-100">
                                            <tr>{tableColumns.map(col => <th key={col.accessor} scope="col" className="px-6 py-4 tracking-wider">{col.header}</th>)}</tr>
                                        </thead>
                                        <tbody>{renderContent()}</tbody>
                                    </table>
                                </div>
                            </div>
                            {totalPages > 1 && !isLoading && !error && (
                               <div className="flex justify-between items-center p-5 border-t border-gray-200">
                                   <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">Anterior</button>
                                   <span className="text-base text-gray-700">Página {currentPage} de {totalPages}</span>
                                   <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">Siguiente</button>
                               </div>
                            )}
                        </div>
                    </>
                ) : (
                    <RubricDetailView 
                        onBackToList={handleBackToList} 
                        onSave={handleSave}
                        initialData={selectedRubric} 
                        rubricTemplate={selectedTemplate}
                        isLoading={isLoading}
                    />
                )}
            </div>
            <ConfirmationModal 
                isOpen={deleteModalState.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                title="Confirmar Eliminación"
            >
                ¿Estás seguro de que deseas eliminar esta rúbrica? Esta acción no se puede deshacer.
            </ConfirmationModal>
            <SelectRubricTypeModal
                isOpen={typeModalState.isOpen}
                onClose={() => setTypeModalState({ isOpen: false })}
                onConfirm={handleTypeSelected}
                templates={rubricTemplates}
                isLoading={isTemplateLoading}
            />
        </div>
    );
}

export default App;
