"""
Modelos base del core - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para MySQL y hosting compartido
"""

from django.db import models
from django.core.validators import RegexValidator, MinLengthValidator
from django.utils import timezone
from decimal import Decimal


class ModeloBase(models.Model):
    """
    Modelo base abstracto con campos comunes para auditoría
    Optimizado para MySQL con índices específicos
    """
    fecha_creacion = models.DateTimeField(
        'Fecha de Creación',
        auto_now_add=True,
        db_index=True,
        help_text='Fecha y hora de creación del registro'
    )
    fecha_actualizacion = models.DateTimeField(
        'Fecha de Actualización',
        auto_now=True,
        db_index=True,
        help_text='Fecha y hora de última actualización'
    )
    activo = models.BooleanField(
        'Activo',
        default=True,
        db_index=True,
        help_text='Indica si el registro está activo'
    )
    
    class Meta:
        abstract = True
        
    def soft_delete(self):
        """Eliminación lógica del registro"""
        self.activo = False
        self.save(update_fields=['activo', 'fecha_actualizacion'])
    
    def restaurar(self):
        """Restaurar registro eliminado lógicamente"""
        self.activo = True
        self.save(update_fields=['activo', 'fecha_actualizacion'])


class Empresa(ModeloBase):
    """
    Modelo para datos de la empresa emisora
    Configurado según normativa SUNAT Perú
    """
    
    # Validadores personalizados
    validador_ruc = RegexValidator(
        regex=r'^\d{11}$',
        message='El RUC debe tener exactamente 11 dígitos'
    )
    
    validador_ubigeo = RegexValidator(
        regex=r'^\d{6}$',
        message='El ubigeo debe tener exactamente 6 dígitos'
    )
    
    # Campos principales
    ruc = models.CharField(
        'RUC',
        max_length=11,
        unique=True,
        validators=[validador_ruc],
        db_index=True,
        help_text='RUC de la empresa (11 dígitos)'
    )
    
    razon_social = models.CharField(
        'Razón Social',
        max_length=200,
        validators=[MinLengthValidator(5)],
        help_text='Razón social completa de la empresa'
    )
    
    nombre_comercial = models.CharField(
        'Nombre Comercial',
        max_length=150,
        blank=True,
        null=True,
        help_text='Nombre comercial de la empresa'
    )
    
    # Dirección fiscal
    direccion = models.TextField(
        'Dirección Fiscal',
        max_length=500,
        help_text='Dirección fiscal completa'
    )
    
    ubigeo = models.CharField(
        'Ubigeo',
        max_length=6,
        validators=[validador_ubigeo],
        help_text='Código de ubigeo (6 dígitos)'
    )
    
    departamento = models.CharField(
        'Departamento',
        max_length=50,
        help_text='Departamento según ubigeo'
    )
    
    provincia = models.CharField(
        'Provincia',
        max_length=50,
        help_text='Provincia según ubigeo'
    )
    
    distrito = models.CharField(
        'Distrito',
        max_length=50,
        help_text='Distrito según ubigeo'
    )
    
    # Contacto
    telefono = models.CharField(
        'Teléfono',
        max_length=20,
        blank=True,
        null=True,
        help_text='Teléfono principal'
    )
    
    email = models.EmailField(
        'Email',
        blank=True,
        null=True,
        help_text='Email principal de la empresa'
    )
    
    web = models.URLField(
        'Sitio Web',
        blank=True,
        null=True,
        help_text='Página web de la empresa'
    )
    
    # Configuración SUNAT
    usuario_sol = models.CharField(
        'Usuario SOL',
        max_length=50,
        blank=True,
        null=True,
        help_text='Usuario SOL para SUNAT'
    )
    
    clave_sol = models.CharField(
        'Clave SOL',
        max_length=100,
        blank=True,
        null=True,
        help_text='Clave SOL encriptada'
    )
    
    certificado_digital = models.FileField(
        'Certificado Digital',
        upload_to='certificados/',
        blank=True,
        null=True,
        help_text='Certificado digital .pfx'
    )
    
    clave_certificado = models.CharField(
        'Clave Certificado',
        max_length=100,
        blank=True,
        null=True,
        help_text='Clave del certificado digital'
    )
    
    # Configuración facturación
    logo = models.ImageField(
        'Logo',
        upload_to='logos/',
        blank=True,
        null=True,
        help_text='Logo para facturas'
    )
    
    pie_pagina = models.TextField(
        'Pie de Página',
        max_length=500,
        blank=True,
        null=True,
        help_text='Texto del pie de página en facturas'
    )
    
    moneda_defecto = models.CharField(
        'Moneda por Defecto',
        max_length=3,
        default='PEN',
        choices=[
            ('PEN', 'Soles Peruanos'),
            ('USD', 'Dólares Americanos'),
            ('EUR', 'Euros'),
        ],
        help_text='Moneda por defecto para facturación'
    )
    
    igv_tasa = models.DecimalField(
        'Tasa IGV',
        max_digits=5,
        decimal_places=4,
        default=Decimal('0.1800'),
        help_text='Tasa de IGV vigente (18%)'
    )
    
    class Meta:
        db_table = 'core_empresa'
        verbose_name = 'Empresa'
        verbose_name_plural = 'Empresas'
        indexes = [
            models.Index(fields=['ruc'], name='idx_empresa_ruc'),
            models.Index(fields=['activo'], name='idx_empresa_activo'),
            models.Index(fields=['fecha_creacion'], name='idx_empresa_fecha'),
        ]
        
    def __str__(self):
        return f"{self.razon_social} ({self.ruc})"
    
    def clean(self):
        """Validaciones personalizadas"""
        from django.core.exceptions import ValidationError
        
        # Validar RUC con algoritmo
        if self.ruc and not self._validar_ruc(self.ruc):
            raise ValidationError({'ruc': 'RUC inválido según algoritmo SUNAT'})
    
    def _validar_ruc(self, ruc):
        """Validación de RUC según algoritmo SUNAT"""
        if len(ruc) != 11 or not ruc.isdigit():
            return False
        
        # Factores de multiplicación
        factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
        suma = sum(int(ruc[i]) * factores[i] for i in range(10))
        resto = suma % 11
        digito_verificador = 11 - resto if resto > 1 else resto
        
        return int(ruc[10]) == digito_verificador
    
    def obtener_datos_facturacion(self):
        """Retorna datos formateados para facturación"""
        return {
            'ruc': self.ruc,
            'razon_social': self.razon_social,
            'nombre_comercial': self.nombre_comercial or self.razon_social,
            'direccion': self.direccion,
            'ubigeo': self.ubigeo,
            'departamento': self.departamento,
            'provincia': self.provincia,
            'distrito': self.distrito,
            'telefono': self.telefono,
            'email': self.email,
            'moneda': self.moneda_defecto,
            'igv_tasa': float(self.igv_tasa),
        }


