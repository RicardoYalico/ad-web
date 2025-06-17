// --- Sidebar Component ---
// Idealmente, este estaría en un archivo separado como './Sidebar.js'
import { FileText, Table2, Home } from 'lucide-react';
import VisorDetallePDFsInterno from './DetalleRubricaPDF';
import TablaDinamica from './TablaDinamica';


const Sidebar = ({ currentComponent, onSelectComponent }) => {
  const menuItems = [
    { name: 'VisorDetallePDFsInterno', label: 'Visor PDFs', icon: FileText, component: <VisorDetallePDFsInterno /> },
    { name: 'TablaDinamica', label: 'Tabla Dinámica', icon: Table2, component: <TablaDinamica /> },
  ];

  return (
    <div className="w-64 min-h-screen bg-slate-800 text-slate-100 p-6 flex flex-col shadow-2xl">
      <div className="mb-10 text-center">
        {/* Puedes reemplazar esto con tu logo o el nombre de la aplicación */}
        <h1 className="text-3xl font-bold text-sky-400">Mi App</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentComponent === item.name;
            return (
              <li key={item.name} className="mb-3">
                <button
                  onClick={() => onSelectComponent(item.name)}
                  className={`
                    w-full flex items-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50
                    ${isActive
                      ? 'bg-sky-500 text-white shadow-md transform scale-105'
                      : 'hover:bg-slate-700 hover:text-sky-300'
                    }
                  `}
                >
                  <Icon size={20} className="mr-3 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto pt-6 border-t border-slate-700">
        <p className="text-xs text-slate-400 text-center">&copy; {new Date().getFullYear()} Tu Nombre/Empresa</p>
      </div>
    </div>
  );
};

export default Sidebar;