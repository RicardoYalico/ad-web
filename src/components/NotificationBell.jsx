// src/components/NotificationBell.js
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import NotificationService from '../services/NotificationService';

const NotificationBell = ({ userDni, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [contador, setContador] = useState({ noVistas: 0, vistas: 0, leidas: 0 });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const notificationService = new NotificationService();

  useEffect(() => {
    if (userDni) {
      loadContador();
      const interval = setInterval(loadContador, 30000);
      return () => clearInterval(interval);
    }
  }, [userDni]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadContador = async () => {
    try {
      const data = await notificationService.getContador(userDni);
      setContador(data);
    } catch (error) {
      console.error('Error al cargar contador:', error);
    }
  };

  const loadNotifications = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getCampanita(userDni);
      setNotifications(data.notificaciones || []);
      setTimeout(loadContador, 500);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = async () => {
    if (!isOpen) {
      await loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    try {
      await notificationService.marcarLeida(notification._id);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notification._id
            ? { ...n, estado: 'LEIDA', fechaLectura: new Date() }
            : n
        )
      );
      loadContador();
      console.log('Notificación clickeada:', notification);
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.marcarTodasLeidas(userDni);
      setNotifications(prev =>
        prev.map(n => ({ ...n, estado: 'LEIDA', fechaLectura: new Date() }))
      );
      loadContador();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const handleClearOld = async () => {
    try {
      await notificationService.limpiarAntiguas(userDni);
      loadNotifications();
      loadContador();
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'NUEVA_ASIGNACION': return '👨‍🏫';
      case 'REASIGNACION_GANADA': return '✅';
      case 'REASIGNACION_PERDIDA': return '❌';
      case 'DESASIGNACION': return '⚠️';
      default: return '📢';
    }
  };

  const getNotificationStyle = (estado) => {
    switch (estado) {
      case 'NO_VISTA': return 'bg-blue-50 border-l-4 border-blue-500 font-semibold';
      case 'VISTA': return 'bg-gray-50 border-l-4 border-gray-300';
      case 'LEIDA': return 'bg-white border-l-4 border-transparent text-gray-600';
      default: return 'bg-white';
    }
  };

  const formatTimeAgo = (fecha) => {
    const now = new Date();
    const notificationDate = new Date(fecha);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={handleBellClick}
        className="relative text-gray-600 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={24} />
        {contador.noVistas > 0 && (
          <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white">
            {contador.noVistas > 99 ? '99+' : contador.noVistas}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            <div className="flex items-center space-x-2">
              {contador.vistas > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck size={16} className="mr-1" />
                  Todas
                </button>
              )}
              <button
                onClick={handleClearOld}
                className="text-gray-500 hover:text-gray-700"
                title="Limpiar antiguas"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Cargando notificaciones...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getNotificationStyle(notification.estado)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.tipoNotificacion)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.tipoNotificacion.replace(/_/g, ' ')}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Docente: {notification.detallesCambio.nombreDocente}
                      </p>
                      {notification.detallesCambio.especialistaAnterior?.nombre && (
                        <p className="text-xs text-gray-500 mt-1">
                          Anterior: {notification.detallesCambio.especialistaAnterior.nombre}
                        </p>
                      )}
                      {notification.estado === 'LEIDA' && (
                        <div className="flex items-center mt-1">
                          <Check size={12} className="text-green-500 mr-1" />
                          <span className="text-xs text-gray-500">Leída</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 text-center">
              {contador.vistas > 0 ? `${contador.vistas} sin leer` : 'Todas leídas'} • 
              {contador.total} total
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;