class Sucursal(ModeloBase):
    """
    Modelo para sucursales de la empresa
    Permite manejo de múltiples puntos de venta
    """
    
    empresa = models.ForeignKey(
        Empresa,
        on_delete=models.CASCADE,
        related_name='sucursales',
        verbose_name='Empresa',
        help_text='Empresa a la que pertenece la sucursal'
    )
    
    codigo = models.CharField(
        'Código',
        max_length=10,
        db_index=True,
        help_text='Código único de la sucursal'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre de la sucursal'
    )
    
    direccion = models.TextField(
        'Dirección',
        max_length=300,
        help_text='Dirección de la sucursal'
    )
    
    telefono = models.CharField(
        'Teléfono',
        max_length=20,
        blank=True,
        null=True,
        help_text='Teléfono de la sucursal'
    )
    
    email = models.EmailField(
        'Email',
        blank=True,
        null=True,
        help_text='Email de la sucursal'
    )
    
    es_principal = models.BooleanField(
        'Es Principal',
        default=False,
        db_index=True,
        help_text='Indica si es la sucursal principal'
    )
    
    # Configuración de numeración
    serie_factura = models.CharField(
        'Serie Factura',
        max_length=4,
        default='F001',
        help_text='Serie para facturas (ej: F001)'
    )
    
    serie_boleta = models.CharField(
        'Serie Boleta',
        max_length=4,
        default='B001',
        help_text='Serie para boletas (ej: B001)'
    )
    
    serie_nota_credito = models.CharField(
        'Serie Nota Crédito',
        max_length=4,
        default='FC01',
        help_text='Serie para notas de crédito (ej: FC01)'
    )
    
    serie_nota_debito = models.CharField(
        'Serie Nota Débito',
        max_length=4,
        default='FD01',
        help_text='Serie para notas de débito (ej: FD01)'
    )
    
    # Contadores actuales
    contador_factura = models.PositiveIntegerField(
        'Contador Factura',
        default=0,
        help_text='Último número de factura emitida'
    )
    
    contador_boleta = models.PositiveIntegerField(
        'Contador Boleta',
        default=0,
        help_text='Último número de boleta emitida'
    )
    
    contador_nota_credito = models.PositiveIntegerField(
        'Contador Nota Crédito',
        default=0,
        help_text='Último número de nota crédito emitida'
    )
    
    contador_nota_debito = models.PositiveIntegerField(
        'Contador Nota Débito',
        default=0,
        help_text='Último número de nota débito emitida'
    )
    
    class Meta:
        db_table = 'core_sucursal'
        verbose_name = 'Sucursal'
        verbose_name_plural = 'Sucursales'
        unique_together = [
            ('empresa', 'codigo'),
            ('empresa', 'serie_factura'),
            ('empresa', 'serie_boleta'),
        ]
        indexes = [
            models.Index(fields=['empresa', 'codigo'], name='idx_sucursal_empresa_codigo'),
            models.Index(fields=['es_principal'], name='idx_sucursal_principal'),
            models.Index(fields=['activo'], name='idx_sucursal_activo'),
        ]
        
    def __str__(self):
        return f"{self.nombre} ({self.codigo})"
    
    def save(self, *args, **kwargs):
        """Sobrescribir save para validar sucursal principal única"""
        if self.es_principal:
            # Desmarcar otras sucursales principales de la misma empresa
            Sucursal.objects.filter(
                empresa=self.empresa,
                es_principal=True
            ).exclude(pk=self.pk).update(es_principal=False)
        super().save(*args, **kwargs)
    
    def obtener_siguiente_numero(self, tipo_documento):
        """
        Obtiene el siguiente número para un tipo de documento
        """
        from django.db import transaction
        
        with transaction.atomic():
            if tipo_documento == 'factura':
                self.contador_factura += 1
                self.save(update_fields=['contador_factura'])
                return f"{self.serie_factura}-{self.contador_factura:08d}"
            elif tipo_documento == 'boleta':
                self.contador_boleta += 1
                self.save(update_fields=['contador_boleta'])
                return f"{self.serie_boleta}-{self.contador_boleta:08d}"
            elif tipo_documento == 'nota_credito':
                self.contador_nota_credito += 1
                self.save(update_fields=['contador_nota_credito'])
                return f"{self.serie_nota_credito}-{self.contador_nota_credito:08d}"
            elif tipo_documento == 'nota_debito':
                self.contador_nota_debito += 1
                self.save(update_fields=['contador_nota_debito'])
                return f"{self.serie_nota_debito}-{self.contador_nota_debito:08d}"
            else:
                raise ValueError(f"Tipo de documento no válido: {tipo_documento}")


