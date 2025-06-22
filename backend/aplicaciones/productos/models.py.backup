"""
Modelos de Productos - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para MySQL y método PEPS
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
from aplicaciones.core.models import ModeloBase


class TipoProducto(ModeloBase):
    """
    Modelo para tipos de productos según SUNAT
    Bienes, servicios, etc.
    """
    
    TIPOS_PRODUCTO = [
        ('bien', 'Bien'),
        ('servicio', 'Servicio'),
        ('combo', 'Combo/Paquete'),
    ]
    
    TIPOS_SUNAT = [
        ('ZZ', 'Servicios'),
        ('NIU', 'Unidad (Bienes)'),
        ('KGM', 'Kilogramo'),
        ('MTR', 'Metro'),
        ('LTR', 'Litro'),
        ('H87', 'Pieza'),
        ('BX', 'Caja'),
        ('PK', 'Paquete'),
        ('SET', 'Conjunto'),
    ]
    
    codigo = models.CharField(
        'Código',
        max_length=10,
        unique=True,
        db_index=True,
        help_text='Código único del tipo'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del tipo de producto'
    )
    
    tipo = models.CharField(
        'Tipo',
        max_length=20,
        choices=TIPOS_PRODUCTO,
        default='bien',
        help_text='Tipo de producto'
    )
    
    unidad_medida_sunat = models.CharField(
        'Unidad SUNAT',
        max_length=3,
        choices=TIPOS_SUNAT,
        default='NIU',
        help_text='Código de unidad según SUNAT'
    )
    
    controla_stock = models.BooleanField(
        'Controla Stock',
        default=True,
        help_text='Si el tipo controla inventario'
    )
    
    permite_decimales = models.BooleanField(
        'Permite Decimales',
        default=False,
        help_text='Si permite cantidades decimales'
    )
    
    requiere_lote = models.BooleanField(
        'Requiere Lote',
        default=False,
        help_text='Si requiere control de lotes'
    )
    
    requiere_vencimiento = models.BooleanField(
        'Requiere Vencimiento',
        default=False,
        help_text='Si tiene fecha de vencimiento'
    )
    
    class Meta:
        db_table = 'productos_tipo_producto'
        verbose_name = 'Tipo de Producto'
        verbose_name_plural = 'Tipos de Producto'
        indexes = [
            models.Index(fields=['codigo'], name='idx_tipo_prod_codigo'),
            models.Index(fields=['tipo'], name='idx_tipo_prod_tipo'),
            models.Index(fields=['activo'], name='idx_tipo_prod_activo'),
        ]
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Categoria(ModeloBase):
    """
    Modelo para categorías de productos
    Permite organización jerárquica
    """
    
    codigo = models.CharField(
        'Código',
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Código único de la categoría'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre de la categoría'
    )
    
    descripcion = models.TextField(
        'Descripción',
        blank=True,
        null=True,
        help_text='Descripción detallada'
    )
    
    categoria_padre = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='subcategorias',
        verbose_name='Categoría Padre',
        help_text='Categoría padre (opcional)'
    )
    
    orden = models.PositiveIntegerField(
        'Orden',
        default=0,
        help_text='Orden de visualización'
    )
    
    margen_utilidad_defecto = models.DecimalField(
        'Margen Utilidad (%)',
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text='Margen de utilidad por defecto'
    )
    
    cuenta_contable_ventas = models.CharField(
        'Cuenta Contable Ventas',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para ventas'
    )
    
    cuenta_contable_inventario = models.CharField(
        'Cuenta Contable Inventario',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para inventario'
    )
    
    class Meta:
        db_table = 'productos_categoria'
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        indexes = [
            models.Index(fields=['codigo'], name='idx_categoria_codigo'),
            models.Index(fields=['categoria_padre'], name='idx_categoria_padre'),
            models.Index(fields=['orden'], name='idx_categoria_orden'),
            models.Index(fields=['activo'], name='idx_categoria_activo'),
        ]
        ordering = ['orden', 'nombre']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    def obtener_ruta_completa(self):
        """Retorna la ruta completa de la categoría"""
        if self.categoria_padre:
            return f"{self.categoria_padre.obtener_ruta_completa()} > {self.nombre}"
        return self.nombre


class Producto(ModeloBase):
    """
    Modelo principal de Productos
    Incluye control de inventarios y configuración SUNAT
    """
    
    TIPOS_AFECTACION_IGV = [
        ('10', 'Gravado - Operación Onerosa'),
        ('11', 'Gravado - Retiro por premio'),
        ('12', 'Gravado - Retiro por donación'),
        ('13', 'Gravado - Retiro'),
        ('14', 'Gravado - Retiro por publicidad'),
        ('15', 'Gravado - Bonificaciones'),
        ('16', 'Gravado - Retiro por entrega a trabajadores'),
        ('20', 'Exonerado - Operación Onerosa'),
        ('30', 'Inafecto - Operación Onerosa'),
        ('40', 'Exportación'),
    ]
    
    # Validadores
    validador_codigo_barras = RegexValidator(
        regex=r'^[0-9]{8,13}$',
        message='Código de barras debe tener entre 8 y 13 dígitos'
    )
    
    # Información básica
    codigo = models.CharField(
        'Código',
        max_length=50,
        unique=True,
        db_index=True,
        help_text='Código único del producto'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=200,
        db_index=True,
        help_text='Nombre del producto'
    )
    
    descripcion = models.TextField(
        'Descripción',
        blank=True,
        null=True,
        help_text='Descripción detallada'
    )
    
    tipo_producto = models.ForeignKey(
        TipoProducto,
        on_delete=models.PROTECT,
        related_name='productos',
        verbose_name='Tipo de Producto'
    )
    
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        related_name='productos',
        verbose_name='Categoría'
    )
    
    # Códigos adicionales
    codigo_barras = models.CharField(
        'Código de Barras',
        max_length=15,
        blank=True,
        null=True,
        validators=[validador_codigo_barras],
        help_text='Código de barras EAN'
    )
    
    codigo_interno = models.CharField(
        'Código Interno',
        max_length=50,
        blank=True,
        null=True,
        help_text='Código interno alternativo'
    )
    
    codigo_proveedor = models.CharField(
        'Código Proveedor',
        max_length=50,
        blank=True,
        null=True,
        help_text='Código del proveedor'
    )
    
    # Configuración SUNAT
    codigo_producto_sunat = models.CharField(
        'Código SUNAT',
        max_length=10,
        blank=True,
        null=True,
        help_text='Código de producto según SUNAT'
    )
    
    tipo_afectacion_igv = models.CharField(
        'Tipo Afectación IGV',
        max_length=2,
        choices=TIPOS_AFECTACION_IGV,
        default='10',
        help_text='Tipo de afectación IGV según SUNAT'
    )
    
    # Precios
    precio_compra = models.DecimalField(
        'Precio de Compra',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Precio de compra sin IGV'
    )
    
    precio_venta = models.DecimalField(
        'Precio de Venta',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Precio de venta sin IGV'
    )
    
    precio_venta_con_igv = models.DecimalField(
        'Precio Venta c/IGV',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Precio de venta con IGV incluido'
    )
    
    margen_utilidad = models.DecimalField(
        'Margen Utilidad (%)',
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Margen de utilidad porcentual'
    )
    
    # Control de inventario
    stock_actual = models.DecimalField(
        'Stock Actual',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Stock actual disponible'
    )
    
    stock_minimo = models.DecimalField(
        'Stock Mínimo',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Stock mínimo requerido'
    )
    
    stock_maximo = models.DecimalField(
        'Stock Máximo',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Stock máximo recomendado'
    )
    
    punto_reorden = models.DecimalField(
        'Punto de Reorden',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Punto de reorden automático'
    )
    
    # Unidades de medida
    unidad_medida = models.CharField(
        'Unidad de Medida',
        max_length=20,
        default='UNIDAD',
        help_text='Unidad de medida principal'
    )
    
    unidad_medida_sunat = models.CharField(
        'Unidad SUNAT',
        max_length=3,
        default='NIU',
        help_text='Código de unidad según SUNAT'
    )
    
    peso = models.DecimalField(
        'Peso (Kg)',
        max_digits=8,
        decimal_places=4,
        default=Decimal('0.0000'),
        blank=True,
        null=True,
        help_text='Peso en kilogramos'
    )
    
    volumen = models.DecimalField(
        'Volumen (m³)',
        max_digits=8,
        decimal_places=4,
        default=Decimal('0.0000'),
        blank=True,
        null=True,
        help_text='Volumen en metros cúbicos'
    )
    
    # Configuraciones
    permite_venta = models.BooleanField(
        'Permite Venta',
        default=True,
        help_text='Si el producto puede venderse'
    )
    
    permite_compra = models.BooleanField(
        'Permite Compra',
        default=True,
        help_text='Si el producto puede comprarse'
    )
    
    controla_stock = models.BooleanField(
        'Controla Stock',
        default=True,
        help_text='Si controla inventario'
    )
    
    permite_descuento = models.BooleanField(
        'Permite Descuento',
        default=True,
        help_text='Si permite descuentos en venta'
    )
    
    descuento_maximo = models.DecimalField(
        'Descuento Máximo (%)',
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Descuento máximo permitido'
    )
    
    # Información adicional
    marca = models.CharField(
        'Marca',
        max_length=100,
        blank=True,
        null=True,
        help_text='Marca del producto'
    )
    
    modelo = models.CharField(
        'Modelo',
        max_length=100,
        blank=True,
        null=True,
        help_text='Modelo del producto'
    )
    
    color = models.CharField(
        'Color',
        max_length=50,
        blank=True,
        null=True,
        help_text='Color del producto'
    )
    
    talla = models.CharField(
        'Talla',
        max_length=20,
        blank=True,
        null=True,
        help_text='Talla del producto'
    )
    
    # Fechas importantes
    fecha_vencimiento = models.DateField(
        'Fecha de Vencimiento',
        blank=True,
        null=True,
        help_text='Fecha de vencimiento del producto'
    )
    
    fecha_ultima_compra = models.DateTimeField(
        'Última Compra',
        blank=True,
        null=True,
        help_text='Fecha de última compra'
    )
    
    fecha_ultima_venta = models.DateTimeField(
        'Última Venta',
        blank=True,
        null=True,
        help_text='Fecha de última venta'
    )
    
    # Contabilidad
    cuenta_contable_ventas = models.CharField(
        'Cuenta Ventas',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para ventas'
    )
    
    cuenta_contable_compras = models.CharField(
        'Cuenta Compras',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para compras'
    )
    
    cuenta_contable_inventario = models.CharField(
        'Cuenta Inventario',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para inventario'
    )
    
    # Estadísticas
    total_vendido = models.DecimalField(
        'Total Vendido',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad total vendida'
    )
    
    total_comprado = models.DecimalField(
        'Total Comprado',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad total comprada'
    )
    
    monto_total_ventas = models.DecimalField(
        'Monto Total Ventas',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Monto total de ventas'
    )
    
    numero_ventas = models.PositiveIntegerField(
        'Número de Ventas',
        default=0,
        help_text='Cantidad de transacciones de venta'
    )
    
    class Meta:
        db_table = 'productos_producto'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        indexes = [
            models.Index(fields=['codigo'], name='idx_producto_codigo'),
            models.Index(fields=['nombre'], name='idx_producto_nombre'),
            models.Index(fields=['codigo_barras'], name='idx_producto_barras'),
            models.Index(fields=['categoria'], name='idx_producto_categoria'),
            models.Index(fields=['tipo_producto'], name='idx_producto_tipo'),
            models.Index(fields=['activo'], name='idx_producto_activo'),
            models.Index(fields=['permite_venta'], name='idx_producto_venta'),
            models.Index(fields=['controla_stock'], name='idx_producto_stock'),
            models.Index(fields=['stock_actual'], name='idx_producto_stock_actual'),
            models.Index(fields=['stock_minimo'], name='idx_producto_stock_min'),
            models.Index(fields=['fecha_vencimiento'], name='idx_producto_venc'),
        ]
        ordering = ['codigo', 'nombre']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar precios
        if self.precio_venta < self.precio_compra:
            raise ValidationError({
                'precio_venta': 'El precio de venta no puede ser menor al precio de compra'
            })
        
        # Validar stock mínimo
        if self.stock_minimo > self.stock_maximo and self.stock_maximo > 0:
            raise ValidationError({
                'stock_minimo': 'El stock mínimo no puede ser mayor al stock máximo'
            })
        
        # Validar tipo de afectación vs tipo de producto
        if self.tipo_producto.tipo == 'servicio' and self.tipo_afectacion_igv.startswith('1'):
            if self.controla_stock:
                raise ValidationError({
                    'controla_stock': 'Los servicios no deben controlar stock'
                })
    
    def save(self, *args, **kwargs):
        """Override save para cálculos automáticos"""
        # Calcular precio con IGV si es gravado
        if self.tipo_afectacion_igv.startswith('1'):  # Gravado
            self.precio_venta_con_igv = self.precio_venta * Decimal('1.18')
        else:
            self.precio_venta_con_igv = self.precio_venta
        
        # Calcular margen de utilidad
        if self.precio_compra > 0:
            self.margen_utilidad = ((self.precio_venta - self.precio_compra) / self.precio_compra) * 100
        
        # Normalizar texto
        self.nombre = self.nombre.strip().upper()
        self.codigo = self.codigo.strip().upper()
        
        super().save(*args, **kwargs)
    
    def esta_disponible(self, cantidad=1):
        """Verifica si hay stock disponible"""
        if not self.controla_stock:
            return True, "Producto no controla stock"
        
        if self.stock_actual >= cantidad:
            return True, f"Stock disponible: {self.stock_actual}"
        
        return False, f"Stock insuficiente. Disponible: {self.stock_actual}, Requerido: {cantidad}"
    
    def necesita_reorden(self):
        """Verifica si necesita reposición"""
        if not self.controla_stock:
            return False
        
        return self.stock_actual <= self.punto_reorden
    
    def calcular_precio_con_descuento(self, descuento_porcentaje):
        """Calcula precio con descuento aplicado"""
        if not self.permite_descuento:
            return self.precio_venta_con_igv
        
        if descuento_porcentaje > self.descuento_maximo:
            descuento_porcentaje = self.descuento_maximo
        
        factor_descuento = Decimal(str(100 - descuento_porcentaje)) / 100
        return self.precio_venta_con_igv * factor_descuento
    
    def actualizar_stock(self, cantidad, tipo_movimiento='salida'):
        """Actualiza el stock del producto"""
        if not self.controla_stock:
            return
        
        if tipo_movimiento == 'entrada':
            self.stock_actual += cantidad
        elif tipo_movimiento == 'salida':
            self.stock_actual -= cantidad
        else:
            raise ValueError("Tipo de movimiento debe ser 'entrada' o 'salida'")
        
        self.save(update_fields=['stock_actual'])
    
    def actualizar_estadisticas_venta(self, cantidad, monto):
        """Actualiza estadísticas de venta"""
        self.total_vendido += cantidad
        self.monto_total_ventas += monto
        self.numero_ventas += 1
        self.fecha_ultima_venta = timezone.now()
        
        self.save(update_fields=[
            'total_vendido', 'monto_total_ventas', 
            'numero_ventas', 'fecha_ultima_venta'
        ])
    
    def obtener_datos_facturacion(self):
        """Retorna datos formateados para facturación"""
        return {
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'unidad_medida': self.unidad_medida_sunat,
            'precio_unitario': float(self.precio_venta),
            'precio_unitario_con_igv': float(self.precio_venta_con_igv),
            'tipo_afectacion_igv': self.tipo_afectacion_igv,
            'codigo_producto_sunat': self.codigo_producto_sunat,
        }


class ProductoProveedor(ModeloBase):
    """
    Modelo para relación Producto-Proveedor
    Permite múltiples proveedores por producto
    """
    
    from aplicaciones.clientes.models import Cliente
    
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        related_name='proveedores',
        verbose_name='Producto'
    )
    
    proveedor = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.CASCADE,
        related_name='productos_suministrados',
        verbose_name='Proveedor',
        limit_choices_to={'tipo_cliente': 'persona_juridica'}
    )
    
    codigo_proveedor = models.CharField(
        'Código Proveedor',
        max_length=50,
        help_text='Código del producto según el proveedor'
    )
    
    precio_compra = models.DecimalField(
        'Precio de Compra',
        max_digits=12,
        decimal_places=4,
        help_text='Precio de compra al proveedor'
    )
    
    tiempo_entrega_dias = models.PositiveIntegerField(
        'Tiempo Entrega (días)',
        default=7,
        help_text='Tiempo de entrega en días'
    )
    
    cantidad_minima = models.DecimalField(
        'Cantidad Mínima',
        max_digits=12,
        decimal_places=4,
        default=Decimal('1.0000'),
        help_text='Cantidad mínima de compra'
    )
    
    es_principal = models.BooleanField(
        'Es Proveedor Principal',
        default=False,
        help_text='Si es el proveedor principal'
    )
    
    fecha_ultimo_precio = models.DateTimeField(
        'Fecha Último Precio',
        auto_now=True,
        help_text='Fecha de última actualización de precio'
    )
    
    notas = models.TextField(
        'Notas',
        blank=True,
        null=True,
        help_text='Notas adicionales del proveedor'
    )
    
    class Meta:
        db_table = 'productos_producto_proveedor'
        verbose_name = 'Producto-Proveedor'
        verbose_name_plural = 'Productos-Proveedores'
        unique_together = [['producto', 'proveedor']]
        indexes = [
            models.Index(fields=['producto'], name='idx_prod_prov_producto'),
            models.Index(fields=['proveedor'], name='idx_prod_prov_proveedor'),
            models.Index(fields=['es_principal'], name='idx_prod_prov_principal'),
            models.Index(fields=['activo'], name='idx_prod_prov_activo'),
        ]
    
    def __str__(self):
        return f"{self.producto.codigo} - {self.proveedor.razon_social}"