import React, { useState } from 'react';

// --- Componente Principal ---
// Gestiona dos funcionalidades principales a través de pestañas:
// 1. Carga Masiva: Sube un archivo XLSX para crear múltiples registros.
// 2. Ver y Editar: Busca un especialista por DNI para ver y editar su perfil y horarios.
export default function DisponibilidadAcompaniamientoPage() {
  const [activeTab, setActiveTab] = useState('editor'); // 'uploader' o 'editor'

  // --- Componente de la Pestaña de Carga Masiva ---
  const UploaderView = () => {
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState('');
    const [apiStatus, setApiStatus] = useState('idle');
    const [successMessage, setSuccessMessage] = useState('');

    const normalizeKeys = (obj) => {
      const newObj = {};
      for (const key in obj) {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/^disponibilidad/, 'disponibilidad');
        newObj[normalizedKey] = obj[key];
      }
      return newObj;
    };

    const parseAvailability = (day, availabilityString) => {
      if (!availabilityString || typeof availabilityString !== 'string') return [];
      return availabilityString.split(';').map(s => s.trim()).filter(s => s).map(franjaCompleta => {
        const match = franjaCompleta.match(/\d/);
        if (!match) return null;
        const timeString = franjaCompleta.substring(match.index);
        const padTime = (timeStr) => timeStr.replace(/:/g, '').trim().padStart(4, '0');
        const timeParts = timeString.replace(/am|pm/gi, '').split('-');
        if (timeParts.length !== 2) return null;
        const startTime = padTime(timeParts[0]);
        const endTime = padTime(timeParts[1]);
        return { dia: day.toUpperCase(), franja: `${startTime} - ${endTime}` };
      }).filter(Boolean);
    };

    const handleApiSubmit = async () => {
      if (!jsonData || jsonData.length === 0) {
        setError("No hay datos para enviar.");
        return;
      }
      setApiStatus('loading');
      setError('');
      setSuccessMessage('');
      try {
        const response = await fetch('http://localhost:3001/api/disponibilidad-acompaniamiento/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });
        const result = await response.json();
        if (!response.ok) {
          let errorMessage = result.message || 'Ocurrió un error desconocido.';
          if (result.details && Array.isArray(result.details)) {
            const detailsString = result.details.map(d => `DNI ${d.failedDocumentPreview?.dni || 'desconocido'}`).join(', ');
            errorMessage += ` Detalles: ${detailsString} podrían estar duplicados.`;
          }
          throw new Error(errorMessage);
        }
        setApiStatus('success');
        setSuccessMessage(result.message || "¡Datos enviados con éxito!");
      } catch (err) {
        setApiStatus('error');
        setError(err.message || 'Error de conexión. No se pudo conectar con el servidor.');
      }
    };

    const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const validExtensions = ['xlsx'];
      if (!validExtensions.includes(file.name.split('.').pop().toLowerCase())) {
        setError('Formato de archivo no válido. Por favor, sube un archivo .xlsx');
        setJsonData(null);
        return;
      }
      setError('');
      setJsonData(null);
      setApiStatus('idle');
      setSuccessMessage('');
      try {
        const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            const transformedData = data.map(row => {
              const normalizedRow = normalizeKeys(row);
              return {
                nombre: String(normalizedRow.nombre || '').trim().toUpperCase(),
                dni: String(normalizedRow.dni || '').trim(),
                antiguedad: String(normalizedRow.antiguedad || '').trim().toUpperCase(),
                notaRubrica: String(normalizedRow.notarubrica || '').trim(),
                disponibilidadHoras: Number(normalizedRow.disponibilidadhoras) || 0,
                segmentosPreferencia: (normalizedRow.segmentospreferencia || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
                modalidadPreferencia: (normalizedRow.modalidadpreferencia || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
                sedePreferencia: (normalizedRow.sedepreferencia || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
                horarios: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].flatMap(dia => parseAvailability(dia, normalizedRow[`disponibilidad${dia}`])),
              };
            });
            setJsonData(transformedData);
          } catch {
              setError('Ocurrió un error al procesar el archivo. Asegúrate de que las columnas son correctas.');
          }
        };
        reader.readAsBinaryString(file);
        } catch {
          setError('No se pudo cargar la librería de Excel. Revisa tu conexión a internet.');
        }
    };

    return (
      <>
        <div className="bg-slate-900/50 border border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 transition-colors duration-300">
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg className="mx-auto h-12 w-12 text-slate-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p className="mt-4 text-lg text-slate-300"><span className="font-semibold text-cyan-400">Haz clic para subir</span> o arrastra y suelta</p>
            <p className="text-xs text-slate-500 mt-1">Solo archivos .XLSX para carga masiva</p>
          </label>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xlsx" onChange={handleFileUpload} />
        </div>
        <div className="mt-8">
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}
          {jsonData && (
            <div>
              <h3 className="text-2xl font-semibold text-cyan-400 mb-4">Datos Procesados</h3>
              <div className="bg-slate-900 rounded-lg p-4 max-h-[400px] overflow-auto"><pre className="text-sm text-slate-300 whitespace-pre-wrap break-all">{JSON.stringify(jsonData, null, 2)}</pre></div>
              <div className="mt-6 text-center">
                <button onClick={handleApiSubmit} disabled={apiStatus === 'loading'} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed text-lg">{apiStatus === 'loading' ? 'Enviando...' : 'Enviar a API'}</button>
                {apiStatus === 'success' && <p className="text-green-400 mt-4">{successMessage}</p>}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  // --- Componente de la Pestaña de Edición y Visualización ---
  const EditorView = () => {
    const [dni, setDni] = useState('');
    const [specialist, setSpecialist] = useState(null);
    const [originalSpecialist, setOriginalSpecialist] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({});
    const [error, setError] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [downloadStatus, setDownloadStatus] = useState('idle'); // idle, loading, error
    const [downloadError, setDownloadError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!dni) {
            setError('Por favor, ingresa un DNI para buscar.');
            return;
        }
        setStatus('loading');
        setError('');
        setSpecialist(null);
        try {
            const response = await fetch(`http://localhost:3001/api/disponibilidad-acompaniamiento?dniEspecialista=${dni}`);
            const data = await response.json();
            if (!response.ok || data.length === 0) {
                throw new Error('Especialista no encontrado o error en la respuesta.');
            }
            setSpecialist(data[0]);
            setOriginalSpecialist(JSON.parse(JSON.stringify(data[0]))); // Deep copy
            setEditableData({
                segmentosPreferencia: data[0].segmentosPreferencia.join(', '),
                modalidadPreferencia: data[0].modalidadPreferencia.join(', '),
                sedePreferencia: data[0].sedePreferencia.join(', '),
                notaRubrica: data[0].notaRubrica || '',
            });
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setError(err.message);
        }
    };

    const handleUpdate = async () => {
        setStatus('loading');
        setError('');
        try {
            const payload = {
                segmentosPreferencia: editableData.segmentosPreferencia.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
                modalidadPreferencia: editableData.modalidadPreferencia.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
                sedePreferencia: editableData.sedePreferencia.split(',').map(s => s.trim().toUpperCase()).filter(Boolean),
                notaRubrica: editableData.notaRubrica,
                horarios: specialist.horarios, // Enviar el array de horarios actualizado
            };

            const response = await fetch(`http://localhost:3001/api/disponibilidad-acompaniamiento/especialista/${specialist.dni}/perfil`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Error al actualizar el perfil.');
            
            // Actualizar el estado original para reflejar los cambios guardados
            setOriginalSpecialist(JSON.parse(JSON.stringify(specialist)));
            setIsEditing(false);
            setStatus('success');
        } catch (err) {
            setStatus('error');
            setError(err.message);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleHorario = (dia, franja) => {
        setSpecialist(prev => {
            const newHorarios = [...prev.horarios];
            const horarioIndex = newHorarios.findIndex(h => h.dia === dia && h.franja === franja);

            if (horarioIndex > -1) {
                // Si existe, lo elimina
                newHorarios.splice(horarioIndex, 1);
            } else {
                // Si no existe, lo agrega
                newHorarios.push({ dia, franja });
            }
            return { ...prev, horarios: newHorarios };
        });
    };

    const handleCancelEdit = () => {
        setSpecialist(originalSpecialist);
        setIsEditing(false);
        setError('');
    };

    // --- NUEVA FUNCIÓN: Descargar todo en XLSX ---
    const handleDownloadAll = async () => {
        setDownloadStatus('loading');
        setDownloadError('');
        try {
            // 1. Obtener todos los datos de la API
            const response = await fetch('http://localhost:3001/api/disponibilidad-acompaniamiento');
            const allSpecialists = await response.json();

            if (!response.ok || !allSpecialists || allSpecialists.length === 0) {
                throw new Error('No se encontraron datos de disponibilidad para descargar.');
            }

            // 2. Transformar los datos al formato requerido
            const flattenedData = [];
            allSpecialists.forEach(specialist => {
                const baseData = {
                    'NOMBRE': specialist.nombre,
                    'DNI': specialist.dni,
                    'HORAS': specialist.disponibilidadHoras,
                    'SEDES PREFERENCIA': specialist.sedePreferencia.join(', '),
                    'MODALIDAD PREFERENCIA': specialist.modalidadPreferencia.join(', '),
                };

                if (specialist.horarios && specialist.horarios.length > 0) {
                    specialist.horarios.forEach(horario => {
                        flattenedData.push({
                            ...baseData,
                            'DIA': horario.dia,
                            'HORA': horario.franja,
                        });
                    });
                } else {
                    // Incluir especialistas sin horarios definidos
                    flattenedData.push({
                        ...baseData,
                        'DIA': 'N/A',
                        'HORA': 'N/A',
                    });
                }
            });
            
            // 3. Generar y descargar el archivo XLSX
            const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs');
            const ws = XLSX.utils.json_to_sheet(flattenedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Disponibilidad Total");
            XLSX.writeFile(wb, "disponibilidad_total.xlsx");

            setDownloadStatus('idle');
        } catch (err) {
            setDownloadStatus('error');
            setDownloadError(err.message || 'Ocurrió un error al generar el archivo.');
        }
    };

    // --- Componente del Calendario ---
    const CalendarView = ({ horarios, isEditing, onToggle }) => {
        const dias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
        const franjasUnicas = [...new Set(horarios.map(h => h.franja))].sort();
        const horariosMap = new Map(horarios.map(h => [`${h.dia}-${h.franja}`, true]));

        return (
            <div className="overflow-x-auto mt-6">
                <table className="min-w-full bg-slate-900 border border-slate-700 text-center">
                    <thead>
                        <tr className="bg-slate-800">
                            <th className="p-3 border-r border-slate-700">Horario</th>
                            {dias.map(dia => <th key={dia} className="p-3">{dia}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {franjasUnicas.map(franja => (
                            <tr key={franja} className="border-t border-slate-700">
                                <td className="p-3 font-mono border-r border-slate-700">{franja}</td>
                                {dias.map(dia => (
                                    <td 
                                        key={`${dia}-${franja}`} 
                                        className={`p-3 transition-colors duration-200 ${horariosMap.has(`${dia}-${franja}`) ? 'bg-cyan-500/50' : ''} ${isEditing ? 'cursor-pointer hover:bg-slate-700' : ''}`}
                                        onClick={() => isEditing && onToggle(dia, franja)}
                                    >
                                        {horariosMap.has(`${dia}-${franja}`) ? '✓' : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
      <>
        <div className="flex flex-wrap items-start gap-4 mb-8">
            <form onSubmit={handleSearch} className="flex-grow flex gap-4">
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} placeholder="Ingresar DNI del especialista" className="flex-grow bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"/>
                <button type="submit" disabled={status === 'loading'} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 disabled:bg-slate-600">
                    {status === 'loading' ? 'Buscando...' : 'Buscar'}
                </button>
            </form>
            <button 
                onClick={handleDownloadAll} 
                disabled={downloadStatus === 'loading'} 
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 disabled:bg-slate-600 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                {downloadStatus === 'loading' ? 'Generando...' : 'Descargar Todo'}
            </button>
        </div>

        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4" role="alert"><strong className="font-bold">Error de Búsqueda: </strong><span className="block sm:inline">{error}</span></div>}
        {downloadError && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4" role="alert"><strong className="font-bold">Error de Descarga: </strong><span className="block sm:inline">{downloadError}</span></div>}
        
        {specialist && (
          <div className="mt-6 bg-slate-900/50 p-6 rounded-lg">
            <div className="flex justify-between items-start">
                <h3 className="text-3xl font-bold text-cyan-400 mb-4">{specialist.nombre}</h3>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Editar Perfil</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleUpdate} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg">Guardar</button>
                        <button onClick={handleCancelEdit} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    </div>
                )}
            </div>
            <p className="text-slate-400">DNI: {specialist.dni} | Antigüedad: {specialist.antiguedad} | Horas: {specialist.disponibilidadHoras}</p>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Segmentos de Preferencia</label>
                    {isEditing ? <input type="text" name="segmentosPreferencia" value={editableData.segmentosPreferencia} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2"/> : <p className="bg-slate-800 p-2 rounded-lg">{specialist.segmentosPreferencia.join(', ')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Modalidad de Preferencia</label>
                    {isEditing ? <input type="text" name="modalidadPreferencia" value={editableData.modalidadPreferencia} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2"/> : <p className="bg-slate-800 p-2 rounded-lg">{specialist.modalidadPreferencia.join(', ')}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Sede de Preferencia</label>
                    {isEditing ? <input type="text" name="sedePreferencia" value={editableData.sedePreferencia} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2"/> : <p className="bg-slate-800 p-2 rounded-lg">{specialist.sedePreferencia.join(', ')}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nota Rúbrica</label>
                    {isEditing ? <input type="text" name="notaRubrica" value={editableData.notaRubrica} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2"/> : <p className="bg-slate-800 p-2 rounded-lg">{specialist.notaRubrica || 'N/A'}</p>}
                </div>
            </div>
            
            <h4 className="text-2xl font-semibold text-cyan-400 mt-8 mb-2">Calendario de Disponibilidad</h4>
            <CalendarView horarios={specialist.horarios} isEditing={isEditing} onToggle={handleToggleHorario} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-6xl mx-auto bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-6">Gestión Disponibilidad EP</h1>
        <div className="border-b border-slate-600 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => setActiveTab('editor')} className={`${activeTab === 'editor' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Ver y Editar Disponibilidad</button>
            <button onClick={() => setActiveTab('uploader')} className={`${activeTab === 'uploader' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}>Carga Masiva</button>
          </nav>
        </div>
        
        {activeTab === 'uploader' ? <UploaderView /> : <EditorView />}
      </div>
    </div>
  );
}
