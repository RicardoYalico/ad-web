
const [specialists, setSpecialists] = useState(initialSpecialistsData);

const SpecialistsPage = ({ specialists, onOpenSchedule }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSpecialists = specialists.filter(sp => 
    sp.HCM_DESC_NOMB_COMP.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.HCM_VALO_CORR_PRIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sp.HCM_DESC_POSI.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fieldsToShow = [
    { key: 'HCM_CODI_TRAB', label: 'ID Empleado' },
    { key: 'HCM_DESC_NOMB_COMP', label: 'Nombre Completo' },
    { key: 'HCM_VALO_CORR_PRIN', label: 'Email Principal' },
    { key: 'HCM_DESC_POSI', label: 'Posición' },
    { key: 'HCM_VALO_ESTA_TRAB', label: 'Estado' },
    { key: 'HCM_DESC_UBIC', label: 'Sede Principal' },
    { key: 'assignedHours', label: 'Carga Horaria (P/R)'},
  ];


  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-semibold text-gray-800">Gestión de Especialistas Pedagógicos (EP)</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center w-full md:w-auto justify-center">
          <PlusCircle size={20} className="mr-2" /> Añadir Especialista
        </button>
      </div>
      <input
        type="text"
        placeholder="Buscar especialista por nombre, email o posición..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full md:w-2/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
      />
      {filteredSpecialists.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-200">
              <tr>
                {fieldsToShow.map(field => (
                  <th key={field.key} className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{field.label}</th>
                ))}
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSpecialists.map(sp => (
                <tr key={sp.id} className="hover:bg-gray-50 transition-colors">
                  {fieldsToShow.map(field => (
                    <td key={`${sp.id}-${field.key}`} className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                      {field.key === 'assignedHours' ? `${sp.assignedHoursPresencial}/${sp.assignedHoursRemoto}` : sp[field.key]}
                    </td>
                  ))}
                  <td className="px-5 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <button onClick={() => onOpenSchedule(sp)} title="Ver Horario" className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-100 transition-colors">
                      <Eye size={18} />
                    </button>
                    <button title="Editar" className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-md hover:bg-yellow-100 transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button title="Eliminar" className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-100 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">No se encontraron especialistas que coincidan con la búsqueda.</p>
      )}
    </div>
  );
};