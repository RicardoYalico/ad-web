// src/services/NotificationService.js
class NotificationService {
  constructor(baseUrl = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl;
  }

  async getCampanita(dni, limite = 15) {
    try {
      const response = await fetch(`${this.baseUrl}/notificaciones/especialista/${dni}/campanita?limite=${limite}`);
      if (!response.ok) throw new Error('Error al obtener notificaciones');
      return await response.json();
    } catch (error) {
      console.error('Error en getCampanita:', error);
      throw error;
    }
  }

  async getContador(dni) {
    try {
      const response = await fetch(`${this.baseUrl}/notificaciones/especialista/${dni}/contador`);
      if (!response.ok) throw new Error('Error al obtener contador');
      return await response.json();
    } catch (error) {
      console.error('Error en getContador:', error);
      throw error;
    }
  }

  async marcarLeida(notificacionId) {
    try {
      const response = await fetch(`${this.baseUrl}/notificaciones/${notificacionId}/marcar-leida`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Error al marcar como leída');
      return await response.json();
    } catch (error) {
      console.error('Error en marcarLeida:', error);
      throw error;
    }
  }

  async marcarTodasLeidas(dni) {
    try {
      const response = await fetch(`${this.baseUrl}/notificaciones/especialista/${dni}/marcar-todas-leidas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Error al marcar todas como leídas');
      return await response.json();
    } catch (error) {
      console.error('Error en marcarTodasLeidas:', error);
      throw error;
    }
  }

  async limpiarAntiguas(dni, dias = 30) {
    try {
      const response = await fetch(`${this.baseUrl}/notificaciones/especialista/${dni}/limpiar-antiguas?dias=${dias}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error al limpiar notificaciones');
      return await response.json();
    } catch (error) {
      console.error('Error en limpiarAntiguas:', error);
      throw error;
    }
  }
}

export default NotificationService;