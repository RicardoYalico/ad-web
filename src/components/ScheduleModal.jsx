// src/components/ScheduleModal.js
import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ScheduleModal = ({ personData, onClose, currentWeekDate, setCurrentWeekDate, personType = 'specialist' }) => { // personType para diferenciar si es necesario
  if (!personData) return null;

  const name = personType === 'specialist' ? personData.HCM_DESC_NOMB_COMP : personData.name;
  const availability = personData.availability || []; // Usar un array vacío si no hay disponibilidad

  const daysOfWeek = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
  const timeSlots = [];
  for (let i = 7; i <= 22; i++) {
    timeSlots.push(`${String(i).padStart(2, '0')}:00`);
  }

  const getWeekDisplay = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const options = { month: 'long', year: 'numeric' };
    const monthYear = startOfWeek.toLocaleDateString('es-ES', options);
    return `Semana del ${startOfWeek.getDate()} al ${endOfWeek.getDate()} de ${monthYear.charAt(0).toUpperCase() + monthYear.slice(1)}`;
  };
 
  const changeWeek = (offset) => {
    const newDate = new Date(currentWeekDate);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentWeekDate(newDate);
  };

  const isSlotAvailable = (day, time) => {
    const dayAvailability = availability.filter(slot => slot.day === day);
    if (!dayAvailability) return false;
    for (const slot of dayAvailability) {
      const slotStartHour = parseInt(slot.startTime.split(':')[0]);
      const slotEndHour = parseInt(slot.endTime.split(':')[0]);
      const currentHour = parseInt(time.split(':')[0]);
      if (currentHour >= slotStartHour && currentHour < slotEndHour) {
        return slot.type || 'Ocupado'; // Mostrar 'Ocupado' si el tipo no está definido
      }
    }
    return false;
  };

  // Resumen específico para especialistas
  const specialistSummary = personType === 'specialist' ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
      <div className="bg-blue-50 p-3 rounded-lg"><strong>Carga Horaria Semanal:</strong> {personData.assignedHoursPresencial + personData.assignedHoursRemoto} / {personData.totalHoursWeek} horas</div>
      <div className="bg-green-50 p-3 rounded-lg"><strong>Docentes Asignados:</strong> {personData.assignedTeachersCount || 0}</div>
      <div className="bg-indigo-50 p-3 rounded-lg"><strong>Modalidades:</strong> {personData.modalities?.join(', ')}</div>
    </div>
  ) : null;

  // Resumen específico para docentes (o puedes quitarlo/adaptarlo)
  const teacherSummary = personType === 'teacher' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
      <div className="bg-blue-50 p-3 rounded-lg"><strong>Horas Asignadas:</strong> {personData.totalAssignedHours || 'N/A'} horas</div>
      <div className="bg-indigo-50 p-3 rounded-lg"><strong>Modalidades:</strong> {personData.modalities?.join(', ') || 'N/A'}</div>
    </div>
  ) : null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-800">Horario de {name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={28} />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeWeek(-1)} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronLeft size={24} /></button>
          <p className="text-lg font-medium text-gray-700">{getWeekDisplay(currentWeekDate)}</p>
          <button onClick={() => changeWeek(1)} className="p-2 rounded-md hover:bg-gray-200 transition-colors"><ChevronRight size={24} /></button>
        </div>

        {/* Mostrar resumen según el tipo de persona */}
        {personType === 'specialist' && specialistSummary}
        {personType === 'teacher' && teacherSummary}
       
        <div className="overflow-auto flex-grow">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-xs text-gray-600 w-24">Hora</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="border border-gray-300 p-2 text-xs text-gray-600">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="border border-gray-300 p-1.5 text-center text-xs text-gray-700 bg-gray-50">{time}</td>
                  {daysOfWeek.map(day => {
                    const slotType = isSlotAvailable(day, time);
                    return (
                      <td key={`${day}-${time}`} className={`border border-gray-300 p-1.5 h-10 text-center text-xs
                        ${slotType ? (slotType.toLowerCase().includes('presencial') || slotType.toLowerCase().includes('clase') ? 'bg-blue-200' : 'bg-green-200') : 'bg-white'}`}>
                        {slotType ? <span className="font-semibold">{slotType.substring(0,3)}</span> : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
export default ScheduleModal;