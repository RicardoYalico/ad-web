import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle } from 'lucide-react';

// Datos iniciales se mueven aquí (o se cargarían de API)
const initialLocalTeachersData = [ // Necesita su propia fuente o recibirla de App/Context
  { id: 'doc001', name: 'Prof. Juan Pérez', sede: 'UPN CAJAMARCA', courses: [{ name: 'Matemáticas Avanzadas', schedule: 'LUN 10:00-12:00' }], needsObservation: true, assignedEP_details: null, avatar: 'https://placehold.co/60x60/F1C40F/333333?text=JP' },
  { id: 'doc002', name: 'Prof. Laura Gómez', sede: 'VIRTUAL', courses: [{ name: 'Historia del Arte', schedule: 'N/A (Virtual)' }], needsObservation: true, assignedEP_details: null, avatar: 'https://placehold.co/60x60/9B59B6/FFFFFF?text=LG' },
  { id: 'doc003', name: 'Prof. David Kim', sede: 'REMOTO', courses: [{ name: 'Programación Python', schedule: 'MAR 14:00-16:00' }], needsObservation: false, assignedEP_details: { id: 'ep002', name: 'CARLOS ALBERTO LUNA ROJAS' }, avatar: 'https://placehold.co/60x60/1ABC9C/FFFFFF?text=DK'},
];
const initialLocalSpecialistsData = [ // Necesita su propia fuente o recibirla de App/Context
  { id: 'ep001', HCM_DESC_NOMB_COMP: 'SANDRA JAQUELINE RAMIREZ MEDINA', totalHoursWeek: 24, assignedHoursPresencial: 10, assignedHoursRemoto: 5 },
  { id: 'ep002', HCM_DESC_NOMB_COMP: 'CARLOS ALBERTO LUNA ROJAS', totalHoursWeek: 24, assignedHoursPresencial: 12, assignedHoursRemoto: 8 },
];
const initialLocalAssignmentsData = [
  { id: 'asg001', teacherId: 'doc003', teacherName: 'Prof. David Kim', epId: 'ep002', epName: 'CARLOS ALBERTO LUNA ROJAS', course: 'Programación Python', schedule: 'MAR 14:00-16:00', sede: 'REMOTO', status: 'Confirmada' },
];


