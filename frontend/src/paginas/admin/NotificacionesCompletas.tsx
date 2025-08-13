// ================================================================
// 4. NOTIFICACIONES COMPLETAS
// ================================================================

/**
 * frontend/src/paginas/admin/NotificacionesCompletas.tsx
 * Página completa de gestión de notificaciones
 */
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Filter } from 'lucide-react';
import LayoutAdmin from '../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Badge } from '../../componentes/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { formatearFecha } from '../../utils/formatters';

interface NotificacionCompleta {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  modulo: string;
  prioridad: 'alta' | 'media' | 'baja';
  acciones?: Array<{
    texto: string;
    funcion: () => void;
  }>;
}

export const NotificacionesCompletas: React.FC = () => {
  const { notificaciones, marcarComoLeida, eliminarNotificacion } = useNotificaciones();
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');
  const [filtroLeida, setFiltroLeida] = useState<string>('todas');

  const notificacionesFiltradas = notificaciones.filter((notif) => {
    if (filtroTipo !== 'todas' && notif.tipo !== filtroTipo) return false;
    if (filtroLeida === 'leidas' && !notif.leida) return false;
    if (filtroLeida === 'no_leidas' && notif.leida) return false;
    return true;
  });

  const obtenerIconoNotificacion = (tipo: string) => {
    switch (tipo) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <X className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const obtenerColorBadge = (tipo: string) => {
    switch (tipo) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const manejarMarcarLeida = (id: string) => {
    marcarComoLeida(id);
  };

  const manejarEliminar = (id: string) => {
    eliminarNotificacion(id);
  };

  return (
    <LayoutAdmin
      title="Notificaciones"
      description="Centro de notificaciones del sistema"
    >
      <div className="space-y-6">
        {/* Header con filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificaciones
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button size="sm">
                  Marcar todas como leídas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <select 
                value={filtroTipo} 
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border rounded-lg px-3 py-1"
              >
                <option value="todas">Todos los tipos</option>
                <option value="info">Información</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
              </select>

              <select 
                value={filtroLeida} 
                onChange={(e) => setFiltroLeida(e.target.value)}
                className="border rounded-lg px-3 py-1"
              >
                <option value="todas">Todas</option>
                <option value="no_leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificaciones */}
        <div className="space-y-3">
          {notificacionesFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-gray-500">
                  No tienes notificaciones en este momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            notificacionesFiltradas.map((notificacion) => (
              <Card 
                key={notificacion.id} 
                className={`transition-all hover:shadow-md ${
                  !notificacion.leida ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {obtenerIconoNotificacion(notificacion.tipo)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">
                            {notificacion.titulo}
                          </h4>
                          <Badge className={obtenerColorBadge(notificacion.tipo)}>
                            {notificacion.tipo}
                          </Badge>
                          {notificacion.prioridad === 'alta' && (
                            <Badge variant="destructive">
                              Alta Prioridad
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {notificacion.mensaje}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>{formatearFecha(notificacion.fecha)}</span>
                          <span>Módulo: {notificacion.modulo}</span>
                        </div>
                        {notificacion.acciones && (
                          <div className="flex space-x-2 mt-3">
                            {notificacion.acciones.map((accion, index) => (
                              <Button 
                                key={index}
                                variant="outline" 
                                size="sm"
                                onClick={accion.funcion}
                              >
                                {accion.texto}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notificacion.leida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => manejarMarcarLeida(notificacion.id)}
                        >
                          Marcar leída
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => manejarEliminar(notificacion.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Paginación si fuera necesario */}
        {notificacionesFiltradas.length > 20 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="sm">Anterior</Button>
                <span className="text-sm text-gray-500">Página 1 de 3</span>
                <Button variant="outline" size="sm">Siguiente</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutAdmin>
  );
};

export default NotificacionesCompletas;

