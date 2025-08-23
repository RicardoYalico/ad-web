import React, { useState, useMemo, useEffect, useCallback } from 'react';

// Asumo que el componente Rubrica existe en esta ruta.
// Este componente debería manejar la creación de una nueva rúbrica (POST a la API).
// import Rubrica from '../components/Rubrica'; 

// --- Componente Placeholder para Rubrica (si no lo tienes aún) ---
// Este es un sustituto para que el código sea funcional. Reemplázalo con tu componente real.
const Rubrica = ({ onCancel, onRubricCreated }) => {
    // Lógica del formulario para crear una rúbrica...
    // Al terminar, podrías llamar a onRubricCreated() para refrescar la lista.
    return (
        <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Formulario de Creación de Rúbrica</h3>
            <p className="text-gray-600 mb-6">Aquí iría tu componente de formulario para crear una nueva rúbrica.</p>
            <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
                Volver a la lista
            </button>
        </div>
    );
};


// --- Iconos (usando SVG en línea para simplicidad) ---
const EyeIcon = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EditIcon = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
);
const TrashIcon = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
);
const SearchIcon = ({ className = 'w-6 h-6', size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const PlusIcon = ({ className = 'w-6 h-6', size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
const AlertTriangleIcon = ({ className = 'w-12 h-12' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);


// --- Componente de Modal (Básico) ---
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

// --- Componente para el Formulario de Nueva Rúbrica ---
const RubricForm = ({ onBackToList }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nueva Rúbrica</h2>
      {/* Pasamos la función onBackToList al componente Rubrica como una prop llamada `onCancel` */}
      <Rubrica onCancel={onBackToList} onRubricCreated={onBackToList} />
    </div>
  );
};

// --- Componente Principal ---
function App() {
  const [rubrics, setRubrics] = useState([]);
  const [filters, setFilters] = useState({ searchTerm: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({ isOpen: false, rubricId: null });
  const [currentView, setCurrentView] = useState('list'); // 'list' o 'form'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const API_URL = 'http://localhost:3002/api/rubricas';

  // --- Lógica para obtener datos de la API ---
  const fetchRubrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const data = await response.json();
        
        // Mapear los datos de la API a la estructura que el frontend espera
        const formattedData = data.map(item => ({
            id: item._id,
            name: item.teacherInfo?.courseName || 'Sin nombre',
            course: item.teacherInfo?.program || 'No especificado',
            creationDate: new Date(item.teacherInfo?.observationDate).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
        }));
        setRubrics(formattedData);

    } catch (err) {
        console.error("Error al obtener las rúbricas:", err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }, []); // useCallback para memorizar la función

  // useEffect para cargar los datos cuando la vista cambia a 'list'
  useEffect(() => {
    if (currentView === 'list') {
        fetchRubrics();
    }
  }, [currentView, fetchRubrics]);


  // --- Lógica para el modal y eliminación ---
  const openDeleteModal = (rubricId) => {
    setModalState({ isOpen: true, rubricId: rubricId });
  };

  const closeDeleteModal = () => {
    setModalState({ isOpen: false, rubricId: null });
  };

  const handleDelete = async () => {
    if (modalState.rubricId) {
        try {
            const response = await fetch(`${API_URL}/${modalState.rubricId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                // Si el backend devuelve un error, lo lanzamos para que lo capture el catch
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo eliminar la rúbrica.');
            }
            // Si la eliminación fue exitosa, actualizamos el estado local
            setRubrics(rubrics.filter(r => r.id !== modalState.rubricId));
            console.log(`Rúbrica con id ${modalState.rubricId} eliminada.`);
        } catch (err) {
            console.error("Error al eliminar la rúbrica:", err);
            // Opcional: Mostrar un mensaje de error al usuario
            alert(`Error: ${err.message}`);
        } finally {
            closeDeleteModal();
        }
    }
  };
  
  // Lógica para cambiar la vista al formulario de creación
  const handleGenerateRubric = () => {
    console.log("Navegando al formulario para crear rúbrica.");
    setCurrentView('form');
  };

  // Manejador para actualizar los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    setCurrentPage(1); // Resetear a la primera página al cambiar filtros
  };

  // Filtrar y paginar las rúbricas
  const filteredRubrics = useMemo(() => rubrics.filter(rubric => 
    (rubric.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
     rubric.course.toLowerCase().includes(filters.searchTerm.toLowerCase()))
  ), [rubrics, filters]);

  const paginatedRubrics = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRubrics.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRubrics, currentPage]);

  const totalPages = Math.ceil(filteredRubrics.length / ITEMS_PER_PAGE);

  // Definición de columnas para la tabla (sin 'Grado')
  const tableColumns = [
    { header: 'Nombre de la Rúbrica', accessor: 'name' },
    { header: 'Programa/Curso', accessor: 'course' },
    { header: 'Fecha de Observación', accessor: 'creationDate' },
    { 
      header: 'Acciones', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex items-center justify-center space-x-4">
          <button className="text-blue-600 hover:text-blue-800" title="Ver"><EyeIcon className="w-5 h-5"/></button>
          <button className="text-green-600 hover:text-green-800" title="Editar"><EditIcon className="w-5 h-5"/></button>
          <button onClick={() => openDeleteModal(row.id)} className="text-red-600 hover:text-red-800" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
        </div>
      )
    },
  ];

  // --- Renderizado del componente ---
  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="text-center py-20">
                <p className="text-lg text-gray-500">Cargando rúbricas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-600">
                <AlertTriangleIcon className="mx-auto text-red-500 w-16 h-16" />
                <p className="text-xl font-semibold mt-4">Error al cargar los datos</p>
                <p className="text-gray-600 mt-2">No se pudo establecer conexión con el servidor. Por favor, inténtalo de nuevo más tarde.</p>
                <p className="text-sm text-gray-500 mt-1">Detalle: {error}</p>
            </div>
        );
    }
    
    if (paginatedRubrics.length > 0) {
        return paginatedRubrics.map((record) => (
            <tr key={record.id} className="border-b hover:bg-gray-50">
                {tableColumns.map(col => (
                    <td key={col.accessor} className="px-6 py-5 whitespace-nowrap text-gray-800">
                        {col.Cell ? <col.Cell row={record} /> : record[col.accessor] || 'N/A'}
                    </td>
                ))}
            </tr>
        ));
    }

    return (
        <tr>
            <td colSpan={tableColumns.length} className="text-center py-20">
                <p className="text-lg text-gray-500">No se encontraron rúbricas.</p>
                <p className="text-base text-gray-400">Intenta ajustar los filtros o crea una nueva rúbrica.</p>
            </td>
        </tr>
    );
  };


  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 p-4 sm:p-6 lg:p-8">
      <div>
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Gestor de Rúbricas</h1>
          <p className="text-lg text-gray-600 mt-2">Crea, busca y administra tus rúbricas de evaluación.</p>
        </header>

        {currentView === 'list' ? (
          <>
            {/* Sección de Filtros y Acciones */}
            <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
                <div className="flex flex-wrap gap-6 justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">Filtrar Rúbricas</h2>
                    <button
                        onClick={handleGenerateRubric}
                        className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <PlusIcon size={20} className="mr-2" />
                        Generar Rúbrica
                    </button>
                </div>
                <p className="text-base text-gray-600 mb-6">
                    Utiliza el buscador para encontrar una rúbrica específica.
                </p>
                <fieldset>
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                        <input
                            type="text"
                            name="searchTerm"
                            placeholder="Buscar por nombre de rúbrica o curso..."
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            className="w-full text-base pl-14 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </fieldset>
            </div>


            {/* Tabla de Rúbricas */}
            <div className="overflow-hidden bg-white rounded-2xl shadow-md min-h-[450px]">
                <div className="p-8">
                    <div className="text-base text-gray-600 mb-5">Mostrando <strong>{paginatedRubrics.length}</strong> de <strong>{filteredRubrics.length}</strong> registros.</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-base text-left text-gray-600">
                            <thead className="text-sm text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    {tableColumns.map(col => <th key={col.accessor} scope="col" className="px-6 py-4 tracking-wider">{col.header}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {renderContent()}
                            </tbody>
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
          <RubricForm onBackToList={() => setCurrentView('list')} />
        )}
      </div>
       <ConfirmationModal 
          isOpen={modalState.isOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          title="Confirmar Eliminación"
      >
          ¿Estás seguro de que deseas eliminar esta rúbrica? Esta acción no se puede deshacer.
      </ConfirmationModal>
    </div>
  );
}

export default App;
