import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  Calculator,
  ShoppingCart,
  FileText,
  Printer,
  Save,
  X,
  Package,
  Users,
  Barcode,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../componentes/ui/button';
import { Input } from '../../componentes/ui/input';
import { Label } from '../../componentes/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../componentes/ui/card';
import { Badge } from '../../componentes/ui/badge';
import { Alert, AlertDescription } from '../../componentes/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../componentes/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../componentes/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../componentes/ui/dialog';
import { Textarea } from '../../componentes/ui/textarea';
import { Checkbox } from '../../componentes/ui/checkbox';

// =======================================================
// TIPOS Y INTERFACES
// =======================================================

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  unidad: string;
  afectoIgv: boolean;
  imagen?: string;
}

interface Cliente {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  razonSocial: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

interface ItemVenta {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
}

interface DatosVenta {
  cliente: Cliente | null;
  tipoDocumento: 'factura' | 'boleta';
  metodoPago: string;
  observaciones: string;
  descuentoGeneral: number;
  items: ItemVenta[];
  subtotal: number;
  igv: number;
  total: number;
}

interface ConfiguracionVenta {
  serie: string;
  moneda: string;
  tipoOperacion: string;
  fechaVencimiento?: string;
}

// =======================================================
// CONSTANTES
// =======================================================

const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
  { value: 'transferencia', label: 'Transferencia Bancaria' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'credito', label: 'Crédito (30 días)' }
];

const SERIES_DISPONIBLES = [
  { value: 'F001', label: 'F001 - Facturas' },
  { value: 'B001', label: 'B001 - Boletas' },
  { value: 'F002', label: 'F002 - Facturas Exportación' }
];

const IGV_TASA = 0.18;

// =======================================================
// COMPONENTE PRINCIPAL
// =======================================================

