"""
URLs de Usuarios - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Rutas para API REST con autenticación JWT
"""

from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

from .views import (
    # Autenticación
    LoginPersonalizadoView,
    LogoutView,
    RegistroUsuarioView,
    CambiarPasswordView,
    validar_token,
    
    # Perfil de usuario
    PerfilUsuarioView,
    ActualizarPerfilView,
    
    # Gestión de usuarios (admin)
    ListaUsuariosView,
    DetalleUsuarioView,
    CrearUsuarioView,
    resetear_password_usuario,
    bloquear_usuario,
    
    # Roles y estadísticas
    ListaRolesView,
    EstadisticasUsuariosView,
)

app_name = 'usuarios'

# URLs principales de usuarios
urlpatterns = [
    
    # =======================================================
    # AUTENTICACIÓN JWT
    # =======================================================
    
    # Login y logout
    path('auth/login/', LoginPersonalizadoView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/validar/', validar_token, name='validar-token'),
    
    # Registro de usuarios
    path('auth/registro/', RegistroUsuarioView.as_view(), name='registro'),
    
    # Cambio de contraseña
    path('auth/cambiar-password/', CambiarPasswordView.as_view(), name='cambiar-password'),
    
    # =======================================================
    # PERFIL DE USUARIO AUTENTICADO
    # =======================================================
    
    # Perfil del usuario actual
    path('perfil/', PerfilUsuarioView.as_view(), name='mi-perfil'),
    path('perfil/actualizar/', ActualizarPerfilView.as_view(), name='actualizar-perfil'),
    
    # =======================================================
    # GESTIÓN DE USUARIOS (ADMIN/CONTADOR)
    # =======================================================
    
    # CRUD de usuarios
    path('', ListaUsuariosView.as_view(), name='lista-usuarios'),
    path('crear/', CrearUsuarioView.as_view(), name='crear-usuario'),
    path('<int:id>/', DetalleUsuarioView.as_view(), name='detalle-usuario'),
    
    # Acciones específicas sobre usuarios
    path('<int:usuario_id>/resetear-password/', resetear_password_usuario, name='resetear-password'),
    path('<int:usuario_id>/bloquear/', bloquear_usuario, name='bloquear-usuario'),
    
    # =======================================================
    # ROLES DEL SISTEMA
    # =======================================================
    
    # Lista de roles disponibles
    path('roles/', ListaRolesView.as_view(), name='lista-roles'),
    
    # =======================================================
    # ESTADÍSTICAS Y REPORTES
    # =======================================================
    
    # Estadísticas de usuarios
    path('estadisticas/', EstadisticasUsuariosView.as_view(), name='estadisticas-usuarios'),
]

# URLs adicionales para desarrollo y testing
if True:  # Cambiar a settings.DEBUG en producción
    urlpatterns += [
        # Endpoints de desarrollo
        path('dev/test-auth/', validar_token, name='test-auth'),
    ]

"""
DOCUMENTACIÓN DE ENDPOINTS

=======================================================
AUTENTICACIÓN
=======================================================

POST /api/usuarios/auth/login/
    - Descripción: Login de usuario con email y contraseña
    - Body: {"email": "user@example.com", "password": "password123"}
    - Response: {"access": "jwt_token", "refresh": "refresh_token", "usuario": {...}}
    - Permisos: Público

POST /api/usuarios/auth/logout/
    - Descripción: Logout del usuario actual
    - Headers: Authorization: Bearer <token>
    - Body: {"refresh_token": "refresh_token"} (opcional)
    - Response: {"mensaje": "Logout exitoso"}
    - Permisos: Autenticado

POST /api/usuarios/auth/refresh/
    - Descripción: Renovar token de acceso
    - Body: {"refresh": "refresh_token"}
    - Response: {"access": "new_jwt_token"}
    - Permisos: Público (con refresh token válido)

GET /api/usuarios/auth/validar/
    - Descripción: Validar si el token actual es válido
    - Headers: Authorization: Bearer <token>
    - Response: {"valido": true, "usuario": {...}}
    - Permisos: Autenticado

POST /api/usuarios/auth/registro/
    - Descripción: Registro de nuevo usuario (cliente)
    - Body: {"email": "...", "password": "...", "nombres": "...", ...}
    - Response: {"mensaje": "Usuario registrado exitosamente", "usuario": {...}}
    - Permisos: Público

POST /api/usuarios/auth/cambiar-password/
    - Descripción: Cambiar contraseña del usuario actual
    - Headers: Authorization: Bearer <token>
    - Body: {"password_actual": "...", "password_nueva": "...", "confirmar_password_nueva": "..."}
    - Response: {"mensaje": "Contraseña cambiada exitosamente"}
    - Permisos: Autenticado

=======================================================
PERFIL DE USUARIO
=======================================================

GET /api/usuarios/perfil/
    - Descripción: Obtener perfil del usuario autenticado
    - Headers: Authorization: Bearer <token>
    - Response: {datos completos del usuario y perfil}
    - Permisos: Autenticado

PUT/PATCH /api/usuarios/perfil/
    - Descripción: Actualizar datos básicos del usuario
    - Headers: Authorization: Bearer <token>
    - Body: {campos a actualizar}
    - Response: {usuario actualizado}
    - Permisos: Autenticado

PUT/PATCH /api/usuarios/perfil/actualizar/
    - Descripción: Actualizar perfil extendido del usuario
    - Headers: Authorization: Bearer <token>
    - Body: {campos del perfil a actualizar}
    - Response: {"mensaje": "Perfil actualizado", "perfil": {...}}
    - Permisos: Autenticado

=======================================================
GESTIÓN DE USUARIOS (ADMIN)
=======================================================

GET /api/usuarios/
    - Descripción: Lista de todos los usuarios
    - Headers: Authorization: Bearer <token>
    - Query Params: ?search=nombre&estado_usuario=activo&rol__codigo=vendedor
    - Response: {"usuarios": [...], "estadisticas": {...}}
    - Permisos: Contador o Administrador

POST /api/usuarios/crear/
    - Descripción: Crear nuevo usuario (cualquier rol)
    - Headers: Authorization: Bearer <token>
    - Body: {datos completos del usuario}
    - Response: {"mensaje": "Usuario creado", "usuario": {...}}
    - Permisos: Administrador

GET /api/usuarios/<id>/
    - Descripción: Obtener detalles de usuario específico
    - Headers: Authorization: Bearer <token>
    - Response: {datos completos del usuario}
    - Permisos: Administrador

PUT/PATCH /api/usuarios/<id>/
    - Descripción: Actualizar usuario específico
    - Headers: Authorization: Bearer <token>
    - Body: {campos a actualizar}
    - Response: {usuario actualizado}
    - Permisos: Administrador

DELETE /api/usuarios/<id>/
    - Descripción: Desactivar usuario (soft delete)
    - Headers: Authorization: Bearer <token>
    - Response: {"mensaje": "Usuario desactivado"}
    - Permisos: Administrador

POST /api/usuarios/<id>/resetear-password/
    - Descripción: Resetear contraseña de usuario
    - Headers: Authorization: Bearer <token>
    - Response: {"mensaje": "Password reseteada", "password_temporal": "..."}
    - Permisos: Administrador

POST /api/usuarios/<id>/bloquear/
    - Descripción: Bloquear/desbloquear usuario
    - Headers: Authorization: Bearer <token>
    - Body: {"accion": "bloquear"} o {"accion": "desbloquear"}
    - Response: {"mensaje": "Usuario bloqueado/desbloqueado"}
    - Permisos: Administrador

=======================================================
ROLES Y ESTADÍSTICAS
=======================================================

GET /api/usuarios/roles/
    - Descripción: Lista de roles disponibles en el sistema
    - Headers: Authorization: Bearer <token>
    - Response: [{"id": 1, "nombre": "Administrador", "codigo": "administrador", ...}]
    - Permisos: Autenticado

GET /api/usuarios/estadisticas/
    - Descripción: Estadísticas completas de usuarios
    - Headers: Authorization: Bearer <token>
    - Response: {resumen, distribucion_por_estado, distribucion_por_rol}
    - Permisos: Contador o Administrador

=======================================================
CÓDIGOS DE RESPUESTA HTTP
=======================================================

200 OK: Operación exitosa
201 Created: Recurso creado exitosamente
400 Bad Request: Error en los datos enviados
401 Unauthorized: Token inválido o ausente
403 Forbidden: Sin permisos para esta operación
404 Not Found: Recurso no encontrado
500 Internal Server Error: Error interno del servidor

=======================================================
FILTROS Y BÚSQUEDA
=======================================================

Lista de usuarios admite:
- search: Buscar en nombres, apellidos, email, documento
- estado_usuario: Filtrar por estado (activo, inactivo, suspendido, bloqueado)
- rol__codigo: Filtrar por rol (administrador, contador, vendedor, cliente)
- is_active: Filtrar por activo (true/false)
- ordering: Ordenar por campo (nombres, apellidos, fecha_creacion, fecha_ultimo_login)

Ejemplo: /api/usuarios/?search=juan&estado_usuario=activo&ordering=nombres

=======================================================
PAGINACIÓN
=======================================================

Respuesta paginada incluye:
{
    "count": 25,
    "next": "http://api/usuarios/?page=2",
    "previous": null,
    "results": [...]
}

=======================================================
MANEJO DE ERRORES
=======================================================

Estructura de error estándar:
{
    "error": "Descripción del error",
    "mensaje": "Mensaje para el usuario",
    "errores": {  // Solo en errores de validación
        "campo": ["Lista de errores del campo"]
    }
}
"""