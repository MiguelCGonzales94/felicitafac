"""
Permisos Personalizados Core - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Clases de permisos para Django REST Framework
"""

from rest_framework.permissions import BasePermission


class EsAdministrador(BasePermission):
    """
    Permiso que permite acceso solo a usuarios con rol de administrador
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario tiene permisos de administrador
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar si es superusuario de Django
        if request.user.is_superuser:
            return True
        
        # Verificar si tiene rol de administrador
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo == 'administrador'
        
        return False


class EsContadorOAdministrador(BasePermission):
    """
    Permiso que permite acceso a usuarios con rol de contador o administrador
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario es contador o administrador
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar si es superusuario de Django
        if request.user.is_superuser:
            return True
        
        # Verificar si tiene rol de administrador o contador
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador']
        
        return False


class EsVendedorOSuperior(BasePermission):
    """
    Permiso que permite acceso a vendedores, contadores y administradores
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario es vendedor o superior
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Verificar si es superusuario de Django
        if request.user.is_superuser:
            return True
        
        # Verificar si tiene rol autorizado
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        return False


class EsClienteOSuperior(BasePermission):
    """
    Permiso que permite acceso a cualquier usuario autenticado
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario está autenticado
        """
        return request.user and request.user.is_authenticated


class EsSoloLectura(BasePermission):
    """
    Permiso que permite solo operaciones de lectura (GET, HEAD, OPTIONS)
    """
    
    def has_permission(self, request, view):
        """
        Verificar si es operación de solo lectura
        """
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.is_authenticated
        
        return False


class EsPropietarioOAdministrador(BasePermission):
    """
    Permiso que permite acceso al propietario del objeto o administradores
    """
    
    def has_permission(self, request, view):
        """
        Verificar permisos básicos
        """
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Verificar si es propietario del objeto o administrador
        """
        # Verificar si es superusuario
        if request.user.is_superuser:
            return True
        
        # Verificar si es administrador
        if hasattr(request.user, 'rol') and request.user.rol:
            if request.user.rol.codigo == 'administrador':
                return True
        
        # Verificar si es propietario del objeto
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        elif hasattr(obj, 'creado_por'):
            return obj.creado_por == request.user
        
        return False


class PuedeGestionarUsuarios(BasePermission):
    """
    Permiso específico para gestionar usuarios
    """
    
    def has_permission(self, request, view):
        """
        Solo administradores pueden gestionar usuarios
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo == 'administrador'
        
        return False


class PuedeVerReportes(BasePermission):
    """
    Permiso para ver reportes del sistema
    """
    
    def has_permission(self, request, view):
        """
        Administradores y contadores pueden ver reportes
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador']
        
        return False


class PuedeCrearFacturas(BasePermission):
    """
    Permiso para crear facturas
    """
    
    def has_permission(self, request, view):
        """
        Administradores, contadores y vendedores pueden crear facturas
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        return False


class PuedeGestionarInventario(BasePermission):
    """
    Permiso para gestionar inventario
    """
    
    def has_permission(self, request, view):
        """
        Administradores, contadores y vendedores pueden gestionar inventario
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        return False


class PuedeConfigurarSistema(BasePermission):
    """
    Permiso para configurar el sistema
    """
    
    def has_permission(self, request, view):
        """
        Solo administradores pueden configurar el sistema
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo == 'administrador'
        
        return False


class PuedeVerFacturacion(BasePermission):
    """
    Permiso para ver documentos de facturación
    Administradores, contadores y vendedores pueden ver facturas
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario puede ver documentos de facturación
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuario tiene acceso completo
        if request.user.is_superuser:
            return True
        
        # Verificar roles permitidos
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Permisos a nivel de objeto para facturas
        """
        # Administradores y contadores ven todas las facturas
        if hasattr(request.user, 'rol') and request.user.rol:
            if request.user.rol.codigo in ['administrador', 'contador']:
                return True
            
            # Vendedores solo ven sus propias facturas
            if request.user.rol.codigo == 'vendedor':
                return hasattr(obj, 'usuario_creacion') and obj.usuario_creacion == request.user
        
        return False


class PuedeEditarFacturacion(BasePermission):
    """
    Permiso para editar documentos de facturación
    Solo administradores y vendedores pueden crear/editar facturas
    Contadores solo pueden consultar
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario puede editar documentos de facturación
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuario tiene acceso completo
        if request.user.is_superuser:
            return True
        
        # Solo administradores y vendedores pueden editar
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'vendedor']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Permisos a nivel de objeto para edición de facturas
        """
        # Administradores pueden editar cualquier factura en borrador
        if hasattr(request.user, 'rol') and request.user.rol:
            if request.user.rol.codigo == 'administrador':
                # Solo facturas en estado borrador son editables
                return hasattr(obj, 'estado') and obj.estado == 'borrador'
            
            # Vendedores solo pueden editar sus propias facturas en borrador
            if request.user.rol.codigo == 'vendedor':
                return (hasattr(obj, 'usuario_creacion') and 
                       obj.usuario_creacion == request.user and
                       hasattr(obj, 'estado') and obj.estado == 'borrador')
        
        return False


class PuedeVerClientes(BasePermission):
    """
    Permiso para ver información de clientes
    Todos los roles autenticados pueden ver clientes
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario puede ver clientes
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuario tiene acceso completo
        if request.user.is_superuser:
            return True
        
        # Todos los roles pueden ver clientes
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Permisos a nivel de objeto para clientes
        """
        # Administradores y contadores ven todos los clientes
        if hasattr(request.user, 'rol') and request.user.rol:
            if request.user.rol.codigo in ['administrador', 'contador']:
                return True
            
            # Vendedores ven todos los clientes (necesario para ventas)
            if request.user.rol.codigo == 'vendedor':
                return True
        
        return False


class PuedeEditarClientes(BasePermission):
    """
    Permiso para editar información de clientes
    Solo administradores y contadores pueden editar clientes
    Vendedores solo pueden crear clientes nuevos
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario puede editar clientes
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuario tiene acceso completo
        if request.user.is_superuser:
            return True
        
        # Para creación, todos los roles permitidos pueden crear
        if view.action == 'create':
            if hasattr(request.user, 'rol') and request.user.rol:
                return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        # Para edición, solo admin y contador
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Permisos a nivel de objeto para edición de clientes
        """
        # Solo administradores y contadores pueden editar
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador']
        
        return False


class PuedeVerProductos(BasePermission):
    """
    Permiso para ver información de productos
    Todos los roles autenticados pueden ver productos
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario puede ver productos
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuario tiene acceso completo
        if request.user.is_superuser:
            return True
        
        # Todos los roles pueden ver productos
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador', 'vendedor']
        
        return False


class PuedeEditarProductos(BasePermission):
    """
    Permiso para editar información de productos
    Solo administradores y contadores pueden editar productos
    """
    
    def has_permission(self, request, view):
        """
        Verificar si el usuario puede editar productos
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superusuario tiene acceso completo
        if request.user.is_superuser:
            return True
        
        # Solo administradores y contadores pueden editar productos
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador']
        
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Permisos a nivel de objeto para edición de productos
        """
        # Solo administradores y contadores pueden editar
        if hasattr(request.user, 'rol') and request.user.rol:
            return request.user.rol.codigo in ['administrador', 'contador']
        
        return False
    
# Alias para mantener compatibilidad
EsStaff = EsContadorOAdministrador
EsUsuarioAutenticado = EsClienteOSuperior