const AssignmentsPage2 = () => { 
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]); // Estado local para docentes
  const [specialists, setSpecialists] = useState([]); // Estado local para especialistas
  const [searchTermDashboard, setSearchTermDashboard] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulación de carga de datos
  useEffect(() => {
    setIsLoading(true);
    // Aquí harías fetch('/api/assignments'), fetch('/api/teachers'), fetch('/api/specialists')
    setTimeout(() => {
      setAssignments(initialLocalAssignmentsData);
      setTeachers(initialLocalTeachersData);
      setSpecialists(initialLocalSpecialistsData);
      setIsLoading(false);
    }, 500);
  }, []);

  const teachersNeedingAssignment = useMemo(() => {
    if (isLoading) return [];
    return teachers.filter(
      teacher => teacher.needsObservation && !teacher.assignedEP_details && teacher.name.toLowerCase().includes(searchTermDashboard.toLowerCase())
    );
  }, [teachers, searchTermDashboard, isLoading]);
  
  const handleProposeAssignments = () => {
    alert("Función 'Proponer Asignaciones' - Lógica de backend/algoritmo necesaria aquí.");
    const teacherToAssign = teachers.find(t => t.id === 'doc001' && t.needsObservation && !t.assignedEP_details);
    const specialistToAssign = specialists.find(s => s.id === 'ep001');

    if (teacherToAssign && specialistToAssign) {
        const newAssignment = {
            id: `asg${Date.now()}`,
            teacherId: teacherToAssign.id,
            teacherName: teacherToAssign.name,
            epId: specialistToAssign.id,
            epName: specialistToAssign.HCM_DESC_NOMB_COMP,
            course: teacherToAssign.courses[0].name,
            schedule: teacherToAssign.courses[0].schedule,
            sede: teacherToAssign.sede,
            status: 'Propuesta'
        };
        setAssignments(prev => [...prev, newAssignment]);
        // Actualizar recentActivities globalmente sería más complejo ahora
    } else {
        alert("No se pudo proponer la asignación.")
    }
  };

  const handleDeleteAssignment = (assignmentId) => {
    const assignmentToRemove = assignments.find(a => a.id === assignmentId);
    if (!assignmentToRemove) return;
    setAssignments(prevAssignments => prevAssignments.filter(a => a.id !== assignmentId));
    if (assignmentToRemove.status === 'Confirmada') {
      setTeachers(prevTeachers => prevTeachers.map(t => 
        t.id === assignmentToRemove.teacherId ? { ...t, needsObservation: true, assignedEP_details: null } : t
      ));
      setSpecialists(prevSpecialists => prevSpecialists.map(ep => {
        if (ep.id === assignmentToRemove.epId) {
          const hoursToDecrement = 2; 
          const isPresencial = !['VIRTUAL', 'REMOTO'].includes(assignmentToRemove.sede);
          return {
            ...ep,
            assignedHoursPresencial: isPresencial ? Math.max(0, ep.assignedHoursPresencial - hoursToDecrement) : ep.assignedHoursPresencial,
            assignedHoursRemoto: !isPresencial ? Math.max(0, ep.assignedHoursRemoto - hoursToDecrement) : ep.assignedHoursRemoto,
          };
        }
        return ep;
      }));
    }
    alert(`Asignación ${assignmentId} eliminada.`);
  };

  const handleConfirmAssignment = (assignmentId) => {
    const assignmentToConfirm = assignments.find(a => a.id === assignmentId);
    if (!assignmentToConfirm) return;
    
    const specialist = specialists.find(s => s.id === assignmentToConfirm.epId);
    if (!specialist) {
        alert("Error: Especialista no encontrado.");
        return;
    }
    // ... (resto de la lógica de validación y actualización de estados locales)
    setAssignments(prevAssignments => prevAssignments.map(a => 
      a.id === assignmentId ? { ...a, status: 'Confirmada' } : a
    ));
    setTeachers(prevTeachers => prevTeachers.map(t => 
      t.id === assignmentToConfirm.teacherId ? { ...t, needsObservation: false, assignedEP_details: {id: specialist.id, name: specialist.HCM_DESC_NOMB_COMP } } : t
    ));
     setSpecialists(prevSpecialists => prevSpecialists.map(ep => {
        if (ep.id === assignmentToConfirm.epId) {
            const observationHours = 2;
            const isPresencial = !['VIRTUAL', 'REMOTO'].includes(assignmentToConfirm.sede);
          return {
            ...ep,
            assignedHoursPresencial: isPresencial ? ep.assignedHoursPresencial + observationHours : ep.assignedHoursPresencial,
            assignedHoursRemoto: !isPresencial ? ep.assignedHoursRemoto + observationHours : ep.assignedHoursRemoto,
          };
        }
        return ep;
      }));
    alert(`Asignación ${assignmentId} confirmada.`);
  };

  if (isLoading) {
    return <div className="bg-white p-6 rounded-xl shadow-lg text-center"><p>Cargando asignaciones...</p></div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-semibold text-gray-800">Gestión de la Asignación Docente</h2>
        <button onClick={handleProposeAssignments} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center w-full md:w-auto justify-center">
          <CheckCircle size={20} className="mr-2"/> Proponer Nuevas Asignaciones
        </button>
      </div>
      <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Docentes Pendientes de Asignación</h3>
          <input type="text" placeholder="Buscar docente por nombre..." value={searchTermDashboard} onChange={(e) => setSearchTermDashboard(e.target.value)} className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"/>
          {teachersNeedingAssignment.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                  {teachersNeedingAssignment.map(teacher => (
                      <li key={teacher.id} className="p-4 bg-gray-50 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-gray-100 transition-colors gap-3">
                          <div className="flex items-center">
                              <img src={teacher.avatar} alt={teacher.name} className="w-10 h-10 rounded-full mr-4" onError={(e) => e.target.src='https://placehold.co/40x40/CCCCCC/FFFFFF?text=D'}/>
                              <div>
                                  <p className="font-semibold text-gray-800">{teacher.name}</p>
                                  <p className="text-sm text-gray-600">Sede: {teacher.sede} - Curso: {teacher.courses[0].name} ({teacher.courses[0].schedule})</p>
                              </div>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium py-1 px-3 border border-blue-500 rounded-md hover:bg-blue-50 transition-colors self-start sm:self-center">Ver Horario EP</button>
                      </li>
                  ))}
              </ul>
          ) : ( <p className="text-gray-500 p-3">No hay docentes pendientes o que coincidan con la búsqueda.</p> )}
      </div>
      <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Propuestas y Asignaciones Confirmadas</h3>
          {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow">
                      <thead className="bg-gray-200">
                          <tr>{['Docente', 'Especialista', 'Curso', 'Horario Observación', 'Sede', 'Estado', 'Acciones'].map(header => ( <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">{header}</th> ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {assignments.map(asg => (
                              <tr key={asg.id} className={`${asg.status === 'Propuesta' ? 'bg-yellow-50' : asg.status === 'Confirmada' ? 'bg-green-50' : ''} hover:bg-gray-50 transition-colors`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asg.teacherName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asg.epName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asg.course}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asg.schedule}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{asg.sede}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${asg.status === 'Confirmada' ? 'bg-green-200 text-green-800' : asg.status === 'Propuesta' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                                          {asg.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                      {asg.status === 'Propuesta' && ( <>
                                          <button onClick={() => handleConfirmAssignment(asg.id)} className="text-green-600 hover:text-green-800">Confirmar</button>
                                          <button onClick={() => handleDeleteAssignment(asg.id)} className="text-red-600 hover:text-red-800">Eliminar</button> </>)}
                                      {asg.status === 'Confirmada' && ( <button onClick={() => handleDeleteAssignment(asg.id)} className="text-red-600 hover:text-red-800">Cancelar</button> )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          ) : ( <p className="text-gray-500 text-center py-4">No hay asignaciones propuestas o confirmadas.</p> )}
      </div>
    </div>
  );
};
export default AssignmentsPage2;