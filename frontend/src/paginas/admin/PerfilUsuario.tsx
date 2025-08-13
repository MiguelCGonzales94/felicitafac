// ================================================================
// 2. PERFIL DE USUARIO
// ================================================================

/**
 * frontend/src/paginas/admin/PerfilUsuario.tsx
 * Página de perfil y configuraciones personales del usuario
 */
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, Save, AlertCircle } from 'lucide-react';
import LayoutAdmin from '../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Textarea } from '../../componentes/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../componentes/ui/avatar';
import { useAuth } from '../../hooks/useAuth';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import { useFormulario } from '../../hooks/useFormulario';
import { validarEmail, validarTelefono } from '../../utils/validaciones';

interface DatosPerfilUsuario {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  biografia: string;
  foto_perfil?: string;
}

interface CambioPassword {
  password_actual: string;
  password_nuevo: string;
  password_confirmacion: string;
}

export const PerfilUsuario: React.FC = () => {
  const { usuario, actualizarPerfil, cambiarPassword } = useAuth();
  const { mostrarExito, mostrarError } = useNotificaciones();
  
  const {
    valores: datosFormulario,
    errores,
    tocados,
    enviando,
    manejarCambio,
    manejarEnvio,
    validarCampo
  } = useFormulario<DatosPerfilUsuario>(
    {
      nombres: usuario?.nombres || '',
      apellidos: usuario?.apellidos || '',
      email: usuario?.email || '',
      telefono: usuario?.telefono || '',
      biografia: usuario?.biografia || '',
      foto_perfil: usuario?.foto_perfil || ''
    },
    {
      nombres: { requerido: true, minLength: 2 },
      apellidos: { requerido: true, minLength: 2 },
      email: { requerido: true, personalizada: validarEmail },
      telefono: { personalizada: validarTelefono }
    }
  );

  const {
    valores: passwordData,
    errores: erroresPassword,
    manejarCambio: manejarCambioPassword,
    manejarEnvio: manejarEnvioPassword,
    resetear: resetearPassword
  } = useFormulario<CambioPassword>(
    {
      password_actual: '',
      password_nuevo: '',
      password_confirmacion: ''
    },
    {
      password_actual: { requerido: true, minLength: 6 },
      password_nuevo: { requerido: true, minLength: 8 },
      password_confirmacion: { 
        requerido: true,
        personalizada: (valor) => valor === passwordData.password_nuevo ? null : 'Las contraseñas no coinciden'
      }
    }
  );

  const manejarActualizarPerfil = async (datos: DatosPerfilUsuario) => {
    try {
      await actualizarPerfil(datos);
      mostrarExito('Perfil actualizado correctamente');
    } catch (error) {
      mostrarError('Error al actualizar el perfil');
    }
  };

  const manejarCambiarPassword = async (datos: CambioPassword) => {
    try {
      await cambiarPassword(datos.password_actual, datos.password_nuevo);
      mostrarExito('Contraseña cambiada correctamente');
      resetearPassword();
    } catch (error) {
      mostrarError('Error al cambiar la contraseña');
    }
  };

  return (
    <LayoutAdmin
      title="Mi Perfil"
      description="Configuración personal y preferencias de cuenta"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header del Perfil */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={usuario?.foto_perfil} />
                  <AvatarFallback className="text-lg">
                    {usuario?.nombres?.charAt(0)}{usuario?.apellidos?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {usuario?.nombres} {usuario?.apellidos}
                </h1>
                <p className="text-gray-600">{usuario?.email}</p>
                <p className="text-sm text-gray-500">
                  Rol: {usuario?.rol_detalle?.nombre}
                </p>
                <p className="text-sm text-gray-500">
                  Último acceso: {new Date().toLocaleDateString('es-PE')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Configuración */}
        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil">Información Personal</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          </TabsList>

          {/* Tab Información Personal */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={manejarEnvio(manejarActualizarPerfil)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombres">Nombres</Label>
                      <Input
                        id="nombres"
                        value={datosFormulario.nombres}
                        onChange={manejarCambio('nombres')}
                        error={errores.nombres}
                        placeholder="Ingresa tus nombres"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellidos">Apellidos</Label>
                      <Input
                        id="apellidos"
                        value={datosFormulario.apellidos}
                        onChange={manejarCambio('apellidos')}
                        error={errores.apellidos}
                        placeholder="Ingresa tus apellidos"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        value={datosFormulario.email}
                        onChange={manejarCambio('email')}
                        error={errores.email}
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={datosFormulario.telefono}
                        onChange={manejarCambio('telefono')}
                        error={errores.telefono}
                        placeholder="999 999 999"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="biografia">Biografía</Label>
                    <Textarea
                      id="biografia"
                      value={datosFormulario.biografia}
                      onChange={manejarCambio('biografia')}
                      placeholder="Cuéntanos algo sobre ti..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={enviando}>
                    <Save className="h-4 w-4 mr-2" />
                    {enviando ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Seguridad */}
          <TabsContent value="seguridad">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Seguridad de la Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={manejarEnvioPassword(manejarCambiarPassword)} className="space-y-4">
                  <div>
                    <Label htmlFor="password_actual">Contraseña Actual</Label>
                    <Input
                      id="password_actual"
                      type="password"
                      value={passwordData.password_actual}
                      onChange={manejarCambioPassword('password_actual')}
                      error={erroresPassword.password_actual}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password_nuevo">Nueva Contraseña</Label>
                    <Input
                      id="password_nuevo"
                      type="password"
                      value={passwordData.password_nuevo}
                      onChange={manejarCambioPassword('password_nuevo')}
                      error={erroresPassword.password_nuevo}
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password_confirmacion">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="password_confirmacion"
                      type="password"
                      value={passwordData.password_confirmacion}
                      onChange={manejarCambioPassword('password_confirmacion')}
                      error={erroresPassword.password_confirmacion}
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Consejos para una contraseña segura:</p>
                        <ul className="mt-1 list-disc list-inside space-y-1">
                          <li>Usa al menos 8 caracteres</li>
                          <li>Incluye mayúsculas y minúsculas</li>
                          <li>Agrega números y símbolos</li>
                          <li>No uses información personal</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={enviando}>
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Preferencias */}
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notificaciones</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Notificar cuando se emita una factura
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        Alertas de stock bajo
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Recordatorios de vencimiento
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Idioma y Región</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="idioma">Idioma</Label>
                        <select className="w-full p-2 border rounded-lg">
                          <option value="es">Español</option>
                          <option value="en">English</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="zona_horaria">Zona Horaria</Label>
                        <select className="w-full p-2 border rounded-lg">
                          <option value="America/Lima">Lima, Perú (GMT-5)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Preferencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default PerfilUsuario;

