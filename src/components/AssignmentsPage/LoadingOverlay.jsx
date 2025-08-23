import React from 'react';
import { Loader, AlertTriangle } from 'lucide-react';

const LoadingOverlay = ({ message, progress, hasError = false, title = "Procesando..." }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex flex-col justify-center items-center text-white p-4">
        {!hasError && <Loader className="animate-spin h-12 w-12 text-white mb-6" />}
        {hasError && <AlertTriangle className="h-12 w-12 text-red-500 mb-6" />}
        <h2 className="text-2xl font-bold mb-2 text-center">{hasError ? "Error en el Proceso" : title}</h2>
        <p className="text-gray-300 mb-6 text-center max-w-md">{hasError ? "Ocurrió un problema." : message}</p>
        {progress !== null && !hasError && (
            <div className="w-full max-w-lg text-center p-6 bg-gray-800/60 rounded-xl shadow-lg">
                <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}>
                    </div>
                </div>
                <p className="mt-2 text-sm font-semibold">{progress}% completado</p>
            </div>
        )}
    </div>
);

export default LoadingOverlay;