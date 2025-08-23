import React, { useState, useEffect } from 'react';

// --- Iconos SVG para una mejor interfaz ---
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

// --- Componente principal para la gestión de segmentación ---
export default function GestionSegmentacion() {
  const API_URL = 'http://localhost:3001/api/segmentaciones';

  // --- Estados del componente ---
  const [segmentos, setSegmentos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoSegmento, setNuevoSegmento] = useState({ nombre: '', actividad: '', promedioMinimo: '', promedioMaximo: '' });
  const [segmentoEnEdicion, setSegmentoEnEdicion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Funciones para interactuar con la API ---

  // Obtener todos los segmentos (GET)
  const fetchSegmentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const result = await response.json();
      setSegmentos(result.data || result);
    } catch (err) {
      setError(`No se pudieron cargar los datos. Asegúrate de que la API esté funcionando en ${API_URL}. Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchSegmentos();
  }, []);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoSegmento({ ...nuevoSegmento, [name]: value });
  };

  // Manejar el envío del formulario (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = segmentoEnEdicion ? `${API_URL}/${segmentoEnEdicion._id}` : API_URL;
    const method = segmentoEnEdicion ? 'PUT' : 'POST';

    // Prepara el payload para la API, convirtiendo los promedios a float
    const payload = {
      nombre: nuevoSegmento.nombre,
      actividad: nuevoSegmento.actividad,
      promedioMinimo: parseFloat(nuevoSegmento.promedioMinimo) / 100,
      promedioMaximo: parseFloat(nuevoSegmento.promedioMaximo) / 100,
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el segmento');
      }
      resetFormulario();
      await fetchSegmentos(); // Recargar la lista
    } catch (err) {
      setError(err.message);
    }
  };

  // Preparar el formulario para edición
  const handleEdit = (segmento) => {
    setSegmentoEnEdicion(segmento);
    // Convierte los promedios (float) a porcentaje para mostrar en los inputs
    setNuevoSegmento({
      nombre: segmento.nombre,
      actividad: segmento.actividad,
      promedioMinimo: segmento.promedioMinimo * 100,
      promedioMaximo: segmento.promedioMaximo * 100,
    });
    setMostrarFormulario(true);
    window.scrollTo(0, 0); // Desplazar al inicio para ver el formulario
  };

  // Eliminar un segmento (DELETE)
  const handleDelete = async (id) => {
    // Reemplazamos window.confirm por un modal o una lógica no bloqueante en una app real
    if (confirm('¿Estás seguro de que quieres eliminar este segmento?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al eliminar');
        }
        await fetchSegmentos(); // Recargar la lista
      } catch (err) {
        setError(err.message);
      }
    }
  };
  
  // Limpiar y ocultar el formulario
  const resetFormulario = () => {
    setMostrarFormulario(false);
    setNuevoSegmento({ nombre: '', actividad: '', promedioMinimo: '', promedioMaximo: '' });
    setSegmentoEnEdicion(null);
    setError(null);
  };

  // --- Renderizado del componente ---
  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Segmentación</h1>
          <button
            onClick={() => mostrarFormulario ? resetFormulario() : setMostrarFormulario(true)}
            className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105"
          >
            <PlusCircleIcon />
            {mostrarFormulario ? 'Cancelar' : 'Nuevo Segmento'}
          </button>
        </div>

        {/* --- Mensaje de Error Global --- */}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
                <p className="font-bold">¡Error!</p>
                <p>{error}</p>
            </div>
        )}

        {/* --- Formulario de Registro/Edición --- */}
        {mostrarFormulario && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-gray-200 animate-fade-in-down">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              {segmentoEnEdicion ? 'Editar Segmento' : 'Registrar Nuevo Segmento'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-600 mb-1">Nombre Segmentación</label>
                  <input type="text" id="nombre" name="nombre" value={nuevoSegmento.nombre} onChange={handleInputChange} placeholder="Ej: Docentes D" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="actividad" className="block text-sm font-medium text-gray-600 mb-1">Actividad</label>
                  <input type="text" id="actividad" name="actividad" value={nuevoSegmento.actividad} onChange={handleInputChange} placeholder="Ej: Seguimiento" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="promedioMinimo" className="block text-sm font-medium text-gray-600 mb-1">Promedio Mínimo (%)</label>
                  <input type="number" id="promedioMinimo" name="promedioMinimo" value={nuevoSegmento.promedioMinimo} onChange={handleInputChange} placeholder="Ej: 0" min="0" max="100" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label htmlFor="promedioMaximo" className="block text-sm font-medium text-gray-600 mb-1">Promedio Máximo (%)</label>
                  <input type="number" id="promedioMaximo" name="promedioMaximo" value={nuevoSegmento.promedioMaximo} onChange={handleInputChange} placeholder="Ej: 75" min="0" max="100" required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="mt-6 text-right">
                <button type="submit" className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-colors">
                  {segmentoEnEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Tabla de Segmentos --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-6 text-center text-gray-500">Cargando segmentos...</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre Segmentación</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actividad</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rango de Promedio</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {segmentos.length > 0 ? segmentos.map((segmento) => (
                    <tr key={segmento._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{segmento.nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{segmento.actividad}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {Math.round(segmento.promedioMinimo * 100)}% - {Math.round(segmento.promedioMaximo * 100)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button onClick={() => handleEdit(segmento)} className="text-indigo-600 hover:text-indigo-900 transition-colors p-2 rounded-full hover:bg-indigo-100" title="Editar">
                          <EditIcon />
                        </button>
                        <button onClick={() => handleDelete(segmento._id)} className="text-red-600 hover:text-red-900 ml-4 transition-colors p-2 rounded-full hover:bg-red-100" title="Eliminar">
                          <DeleteIcon />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan="4" className="text-center py-10 text-gray-500">No hay segmentos para mostrar.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
