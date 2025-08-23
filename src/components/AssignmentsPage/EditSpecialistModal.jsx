import React, { useState } from 'react';


const EditSpecialistModal = ({ teacher, specialistOptions, onClose, onSave }) => {
    const [selectedDni, setSelectedDni] = useState(teacher?.especialistaDni || '');

    if (!teacher) return null;

    const handleSave = () => {
        onSave(teacher, selectedDni);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                <h3 className="text-xl font-bold text-gray-800">Editar Especialista</h3>
                <p className="text-gray-600 mt-2">
                    Docente: <span className="font-semibold">{teacher.docente}</span>
                </p>
                <div className="mt-6">
                    <label htmlFor="specialist-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Seleccionar Especialista
                    </label>
                    <select
                        id="specialist-select"
                        value={selectedDni}
                        onChange={(e) => setSelectedDni(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">-- Sin Asignar --</option>
                        {specialistOptions.map(spec => (
                            <option key={spec.dni} value={spec.dni}>{spec.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditSpecialistModal;