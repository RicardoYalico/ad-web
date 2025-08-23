import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

// --- Iconos ---
const EditIcon = ({ className = 'w-6 h-6' }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg> );
const TrashIcon = ({ className = 'w-6 h-6' }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg> );
const SearchIcon = ({ className = 'w-6 h-6', size = 20 }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> );
const PlusIcon = ({ className = 'w-6 h-6', size = 16 }) => ( <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> );

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const initialFormState = {
    name: '', version: '', levels: [], structure: [], competencies: []
};

function RubricTemplatesManager() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [apiActionLoading, setApiActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    const API_URL = 'http://localhost:3002/api/rubrica-templates';

    const fetchTemplates = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.get(API_URL);
            setTemplates(response.data);
        } catch (err) {
            setError('Error al cargar las plantillas. Asegúrate de que el servidor esté corriendo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        setApiActionLoading(true);
        setError('');
        const payload = {
            name: formData.name,
            version: formData.version,
            structure: formData.structure,
            evaluationLevels: formData.levels.map(level => level.name),
            levelOrder: formData.levels.reduce((acc, level) => {
                if (level.name) acc[level.name] = Number(level.value) || 0;
                return acc;
            }, {}),
            competencies: formData.competencies.reduce((acc, item) => {
                if (item.key) acc[item.key] = item.value;
                return acc;
            }, {}),
        };
        try {
            if (selectedTemplate) {
                await axios.put(`${API_URL}/${selectedTemplate._id}`, payload);
            } else {
                await axios.post(API_URL, payload);
            }
            closeModal();
            fetchTemplates();
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al guardar.');
            console.error(err);
        } finally {
            setApiActionLoading(false);
        }
    };

    const handleDeleteTemplate = async () => {
        if (!selectedTemplate) return;
        setApiActionLoading(true);
        setError('');
        try {
            await axios.delete(`${API_URL}/${selectedTemplate._id}`);
            closeDeleteConfirm();
            fetchTemplates();
        } catch (err) {
            setError(err.response?.data?.message || 'Ocurrió un error al eliminar.');
            console.error(err);
        } finally {
            setApiActionLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDynamicListChange = (listName, index, field, value) => {
        const updatedList = [...formData[listName]];
        updatedList[index][field] = value;
        setFormData(prev => ({ ...prev, [listName]: updatedList }));
    };

    const addDynamicListItem = (listName, newItem) => {
        setFormData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] }));
    };

    const removeDynamicListItem = (listName, index) => {
        const updatedList = formData[listName].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [listName]: updatedList }));
    };

    const handleCompetencyCheckboxChange = (structureIndex, competencyKey, isChecked) => {
        const currentCompetencyString = formData.structure[structureIndex].competency || '';
        const currentCompetencies = new Set(currentCompetencyString.split(', ').filter(Boolean));
        if (isChecked) {
            currentCompetencies.add(competencyKey);
        } else {
            currentCompetencies.delete(competencyKey);
        }
        const newCompetencyString = Array.from(currentCompetencies).join(', ');
        handleDynamicListChange('structure', structureIndex, 'competency', newCompetencyString);
    };

    const openModalForCreate = () => {
        setSelectedTemplate(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
        setError('');
    };

    const openModalForEdit = (template) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            version: template.version,
            structure: template.structure || [],
            levels: (template.evaluationLevels || []).map(name => ({ name, value: template.levelOrder?.[name] ?? '' })),
            competencies: Object.entries(template.competencies || {}).map(([key, value]) => ({ key, value })),
        });
        setIsModalOpen(true);
        setError('');
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTemplate(null);
        setFormData(initialFormState);
        setError('');
    };

    const openDeleteConfirm = (template) => {
        setSelectedTemplate(template);
        setIsDeleteConfirmOpen(true);
        setError('');
    };

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setSelectedTemplate(null);
    };

    const filteredTemplates = useMemo(() => 
        templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [templates, searchTerm]
    );

    const paginatedTemplates = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredTemplates, currentPage]);

    const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="">
                <header className="mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">Formatos de Rúbricas</h1>
                    <p className="text-lg text-gray-600 mt-2">Crea, busca y administra tus plantillas de rúbricas.</p>
                </header>

                <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
                    <div className="flex flex-wrap gap-6 justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Mis Plantillas</h2>
                        <button onClick={openModalForCreate} className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <PlusIcon size={20} className="mr-2" /> Crear Plantilla
                        </button>
                    </div>
                    <fieldset>
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                            <input type="text" name="searchTerm" placeholder="Buscar por nombre de plantilla..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full text-base pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                        </div>
                    </fieldset>
                </div>

                <div className="overflow-hidden bg-white rounded-2xl shadow-md">
                    <div className="p-8">
                        <div className="text-base text-gray-600 mb-5">Mostrando <strong>{paginatedTemplates.length}</strong> de <strong>{filteredTemplates.length}</strong> registros.</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left text-gray-600">
                                <thead className="text-sm text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 tracking-wider">Nombre</th>
                                        <th scope="col" className="px-6 py-4 tracking-wider">Versión</th>
                                        <th scope="col" className="px-6 py-4 tracking-wider">Última Modificación</th>
                                        <th scope="col" className="px-6 py-4 tracking-wider text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="text-center py-20"><p>Cargando...</p></td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="4" className="text-center py-20 text-red-600"><p>{error}</p></td></tr>
                                    ) : paginatedTemplates.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-20"><p>No se encontraron plantillas.</p></td></tr>
                                    ) : (
                                        paginatedTemplates.map(template => (
                                            <tr key={template._id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-5 whitespace-nowrap text-gray-800 font-medium">{template.name}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-gray-800">{template.version}</td>
                                                <td className="px-6 py-5 whitespace-nowrap text-gray-800">{new Date(template.updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center justify-center space-x-4">
                                                        <button onClick={() => openModalForEdit(template)} className="text-green-600 hover:text-green-800" title="Editar"><EditIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => openDeleteConfirm(template)} className="text-red-600 hover:text-red-800" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {totalPages > 1 && !isLoading && !error && (
                        <div className="flex justify-between items-center p-5 border-t border-gray-200">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">Anterior</button>
                            <span className="text-base text-gray-700">Página {currentPage} de {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-5 py-2 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50">Siguiente</button>
                        </div>
                    )}
                </div>

                {/* Modal para Crear/Editar (sin cambios en la lógica interna) */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">{selectedTemplate ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}</h2>
                            {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>)}
                            <form onSubmit={handleSaveTemplate} className="space-y-8">
                                <div className="p-4 border rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">Información General</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Rúbrica</label>
                                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">Versión</label>
                                            <input type="text" name="version" id="version" value={formData.version} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-800 mb-3">Niveles de Evaluación y su Orden</h3>
                                        <div className="space-y-3">
                                            {formData.levels.map((item, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <input type="text" placeholder="Nombre del Nivel" value={item.name} onChange={(e) => handleDynamicListChange('levels', index, 'name', e.target.value)} className="flex-grow px-2 py-1 border border-gray-300 rounded-md" />
                                                    <input type="number" placeholder="Valor" value={item.value} onChange={(e) => handleDynamicListChange('levels', index, 'value', e.target.value)} className="w-20 px-2 py-1 border border-gray-300 rounded-md" />
                                                    <button type="button" onClick={() => removeDynamicListItem('levels', index)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></button>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addDynamicListItem('levels', { name: '', value: '' })} className="mt-3 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md transition duration-300">+ Añadir Nivel</button>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-800 mb-3">Competencias</h3>
                                        <div className="space-y-3">
                                            {formData.competencies.map((item, index) => (
                                                <div key={index} className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <input type="text" placeholder="ID Competencia (Ej: C1)" value={item.key} onChange={(e) => handleDynamicListChange('competencies', index, 'key', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md" />
                                                        <button type="button" onClick={() => removeDynamicListItem('competencies', index)} className="text-red-500 hover:text-red-700 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg></button>
                                                    </div>
                                                    <textarea placeholder="Descripción detallada de la competencia..." value={item.value} onChange={(e) => handleDynamicListChange('competencies', index, 'value', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md" rows="3"></textarea>
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={() => addDynamicListItem('competencies', { key: '', value: '' })} className="mt-3 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md transition duration-300">+ Añadir Competencia</button>
                                    </div>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h3 className="text-lg font-medium text-gray-800 mb-3">Estructura de la Rúbrica</h3>
                                    <div className="space-y-4">
                                        {formData.structure.map((item, index) => (
                                            <div key={index} className="p-3 border rounded-md bg-gray-50 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-gray-600">Ítem de Estructura #{index + 1}</span>
                                                    <button type="button" onClick={() => removeDynamicListItem('structure', index)} className="bg-red-500 text-white text-xs px-2 py-1 rounded-md hover:bg-red-600">Quitar</button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600 mb-1">Momento</label>
                                                        <textarea placeholder="Ej: DISEÑO DE LA EXPERIENCIA..." value={item.moment} onChange={(e) => handleDynamicListChange('structure', index, 'moment', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md" rows="2"></textarea>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-600 mb-1">Criterio</label>
                                                        <textarea placeholder="Ej: Logro de la sesión de aprendizaje" value={item.criterion} onChange={(e) => handleDynamicListChange('structure', index, 'criterion', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md" rows="2"></textarea>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-600 mb-1">Aspecto a Evaluar</label>
                                                        <textarea placeholder="Ej: (1) La redacción del logro de aprendizaje permite que se entienda..." value={item.aspect} onChange={(e) => handleDynamicListChange('structure', index, 'aspect', e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-md" rows="3"></textarea>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-600 mb-1">Competencia(s) Asociada(s)</label>
                                                        <div className="p-2 border rounded-md bg-white max-h-32 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {formData.competencies.length > 0 ? (
                                                                formData.competencies.map((comp, compIndex) => (
                                                                    comp.key && (
                                                                        <div key={compIndex} className="flex items-center">
                                                                            <input type="checkbox" id={`comp-${index}-${compIndex}`} value={comp.key} checked={(item.competency || '').split(', ').includes(comp.key)} onChange={(e) => handleCompetencyCheckboxChange(index, comp.key, e.target.checked)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                                                            <label htmlFor={`comp-${index}-${compIndex}`} className="ml-2 block text-sm text-gray-900">{comp.key}</label>
                                                                        </div>
                                                                    )
                                                                ))
                                                            ) : (
                                                                <p className="text-sm text-gray-500 sm:col-span-2">Añada competencias en la sección de "Competencias" para poder seleccionarlas aquí.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={() => addDynamicListItem('structure', { moment: '', criterion: '', aspect: '', competency: '' })} className="mt-4 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300">+ Añadir Ítem a Estructura</button>
                                </div>
                                <div className="flex justify-end space-x-4 pt-4">
                                    <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300">Cancelar</button>
                                    <button type="submit" disabled={apiActionLoading} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 shadow-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                                        {apiActionLoading && <Spinner />}
                                        {selectedTemplate ? 'Guardar Cambios' : 'Crear Plantilla'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación para eliminar */}
                {isDeleteConfirmOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
                        <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-sm w-full">
                            <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
                            <p className="text-gray-600 mt-2">¿Estás seguro de que quieres eliminar la plantilla "{selectedTemplate?.name}"? Esta acción no se puede deshacer.</p>
                            {error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">{error}</div>)}
                            <div className="mt-6 flex justify-end space-x-4">
                                <button onClick={closeDeleteConfirm} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button>
                                <button onClick={handleDeleteTemplate} disabled={apiActionLoading} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center disabled:opacity-50">
                                    {apiActionLoading && <Spinner />}
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RubricTemplatesManager;