class ConfiguracionSistema(ModeloBase):
    """
    Configuraciones globales del sistema
    """
    clave = models.CharField(
        'Clave',
        max_length=100,
        unique=True,
        db_index=True,
        help_text='Clave de configuración'
    )
    
    valor = models.TextField(
        'Valor',
        help_text='Valor de la configuración'
    )
    
    descripcion = models.TextField(
        'Descripción',
        blank=True,
        null=True,
        help_text='Descripción de la configuración'
    )
    
    tipo_dato = models.CharField(
        'Tipo de Dato',
        max_length=20,
        choices=[
            ('string', 'Texto'),
            ('integer', 'Entero'),
            ('decimal', 'Decimal'),
            ('boolean', 'Booleano'),
            ('json', 'JSON'),
        ],
        default='string',
        help_text='Tipo de dato del valor'
    )
    
    class Meta:
        db_table = 'core_configuracion_sistema'
        verbose_name = 'Configuración del Sistema'
        verbose_name_plural = 'Configuraciones del Sistema'
        indexes = [
            models.Index(fields=['clave'], name='idx_config_clave'),
            models.Index(fields=['activo'], name='idx_config_activo'),
        ]
        
    def __str__(self):
        return f"{self.clave}: {self.valor[:50]}"
    
    def obtener_valor(self):
        """Retorna el valor convertido según su tipo"""
        if self.tipo_dato == 'integer':
            return int(self.valor)
        elif self.tipo_dato == 'decimal':
            return Decimal(self.valor)
        elif self.tipo_dato == 'boolean':
            return self.valor.lower() in ('true', '1', 'yes', 'sí')
        elif self.tipo_dato == 'json':
            import json
            return json.loads(self.valor)
        else:
            return self.valor
    
    @classmethod
    def obtener_configuracion(cls, clave, valor_defecto=None):
        """Método para obtener una configuración"""
        try:
            config = cls.objects.get(clave=clave, activo=True)
            return config.obtener_valor()
        except cls.DoesNotExist:
            return valor_defecto