"""
Administrador Django para aplicación Core - FELICITAFAC
"""

from django.contrib import admin
from .models import Empresa, Sucursal, ConfiguracionSistema


@admin.register(Empresa)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ['razon_social', 'ruc', 'email', 'activo', 'fecha_creacion']
    list_filter = ['activo', 'departamento', 'fecha_creacion']
    search_fields = ['razon_social', 'ruc', 'email']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('ruc', 'razon_social', 'nombre_comercial')
        }),
        ('Dirección', {
            'fields': ('direccion', 'ubigeo', 'departamento', 'provincia', 'distrito')
        }),
        ('Contacto', {
            'fields': ('telefono', 'email', 'web')
        }),
        ('Configuración SUNAT', {
            'fields': ('usuario_sol', 'certificado_digital'),
            'classes': ('collapse',)
        }),
        ('Facturación', {
            'fields': ('logo', 'pie_pagina', 'moneda_defecto', 'igv_tasa')
        }),
        ('Estado', {
            'fields': ('activo', 'fecha_creacion', 'fecha_actualizacion')
        })
    )


@admin.register(Sucursal)
class SucursalAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'codigo', 'empresa', 'es_principal', 'activo']
    list_filter = ['empresa', 'es_principal', 'activo']
    search_fields = ['nombre', 'codigo', 'direccion']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('empresa', 'codigo', 'nombre', 'direccion')
        }),
        ('Contacto', {
            'fields': ('telefono', 'email')
        }),
        ('Configuración', {
            'fields': ('es_principal',)
        }),
        ('Series de Documentos', {
            'fields': ('serie_factura', 'serie_boleta', 'serie_nota_credito', 'serie_nota_debito')
        }),
        ('Contadores', {
            'fields': ('contador_factura', 'contador_boleta', 'contador_nota_credito', 'contador_nota_debito'),
            'classes': ('collapse',)
        })
    )


@admin.register(ConfiguracionSistema)
class ConfiguracionSistemaAdmin(admin.ModelAdmin):
    list_display = ['clave', 'valor', 'tipo_dato', 'activo']
    list_filter = ['tipo_dato', 'activo']
    search_fields = ['clave', 'descripcion']
    readonly_fields = ['fecha_creacion', 'fecha_actualizacion']