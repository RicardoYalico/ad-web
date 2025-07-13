import React, { useState } from 'react';
import { BookOpen, UserCircle, Lock } from 'lucide-react'; // Cambiado Mail a UserCircle

const LoginPage = ({ onLogin }) => {
  const [dni, setDni] = useState(''); // Cambiado de 'email' a 'dni'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Pasa 'dni' en lugar de 'email' a la función onLogin
    const success = onLogin(dni, password);
    if (!success) {
      // Mensaje de error actualizado
      setError('DNI o contraseña incorrectos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-auto text-blue-600" />
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-900">
            Gestión del Acompañamiento Docente
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para acceder al sistema.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              {/* Etiqueta y placeholder para el campo DNI */}
              <label htmlFor="dni-input" className="sr-only">DNI</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {/* Ícono de UserCircle para el DNI */}
                  <UserCircle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="dni-input" // Cambiado id
                  name="dni"     // Cambiado name
                  type="text"    // Cambiado type a 'text' para permitir DNI con letras si aplica, o 'number' si solo son dígitos
                  autoComplete="username" // Sugerencia de autocomplete ajustada
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="DNI" // Cambiado placeholder
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Sistema de Gestión Educativa.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
