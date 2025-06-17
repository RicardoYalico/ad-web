import React, { useState, useEffect } from 'react';
import { Briefcase, Users, UserCheck, CalendarDays, AlertTriangle } from 'lucide-react';
import { StatCard } from '../components/CommonComponents'; // Asumiendo que StatCard está en CommonComponents

// Datos iniciales y lógica de stats se mueven aquí
const initialSpecialistsDataForDashboard = [ // Podría ser una versión resumida o la misma
  { id: 'ep001', HCM_DESC_NOMB_COMP: 'SANDRA JAQUELINE RAMIREZ MEDINA', avatar: 'https://placehold.co/40x40/3498DB/FFFFFF?text=SR', assignedHoursPresencial: 10, assignedHoursRemoto: 5, totalHoursWeek: 24 },
  { id: 'ep002', HCM_DESC_NOMB_COMP: 'CARLOS ALBERTO LUNA ROJAS', avatar: 'https://placehold.co/40x40/2ECC71/FFFFFF?text=CL', assignedHoursPresencial: 12, assignedHoursRemoto: 8, totalHoursWeek: 24 },
  { id: 'ep003', HCM_DESC_NOMB_COMP: 'SOFIA ELENA VEGA PEREZ', avatar: 'https://placehold.co/40x40/E74C3C/FFFFFF?text=SV', assignedHoursPresencial: 0, assignedHoursRemoto: 10, totalHoursWeek: 24 },
];
const initialTeachersDataForDashboard = [ // Solo para conteo y filtro si es necesario
  { id: 'doc001', needsObservation: true, assignedEP_details: null },
  { id: 'doc002', needsObservation: true, assignedEP_details: null },
  { id: 'doc003', needsObservation: false, assignedEP_details: { id: 'ep002' } },
  { id: 'doc004', needsObservation: true, assignedEP_details: null },
];
const initialAssignmentsDataForDashboard = [
  { id: 'asg001', status: 'Confirmada' },
];
const initialRecentActivitiesData = [
  { id: 1, user: "Sistema", action: "Asignación propuesta para Prof. Juan Pérez con SANDRA JAQUELINE RAMIREZ MEDINA.", time: "hace 5 minutos", avatar: "https://placehold.co/40x40/7F8C8D/FFFFFF?text=SYS" },
  { id: 2, user: "SANDRA JAQUELINE RAMIREZ MEDINA", action: "alcanzó 15 de 24 horas semanales.", time: "hace 30 minutos", avatar: initialSpecialistsDataForDashboard[0].avatar },
  { id: 3, user: "Sistema", action: "Prof. David Kim ya tiene EP asignado.", time: "hace 1 hora", avatar: "https://placehold.co/40x40/7F8C8D/FFFFFF?text=SYS" },
];

const calculateStatsCards = (teachers, specialists, assignments) => [
  { id: 1, title: "Especialistas Activos", value: specialists.length, icon: <Briefcase className="w-8 h-8 text-indigo-500" />, bgColor: "bg-indigo-100", textColor: "text-indigo-700" },
  { id: 2, title: "Docentes Registrados", value: teachers.length, icon: <Users className="w-8 h-8 text-teal-500" />, bgColor: "bg-teal-100", textColor: "text-teal-700" },
  { id: 3, title: "Docentes Pendientes", value: teachers.filter(t => t.needsObservation && !t.assignedEP_details).length, icon: <UserCheck className="w-8 h-8 text-amber-500" />, bgColor: "bg-amber-100", textColor: "text-amber-700" },
  { id: 4, title: "Observaciones Programadas", value: assignments.filter(a => a.status === 'Confirmada').length, icon: <CalendarDays className="w-8 h-8 text-rose-500" />, bgColor: "bg-rose-100", textColor: "text-rose-700" },
];

const DashboardPage = () => {
  // En un caso real, estos se cargarían con useEffect desde una API
  const [specialists] = useState(initialSpecialistsDataForDashboard);
  const [teachers] = useState(initialTeachersDataForDashboard);
  const [assignments] = useState(initialAssignmentsDataForDashboard);
  const [recentActivities] = useState(initialRecentActivitiesData);
  const [statsCards, setStatsCards] = useState([]);

  useEffect(() => {
    // Simula la carga y cálculo de estadísticas
    setStatsCards(calculateStatsCards(teachers, specialists, assignments));
  }, [teachers, specialists, assignments]);

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Panel de Control Educativo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map(card => <StatCard key={card.id} {...card} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <AlertTriangle size={22} className="mr-2 text-yellow-500" />Especialistas Cercanos al Límite
          </h3>
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {specialists.filter(ep => (ep.assignedHoursPresencial + ep.assignedHoursRemoto) >= ep.totalHoursWeek * 0.75).map(ep => (
              <li key={ep.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <img src={ep.avatar} alt={ep.HCM_DESC_NOMB_COMP} className="w-10 h-10 rounded-full mr-3" onError={(e) => e.target.src='https://placehold.co/40x40/CCCCCC/FFFFFF?text=EP'}/>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{ep.HCM_DESC_NOMB_COMP}</p>
                    <p className="text-xs text-yellow-700">
                      {(ep.assignedHoursPresencial + ep.assignedHoursRemoto)} / {ep.totalHoursWeek} horas
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                  {Math.round(((ep.assignedHoursPresencial + ep.assignedHoursRemoto) / ep.totalHoursWeek) * 100)}%
                </span>
              </li>
            ))}
            {specialists.filter(ep => (ep.assignedHoursPresencial + ep.assignedHoursRemoto) >= ep.totalHoursWeek * 0.75).length === 0 && (
              <p className="text-sm text-gray-500 p-3">Ningún especialista cercano al límite.</p>
            )}
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Actividad Reciente del Sistema</h3>
          <ul className="space-y-1 max-h-80 overflow-y-auto">
            {recentActivities.map(activity => (
              <li key={activity.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full mr-4" onError={(e) => e.target.src='https://placehold.co/40x40/CCCCCC/FFFFFF?text=U'}/>
                <div>
                  <p className="text-sm text-gray-800">
                    <span className="font-semibold">{activity.user}</span> {activity.action}.
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;