// ================================================================
// 3. CONFIGURACIONES GENERALES
// ================================================================

/**
 * frontend/src/paginas/admin/Configuraciones.tsx
 * Página de configuraciones generales del sistema
 */
import React, { useState, useEffect } from 'react';
import { Settings, Building2, Globe, Database, Mail, Bell } from 'lucide-react';
import LayoutAdmin from '../../componentes/layouts/LayoutAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Button } from '../../componentes/ui/button';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Textarea } from '../../componentes/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { Separator } from '../../componentes/ui/separator';
import { useNotificaciones } from '../../hooks/useNotificaciones';
import ConfiguracionAPI from '../../servicios/configuracionAPI';

interface ConfiguracionEmpresa {
  razon_social: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  logo: string;
}

interface ConfiguracionSistema {
  nombre_sistema: string;
  version: string;
  mantenimiento: boolean;
  mensaje_mantenimiento: string;
  timeout_sesion: number;
  max_intentos_login: number;
}

export const Configuraciones: React.FC = () => {
  const { mostrarExito, mostrarError } = useNotificaciones();
  const [cargando, setCargando] = useState(false);
  const [configEmpresa, setConfigEmpresa] = useState<ConfiguracionEmpresa>({
    razon_social: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    web: '',
    logo: ''
  });

  const [configSistema, setConfigSistema] = useState<ConfiguracionSistema>({
    nombre_sistema: 'FELICITAFAC',
    version: '1.0.0',
    mantenimiento: false,
    mensaje_mantenimiento: '',
    timeout_sesion: 30,
    max_intentos_login: 3
  });

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    setCargando(true);
    try {
      const [empresa, sistema] = await Promise.all([
        ConfiguracionAPI.obtenerConfiguracionEmpresa(),
        ConfiguracionAPI.obtenerConfiguracionSistema()
      ]);
      setConfigEmpresa(empresa);
      setConfigSistema(sistema);
    } catch (error) {
      mostrarError('Error al cargar las configuraciones');
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracionEmpresa = async () => {
    setCargando(true);
    try {
      await ConfiguracionAPI.actualizarConfiguracionEmpresa(configEmpresa);
      mostrarExito('Configuración de empresa actualizada');
    } catch (error) {
      mostrarError('Error al guardar la configuración');
    } finally {
      setCargando(false);
    }
  };

  const guardarConfiguracionSistema = async () => {
    setCargando(true);
    try {
      await ConfiguracionAPI.actualizarConfiguracionSistema(configSistema);
      mostrarExito('Configuración del sistema actualizada');
    } catch (error) {
      mostrarError('Error al guardar la configuración');
    } finally {
      setCargando(false);
    }
  };

  return (
    <LayoutAdmin
      title="Configuraciones"
      description="Configuración general del sistema y empresa"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Tabs defaultValue="empresa" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="empresa">Empresa</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            <TabsTrigger value="correo">Correo</TabsTrigger>
            <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          </TabsList>

          {/* Configuración de Empresa */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Información de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="razon_social">Razón Social</Label>
                    <Input
                      id="razon_social"
                      value={configEmpresa.razon_social}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, razon_social: e.target.value})}
                      placeholder="Razón social de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ruc">RUC</Label>
                    <Input
                      id="ruc"
                      value={configEmpresa.ruc}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, ruc: e.target.value})}
                      placeholder="20123456789"
                      maxLength={11}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={configEmpresa.direccion}
                    onChange={(e) => setConfigEmpresa({...configEmpresa, direccion: e.target.value})}
                    placeholder="Dirección completa de la empresa"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={configEmpresa.telefono}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, telefono: e.target.value})}
                      placeholder="01-234-5678"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={configEmpresa.email}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, email: e.target.value})}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="web">Sitio Web</Label>
                    <Input
                      id="web"
                      value={configEmpresa.web}
                      onChange={(e) => setConfigEmpresa({...configEmpresa, web: e.target.value})}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label htmlFor="logo">Logo de la Empresa</Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {configEmpresa.logo ? (
                        <img src={configEmpresa.logo} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        <Building2 className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline">
                      Subir Logo
                    </Button>
                  </div>
                </div>

                <Button onClick={guardarConfiguracionEmpresa} disabled={cargando}>
                  {cargando ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración del Sistema */}
          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre_sistema">Nombre del Sistema</Label>
                    <Input
                      id="nombre_sistema"
                      value={configSistema.nombre_sistema}
                      onChange={(e) => setConfigSistema({...configSistema, nombre_sistema: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="version">Versión</Label>
                    <Input
                      id="version"
                      value={configSistema.version}
                      onChange={(e) => setConfigSistema({...configSistema, version: e.target.value})}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeout_sesion">Timeout de Sesión (minutos)</Label>
                    <Input
                      id="timeout_sesion"
                      type="number"
                      value={configSistema.timeout_sesion}
                      onChange={(e) => setConfigSistema({...configSistema, timeout_sesion: parseInt(e.target.value)})}
                      min={5}
                      max={480}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_intentos">Máx. Intentos de Login</Label>
                    <Input
                      id="max_intentos"
                      type="number"
                      value={configSistema.max_intentos_login}
                      onChange={(e) => setConfigSistema({...configSistema, max_intentos_login: parseInt(e.target.value)})}
                      min={1}
                      max={10}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="mantenimiento"
                      checked={configSistema.mantenimiento}
                      onChange={(e) => setConfigSistema({...configSistema, mantenimiento: e.target.checked})}
                    />
                    <Label htmlFor="mantenimiento">Modo Mantenimiento</Label>
                  </div>
                  {configSistema.mantenimiento && (
                    <div className="mt-2">
                      <Label htmlFor="mensaje_mantenimiento">Mensaje de Mantenimiento</Label>
                      <Textarea
                        id="mensaje_mantenimiento"
                        value={configSistema.mensaje_mantenimiento}
                        onChange={(e) => setConfigSistema({...configSistema, mensaje_mantenimiento: e.target.value})}
                        placeholder="El sistema estará en mantenimiento..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <Button onClick={guardarConfiguracionSistema} disabled={cargando}>
                  {cargando ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Otras pestañas placeholder */}
          <TabsContent value="facturacion">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Facturación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Configuraciones específicas de facturación electrónica.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Configuración de Correo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Configuración del servidor de correo electrónico.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integraciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Integraciones Externas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Configuración de APIs y servicios externos.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutAdmin>
  );
};

export default Configuraciones;

