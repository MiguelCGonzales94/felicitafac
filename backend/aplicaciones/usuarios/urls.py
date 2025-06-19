"""
URLs de la aplicación Usuarios - FELICITAFAC
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

app_name = 'usuarios'

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    # URLs adicionales se agregarán en fases posteriores
]