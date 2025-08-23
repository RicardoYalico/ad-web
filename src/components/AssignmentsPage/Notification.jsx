import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

const Notification = ({ type, title, message, onDismiss }) => {
    const baseClasses = "p-4 rounded-lg shadow-md flex items-start mb-4";
    const typeClasses = {
        error: "bg-red-50 border-l-4 border-red-500 text-red-800",
        success: "bg-green-50 border-l-4 border-green-500 text-green-800",
    };
    const icon = {
        error: <AlertTriangle className="mr-3 h-5 w-5" />,
        success: <CheckCircle className="mr-3 h-5 w-5" />,
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {icon[type]}
            <div className="flex-1">
                <p className="font-bold">{title}</p>
                <p className="text-sm">{message}</p>
            </div>
            <button onClick={onDismiss} className="ml-4 p-1 rounded-full hover:bg-black/10"><X size={18} /></button>
        </div>
    );
};

export default Notification;