const PuntoVenta: React.FC = () => {
  // Estados principales
  const [venta, setVenta] = useState<DatosVenta>({
    cliente: null,
    tipoDocumento: 'boleta',
    metodoPago: 'efectivo',
    observaciones: '',
    descuentoGeneral: 0,
    items: [],
    subtotal: 0,
    igv: 0,
    total: 0
  });

  const [configuracion, setConfiguracion] = useState<ConfiguracionVenta>({
    serie: 'B001',
    moneda: 'PEN',
    tipoOperacion: '0101'
  });

  // Estados de UI
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [clientesDisponibles, setClientesDisponibles] = useState<Cliente[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(false);
  const [procesandoVenta, setProcesandoVenta] = useState(false);
  const [modalClienteAbierto, setModalClienteAbierto] = useState(false);
  const [modalProductoAbierto, setModalProductoAbierto] = useState(false);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);

  // Estados para nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    razonSocial: '',
    email: '',
    telefono: '',
    direccion: ''
  });

  // =======================================================
  // EFECTOS
  // =======================================================

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    calcularTotales();
  }, [venta.items, venta.descuentoGeneral]);

  useEffect(() => {
    buscarProductos();
  }, [busquedaProducto]);

  useEffect(() => {
    buscarClientes();
  }, [busquedaCliente]);

  // =======================================================
  // FUNCIONES DE CARGA DE DATOS
  // =======================================================

  const cargarDatosIniciales = async () => {
    await Promise.all([
      cargarProductos(),
      cargarClientes()
    ]);
  };

  const cargarProductos = async () => {
    setCargandoProductos(true);
    try {
      // Simular API call - reemplazar con llamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const productosSimulados: Producto[] = [
        {
          id: 1,
          codigo: 'PROD001',
          nombre: 'Laptop HP Pavilion',
          descripcion: 'Laptop HP Pavilion 15" Intel i5',
          precio: 2500.00,
          stock: 15,
          categoria: 'Electrónicos',
          unidad: 'NIU',
          afectoIgv: true
        },
        {
          id: 2,
          codigo: 'PROD002',
          nombre: 'Mouse Inalámbrico',
          descripcion: 'Mouse inalámbrico Logitech M100',
          precio: 45.00,
          stock: 50,
          categoria: 'Accesorios',
          unidad: 'NIU',
          afectoIgv: true
        },
        {
          id: 3,
          codigo: 'PROD003',
          nombre: 'Servicio de Consultoría',
          descripcion: 'Consultoría en sistemas por hora',
          precio: 150.00,
          stock: 999,
          categoria: 'Servicios',
          unidad: 'HUR',
          afectoIgv: true
        }
      ];
      
      setProductos(productosSimulados);
      setProductosDisponibles(productosSimulados);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setCargandoProductos(false);
    }
  };

  const cargarClientes = async () => {
    setCargandoClientes(true);
    try {
      // Simular API call - reemplazar con llamada real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const clientesSimulados: Cliente[] = [
        {
          id: 1,
          tipoDocumento: 'RUC',
          numeroDocumento: '20123456789',
          razonSocial: 'Empresa ABC S.A.C.',
          email: 'contacto@empresaabc.com',
          telefono: '999123456',
          direccion: 'Av. Principal 123, Lima'
        },
        {
          id: 2,
          tipoDocumento: 'DNI',
          numeroDocumento: '12345678',
          razonSocial: 'Juan Pérez González',
          email: 'juan@email.com',
          telefono: '987654321',
          direccion: 'Jr. Secundaria 456, Lima'
        }
      ];
      
      setClientes(clientesSimulados);
      setClientesDisponibles(clientesSimulados);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    } finally {
      setCargandoClientes(false);
    }
  };

  // =======================================================
  // FUNCIONES DE BÚSQUEDA
  // =======================================================

  const buscarProductos = useCallback(() => {
    if (!busquedaProducto.trim()) {
      setProductosDisponibles(productos);
      return;
    }

    const termino = busquedaProducto.toLowerCase();
    const productosFiltrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(termino) ||
      producto.codigo.toLowerCase().includes(termino) ||
      producto.descripcion.toLowerCase().includes(termino)
    );
    
    setProductosDisponibles(productosFiltrados);
  }, [busquedaProducto, productos]);

  const buscarClientes = useCallback(() => {
    if (!busquedaCliente.trim()) {
      setClientesDisponibles(clientes);
      return;
    }

    const termino = busquedaCliente.toLowerCase();
    const clientesFiltrados = clientes.filter(cliente =>
      cliente.razonSocial.toLowerCase().includes(termino) ||
      cliente.numeroDocumento.includes(termino)
    );
    
    setClientesDisponibles(clientesFiltrados);
  }, [busquedaCliente, clientes]);

  // =======================================================
  // FUNCIONES DE MANEJO DE VENTA
  // =======================================================

  const agregarProducto = (producto: Producto) => {
    const itemExistente = venta.items.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      // Si ya existe, aumentar cantidad
      modificarCantidadItem(producto.id, itemExistente.cantidad + 1);
    } else {
      // Agregar nuevo item
      const nuevoItem: ItemVenta = {
        producto,
        cantidad: 1,
        precioUnitario: producto.precio,
        descuento: 0,
        subtotal: producto.precio
      };
      
      setVenta(prev => ({
        ...prev,
        items: [...prev.items, nuevoItem]
      }));
    }
  };

  const eliminarProducto = (productoId: number) => {
    setVenta(prev => ({
      ...prev,
      items: prev.items.filter(item => item.producto.id !== productoId)
    }));
  };

  const modificarCantidadItem = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarProducto(productoId);
      return;
    }

    setVenta(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.producto.id === productoId) {
          const subtotal = nuevaCantidad * item.precioUnitario * (1 - item.descuento / 100);
          return {
            ...item,
            cantidad: nuevaCantidad,
            subtotal
          };
        }
        return item;
      })
    }));
  };

  const modificarDescuentoItem = (productoId: number, descuento: number) => {
    setVenta(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.producto.id === productoId) {
          const subtotal = item.cantidad * item.precioUnitario * (1 - descuento / 100);
          return {
            ...item,
            descuento,
            subtotal
          };
        }
        return item;
      })
    }));
  };

  const calcularTotales = () => {
    const subtotalItems = venta.items.reduce((acc, item) => acc + item.subtotal, 0);
    const subtotalConDescuento = subtotalItems * (1 - venta.descuentoGeneral / 100);
    const igv = subtotalConDescuento * IGV_TASA;
    const total = subtotalConDescuento + igv;

    setVenta(prev => ({
      ...prev,
      subtotal: subtotalConDescuento,
      igv,
      total
    }));
  };

  const seleccionarCliente = (cliente: Cliente) => {
    setVenta(prev => ({ ...prev, cliente }));
    setBusquedaCliente('');
    
    // Cambiar tipo de documento según el cliente
    if (cliente.tipoDocumento === 'RUC') {
      setVenta(prev => ({ ...prev, tipoDocumento: 'factura' }));
      setConfiguracion(prev => ({ ...prev, serie: 'F001' }));
    } else {
      setVenta(prev => ({ ...prev, tipoDocumento: 'boleta' }));
      setConfiguracion(prev => ({ ...prev, serie: 'B001' }));
    }
  };

  const limpiarVenta = () => {
    setVenta({
      cliente: null,
      tipoDocumento: 'boleta',
      metodoPago: 'efectivo',
      observaciones: '',
      descuentoGeneral: 0,
      items: [],
      subtotal: 0,
      igv: 0,
      total: 0
    });
    
    setConfiguracion({
      serie: 'B001',
      moneda: 'PEN',
      tipoOperacion: '0101'
    });
    
    setBusquedaProducto('');
    setBusquedaCliente('');
  };

  // =======================================================
  // FUNCIONES DE PROCESAMIENTO
  // =======================================================

  const procesarVenta = async () => {
    if (venta.items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (!venta.cliente && venta.tipoDocumento === 'factura') {
      alert('Las facturas requieren un cliente con RUC');
      return;
    }

    setProcesandoVenta(true);
    
    try {
      // Simular procesamiento de venta
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Aquí iría la llamada real a la API
      console.log('Datos de venta:', {
        venta,
        configuracion
      });
      
      alert('¡Venta procesada exitosamente!');
      limpiarVenta();
      
    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error al procesar la venta');
    } finally {
      setProcesandoVenta(false);
    }
  };

  const guardarVentaTemporal = () => {
    // Guardar en localStorage o enviar a backend como borrador
    localStorage.setItem('venta_temporal', JSON.stringify({ venta, configuracion }));
    alert('Venta guardada temporalmente');
  };

  // =======================================================
  // FUNCIONES DE VALIDACIÓN
  // =======================================================

  const validarStock = (producto: Producto, cantidad: number): boolean => {
    return producto.stock >= cantidad;
  };

  const puedeFacturar = (): boolean => {
    return venta.tipoDocumento === 'factura' && 
           venta.cliente?.tipoDocumento === 'RUC';
  };

  // =======================================================
  // COMPONENTES DE RENDER
  // =======================================================

  const renderBusquedaProductos = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Productos
        </CardTitle>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={busquedaProducto}
              onChange={(e) => setBusquedaProducto(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setModalProductoAbierto(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {cargandoProductos ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(item => (
                <div key={item} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {productosDisponibles.map(producto => (
                <div
                  key={producto.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => agregarProducto(producto)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          {producto.nombre}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {producto.codigo}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {producto.descripcion}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-blue-600">
                          S/ {producto.precio.toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          producto.stock > 10 
                            ? 'bg-green-100 text-green-800'
                            : producto.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Stock: {producto.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {productosDisponibles.length === 0 && !cargandoProductos && (
                <div className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {busquedaProducto ? 'No se encontraron productos' : 'No hay productos disponibles'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderCarritoVenta = () => (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Carrito ({venta.items.length})
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={guardarVentaTemporal}
              disabled={venta.items.length === 0}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={limpiarVenta}
              disabled={venta.items.length === 0}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {venta.items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">El carrito está vacío</p>
            <p className="text-sm text-gray-400">Agrega productos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items del carrito */}
            <div className="max-h-64 overflow-y-auto space-y-3">
              {venta.items.map(item => (
                <div key={item.producto.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{item.producto.nombre}</h5>
                      <p className="text-xs text-gray-500">{item.producto.codigo}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarProducto(item.producto.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-2 items-center">
                    {/* Cantidad */}
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => modificarCantidadItem(item.producto.id, item.cantidad - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => modificarCantidadItem(item.producto.id, parseInt(e.target.value) || 0)}
                        className="h-8 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => modificarCantidadItem(item.producto.id, item.cantidad + 1)}
                        className="h-8 w-8 p-0"
                        disabled={!validarStock(item.producto, item.cantidad + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Precio unitario */}
                    <div className="text-center">
                      <p className="text-sm font-medium">S/ {item.precioUnitario.toFixed(2)}</p>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        S/ {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Campo de descuento */}
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">Desc. %:</Label>
                      <Input
                        type="number"
                        value={item.descuento}
                        onChange={(e) => modificarDescuentoItem(item.producto.id, parseFloat(e.target.value) || 0)}
                        className="h-7 text-xs"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Descuento general */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <Label className="text-sm font-medium">Descuento General (%):</Label>
                <Input
                  type="number"
                  value={venta.descuentoGeneral}
                  onChange={(e) => setVenta(prev => ({ ...prev, descuentoGeneral: parseFloat(e.target.value) || 0 }))}
                  className="h-8 w-20"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>S/ {venta.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IGV (18%):</span>
                <span>S/ {venta.igv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span className="text-blue-600">S/ {venta.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <Label className="text-sm">Observaciones:</Label>
              <Textarea
                value={venta.observaciones}
                onChange={(e) => setVenta(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales..."
                className="mt-1 h-16 text-sm"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderConfiguracionVenta = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Configuración de Venta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cliente seleccionado */}
        <div>
          <Label className="text-sm font-medium">Cliente:</Label>
          {venta.cliente ? (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{venta.cliente.razonSocial}</p>
                  <p className="text-sm text-blue-700">
                    {venta.cliente.tipoDocumento}: {venta.cliente.numeroDocumento}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVenta(prev => ({ ...prev, cliente: null }))}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente por nombre o documento..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Resultados de búsqueda */}
              {busquedaCliente && clientesDisponibles.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                  {clientesDisponibles.map(cliente => (
                    <div
                      key={cliente.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => seleccionarCliente(cliente)}
                    >
                      <p className="font-medium">{cliente.razonSocial}</p>
                      <p className="text-sm text-gray-500">
                        {cliente.tipoDocumento}: {cliente.numeroDocumento}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setModalClienteAbierto(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>
          )}
        </div>

        {/* Tipo de documento */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm">Tipo de Documento:</Label>
            <Select
              value={venta.tipoDocumento}
              onValueChange={(value: 'factura' | 'boleta') => {
                setVenta(prev => ({ ...prev, tipoDocumento: value }));
                setConfiguracion(prev => ({ 
                  ...prev, 
                  serie: value === 'factura' ? 'F001' : 'B001' 
                }));
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boleta">Boleta</SelectItem>
                <SelectItem value="factura" disabled={!puedeFacturar() && !venta.cliente?.tipoDocumento}>
                  Factura
                </SelectItem>
              </SelectContent>
            </Select>
            {venta.tipoDocumento === 'factura' && !puedeFacturar() && (
              <p className="text-xs text-amber-600 mt-1">
                Requiere cliente con RUC
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm">Serie:</Label>
            <Select
              value={configuracion.serie}
              onValueChange={(value) => setConfiguracion(prev => ({ ...prev, serie: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERIES_DISPONIBLES
                  .filter(serie => 
                    venta.tipoDocumento === 'factura' 
                      ? serie.value.startsWith('F') 
                      : serie.value.startsWith('B')
                  )
                  .map(serie => (
                    <SelectItem key={serie.value} value={serie.value}>
                      {serie.label}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <Label className="text-sm">Método de Pago:</Label>
          <Select
            value={venta.metodoPago}
            onValueChange={(value) => setVenta(prev => ({ ...prev, metodoPago: value }))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METODOS_PAGO.map(metodo => (
                <SelectItem key={metodo.value} value={metodo.value}>
                  {metodo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fecha de vencimiento para crédito */}
        {venta.metodoPago === 'credito' && (
          <div>
            <Label className="text-sm">Fecha de Vencimiento:</Label>
            <Input
              type="date"
              value={configuracion.fechaVencimiento || ''}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
              className="mt-1"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3 pt-4 border-t">
          <Button
            onClick={procesarVenta}
            disabled={venta.items.length === 0 || procesandoVenta}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            {procesandoVenta ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Procesar Venta (S/ {venta.total.toFixed(2)})
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setMostrarCalculadora(true)}
              disabled={venta.items.length === 0}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculadora
            </Button>
            <Button
              variant="outline"
              disabled={venta.items.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Pre-impresión
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // =======================================================
  // MODAL NUEVO CLIENTE
  // =======================================================

  const renderModalNuevoCliente = () => (
    <Dialog open={modalClienteAbierto} onOpenChange={setModalClienteAbierto}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Registra un nuevo cliente para la venta
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Tipo de Documento:</Label>
              <Select
                value={nuevoCliente.tipoDocumento}
                onValueChange={(value) => setNuevoCliente(prev => ({ ...prev, tipoDocumento: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                  <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm">Número:</Label>
              <Input
                value={nuevoCliente.numeroDocumento}
                onChange={(e) => setNuevoCliente(prev => ({ ...prev, numeroDocumento: e.target.value }))}
                placeholder={nuevoCliente.tipoDocumento === 'RUC' ? '20123456789' : '12345678'}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">
              {nuevoCliente.tipoDocumento === 'RUC' ? 'Razón Social:' : 'Nombre Completo:'}
            </Label>
            <Input
              value={nuevoCliente.razonSocial}
              onChange={(e) => setNuevoCliente(prev => ({ ...prev, razonSocial: e.target.value }))}
              placeholder={nuevoCliente.tipoDocumento === 'RUC' ? 'Mi Empresa S.A.C.' : 'Juan Pérez'}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Email (opcional):</Label>
            <Input
              type="email"
              value={nuevoCliente.email}
              onChange={(e) => setNuevoCliente(prev => ({ ...prev, email: e.target.value }))}
              placeholder="cliente@email.com"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Teléfono (opcional):</Label>
            <Input
              value={nuevoCliente.telefono}
              onChange={(e) => setNuevoCliente(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="999123456"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm">Dirección (opcional):</Label>
            <Textarea
              value={nuevoCliente.direccion}
              onChange={(e) => setNuevoCliente(prev => ({ ...prev, direccion: e.target.value }))}
              placeholder="Av. Principal 123, Lima"
              className="mt-1 h-20"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setModalClienteAbierto(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                // Aquí iría la lógica para guardar el cliente
                console.log('Nuevo cliente:', nuevoCliente);
                setModalClienteAbierto(false);
                // Limpiar formulario
                setNuevoCliente({
                  tipoDocumento: 'DNI',
                  numeroDocumento: '',
                  razonSocial: '',
                  email: '',
                  telefono: '',
                  direccion: ''
                });
              }}
              disabled={!nuevoCliente.numeroDocumento || !nuevoCliente.razonSocial}
              className="flex-1"
            >
              Guardar Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // =======================================================
  // RENDER PRINCIPAL
  // =======================================================

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Punto de Venta</h1>
          <p className="text-gray-600">Sistema POS para facturación electrónica</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            SUNAT Conectado
          </Badge>
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            {new Date().toLocaleDateString()}
          </Button>
        </div>
      </div>

      {/* Alerta de información */}
      <Alert className="mb-6 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Recuerda:</strong> Las facturas requieren clientes con RUC válido. 
          Los documentos se envían automáticamente a SUNAT tras la venta.
        </AlertDescription>
      </Alert>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Productos */}
        <div className="lg:col-span-1">
          {renderBusquedaProductos()}
        </div>

        {/* Columna central - Carrito */}
        <div className="lg:col-span-1">
          {renderCarritoVenta()}
        </div>

        {/* Columna derecha - Configuración */}
        <div className="lg:col-span-1">
          {renderConfiguracionVenta()}
        </div>
      </div>

      {/* Modal nuevo cliente */}
      {renderModalNuevoCliente()}

      {/* Estado de procesamiento */}
      {procesandoVenta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <h3 className="font-medium">Procesando Venta</h3>
                <p className="text-sm text-gray-500">
                  Enviando documento a SUNAT...
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PuntoVenta;