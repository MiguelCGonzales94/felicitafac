"""
URLs de la aplicación Core - FELICITAFAC
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'core'

router = DefaultRouter()
router.register(r'empresas', views.EmpresaViewSet)
router.register(r'sucursales', views.SucursalViewSet)
router.register(r'configuraciones', views.ConfiguracionSistemaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('info/', views.InfoSistemaView.as_view(), name='info-sistema'),
    path('salud/', views.SaludSistemaView.as_view(), name='salud-sistema'),
]