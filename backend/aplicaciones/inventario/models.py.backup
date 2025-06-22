"""
Modelos de Inventario - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Implementación método PEPS (Primero en Entrar, Primero en Salir)
Optimizado para MySQL y hosting compartido
"""

from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
from aplicaciones.core.models import ModeloBase


class TipoMovimiento(ModeloBase):
    """
    Modelo para tipos de movimientos de inventario
    Entradas, Salidas, Ajustes, Transferencias
    """
    
    TIPOS_MOVIMIENTO = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
        ('transferencia', 'Transferencia'),
    ]
    
    CATEGORIAS_MOVIMIENTO = [
        ('compra', 'Compra'),
        ('venta', 'Venta'),
        ('devolucion_compra', 'Devolución de Compra'),
        ('devolucion_venta', 'Devolución de Venta'),
        ('ajuste_positivo', 'Ajuste Positivo'),
        ('ajuste_negativo', 'Ajuste Negativo'),
        ('transferencia_entrada', 'Transferencia Entrada'),
        ('transferencia_salida', 'Transferencia Salida'),
        ('inventario_inicial', 'Inventario Inicial'),
        ('merma', 'Merma'),
        ('robo', 'Robo/Pérdida'),
        ('vencimiento', 'Vencimiento'),
        ('produccion', 'Producción'),
        ('consumo_interno', 'Consumo Interno'),
    ]
    
    codigo = models.CharField(
        'Código',
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Código único del tipo de movimiento'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del tipo de movimiento'
    )
    
    tipo = models.CharField(
        'Tipo',
        max_length=20,
        choices=TIPOS_MOVIMIENTO,
        help_text='Tipo de movimiento (entrada/salida)'
    )
    
    categoria = models.CharField(
        'Categoría',
        max_length=30,
        choices=CATEGORIAS_MOVIMIENTO,
        help_text='Categoría específica del movimiento'
    )
    
    afecta_costo = models.BooleanField(
        'Afecta Costo',
        default=True,
        help_text='Si el movimiento afecta el costo promedio'
    )
    
    requiere_autorizacion = models.BooleanField(
        'Requiere Autorización',
        default=False,
        help_text='Si requiere autorización para ejecutar'
    )
    
    genera_documento = models.BooleanField(
        'Genera Documento',
        default=False,
        help_text='Si genera documento contable automático'
    )
    
    cuenta_contable_debe = models.CharField(
        'Cuenta Debe',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para el debe'
    )
    
    cuenta_contable_haber = models.CharField(
        'Cuenta Haber',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable para el haber'
    )
    
    orden = models.PositiveIntegerField(
        'Orden',
        default=0,
        help_text='Orden de visualización'
    )
    
    class Meta:
        db_table = 'inventario_tipo_movimiento'
        verbose_name = 'Tipo de Movimiento'
        verbose_name_plural = 'Tipos de Movimientos'
        indexes = [
            models.Index(fields=['codigo'], name='idx_tipo_mov_codigo'),
            models.Index(fields=['tipo'], name='idx_tipo_mov_tipo'),
            models.Index(fields=['categoria'], name='idx_tipo_mov_categoria'),
            models.Index(fields=['orden'], name='idx_tipo_mov_orden'),
            models.Index(fields=['activo'], name='idx_tipo_mov_activo'),
        ]
        ordering = ['orden', 'nombre']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class Almacen(ModeloBase):
    """
    Modelo para almacenes/ubicaciones de inventario
    Permite control de stock por ubicación
    """
    
    codigo = models.CharField(
        'Código',
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Código único del almacén'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del almacén'
    )
    
    descripcion = models.TextField(
        'Descripción',
        blank=True,
        null=True,
        help_text='Descripción del almacén'
    )
    
    sucursal = models.ForeignKey(
        'core.Sucursal',
        on_delete=models.CASCADE,
        related_name='almacenes',
        verbose_name='Sucursal'
    )
    
    direccion = models.TextField(
        'Dirección',
        max_length=300,
        blank=True,
        null=True,
        help_text='Dirección del almacén'
    )
    
    responsable = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='almacenes_responsable',
        verbose_name='Responsable',
        blank=True,
        null=True
    )
    
    capacidad_maxima = models.DecimalField(
        'Capacidad Máxima',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        blank=True,
        null=True,
        help_text='Capacidad máxima del almacén'
    )
    
    unidad_capacidad = models.CharField(
        'Unidad Capacidad',
        max_length=20,
        default='m3',
        help_text='Unidad de medida de la capacidad'
    )
    
    es_principal = models.BooleanField(
        'Es Principal',
        default=False,
        help_text='Si es el almacén principal'
    )
    
    permite_ventas = models.BooleanField(
        'Permite Ventas',
        default=True,
        help_text='Si permite salidas por ventas'
    )
    
    permite_compras = models.BooleanField(
        'Permite Compras',
        default=True,
        help_text='Si permite entradas por compras'
    )
    
    controla_ubicaciones = models.BooleanField(
        'Controla Ubicaciones',
        default=False,
        help_text='Si controla ubicaciones específicas'
    )
    
    temperatura_min = models.DecimalField(
        'Temperatura Mínima',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Temperatura mínima en °C'
    )
    
    temperatura_max = models.DecimalField(
        'Temperatura Máxima',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Temperatura máxima en °C'
    )
    
    humedad_min = models.DecimalField(
        'Humedad Mínima',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Humedad mínima en %'
    )
    
    humedad_max = models.DecimalField(
        'Humedad Máxima',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Humedad máxima en %'
    )
    
    class Meta:
        db_table = 'inventario_almacen'
        verbose_name = 'Almacén'
        verbose_name_plural = 'Almacenes'
        indexes = [
            models.Index(fields=['codigo'], name='idx_almacen_codigo'),
            models.Index(fields=['sucursal'], name='idx_almacen_sucursal'),
            models.Index(fields=['es_principal'], name='idx_almacen_principal'),
            models.Index(fields=['activo'], name='idx_almacen_activo'),
        ]
        ordering = ['sucursal', 'codigo']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class StockProducto(ModeloBase):
    """
    Modelo para stock actual de productos por almacén
    Resumen rápido para consultas de disponibilidad
    """
    
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.CASCADE,
        related_name='stocks',
        verbose_name='Producto'
    )
    
    almacen = models.ForeignKey(
        Almacen,
        on_delete=models.CASCADE,
        related_name='stocks',
        verbose_name='Almacén'
    )
    
    cantidad_actual = models.DecimalField(
        'Cantidad Actual',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad actual en stock'
    )
    
    cantidad_reservada = models.DecimalField(
        'Cantidad Reservada',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad reservada para pedidos'
    )
    
    cantidad_disponible = models.DecimalField(
        'Cantidad Disponible',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad disponible (actual - reservada)'
    )
    
    costo_promedio = models.DecimalField(
        'Costo Promedio',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Costo promedio ponderado'
    )
    
    valor_inventario = models.DecimalField(
        'Valor Inventario',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Valor total del inventario'
    )
    
    fecha_ultimo_movimiento = models.DateTimeField(
        'Último Movimiento',
        blank=True,
        null=True,
        help_text='Fecha del último movimiento'
    )
    
    fecha_ultimo_ingreso = models.DateTimeField(
        'Último Ingreso',
        blank=True,
        null=True,
        help_text='Fecha del último ingreso'
    )
    
    fecha_ultima_salida = models.DateTimeField(
        'Última Salida',
        blank=True,
        null=True,
        help_text='Fecha de la última salida'
    )
    
    # Ubicación específica dentro del almacén
    ubicacion = models.CharField(
        'Ubicación',
        max_length=50,
        blank=True,
        null=True,
        help_text='Ubicación específica en el almacén'
    )
    
    pasillo = models.CharField(
        'Pasillo',
        max_length=20,
        blank=True,
        null=True,
        help_text='Pasillo del almacén'
    )
    
    estante = models.CharField(
        'Estante',
        max_length=20,
        blank=True,
        null=True,
        help_text='Estante del almacén'
    )
    
    nivel = models.CharField(
        'Nivel',
        max_length=20,
        blank=True,
        null=True,
        help_text='Nivel del estante'
    )
    
    class Meta:
        db_table = 'inventario_stock_producto'
        verbose_name = 'Stock de Producto'
        verbose_name_plural = 'Stocks de Productos'
        unique_together = [['producto', 'almacen']]
        indexes = [
            models.Index(fields=['producto'], name='idx_stock_producto'),
            models.Index(fields=['almacen'], name='idx_stock_almacen'),
            models.Index(fields=['cantidad_actual'], name='idx_stock_cantidad'),
            models.Index(fields=['cantidad_disponible'], name='idx_stock_disponible'),
            models.Index(fields=['costo_promedio'], name='idx_stock_costo'),
            models.Index(fields=['fecha_ultimo_movimiento'], name='idx_stock_ultimo_mov'),
            models.Index(fields=['activo'], name='idx_stock_activo'),
        ]
        ordering = ['producto__codigo', 'almacen__codigo']
    
    def __str__(self):
        return f"{self.producto.codigo} - {self.almacen.codigo} - Stock: {self.cantidad_actual}"
    
    def save(self, *args, **kwargs):
        """Override save para calcular cantidad disponible"""
        self.cantidad_disponible = self.cantidad_actual - self.cantidad_reservada
        self.valor_inventario = self.cantidad_actual * self.costo_promedio
        super().save(*args, **kwargs)
    
    def esta_disponible(self, cantidad_requerida):
        """Verifica si hay cantidad disponible"""
        return self.cantidad_disponible >= cantidad_requerida
    
    def reservar_cantidad(self, cantidad):
        """Reserva una cantidad específica"""
        if self.cantidad_disponible >= cantidad:
            self.cantidad_reservada += cantidad
            self.save(update_fields=['cantidad_reservada'])
            return True
        return False
    
    def liberar_reserva(self, cantidad):
        """Libera una reserva de cantidad"""
        self.cantidad_reservada = max(Decimal('0.0000'), self.cantidad_reservada - cantidad)
        self.save(update_fields=['cantidad_reservada'])


class LoteProducto(ModeloBase):
    """
    Modelo para control de lotes de productos
    Implementa PEPS (First In, First Out)
    """
    
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.CASCADE,
        related_name='lotes',
        verbose_name='Producto'
    )
    
    almacen = models.ForeignKey(
        Almacen,
        on_delete=models.CASCADE,
        related_name='lotes',
        verbose_name='Almacén'
    )
    
    numero_lote = models.CharField(
        'Número de Lote',
        max_length=50,
        db_index=True,
        help_text='Número identificador del lote'
    )
    
    fecha_ingreso = models.DateTimeField(
        'Fecha de Ingreso',
        default=timezone.now,
        db_index=True,
        help_text='Fecha de ingreso del lote'
    )
    
    fecha_vencimiento = models.DateField(
        'Fecha de Vencimiento',
        blank=True,
        null=True,
        db_index=True,
        help_text='Fecha de vencimiento del lote'
    )
    
    cantidad_inicial = models.DecimalField(
        'Cantidad Inicial',
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))],
        help_text='Cantidad inicial del lote'
    )
    
    cantidad_actual = models.DecimalField(
        'Cantidad Actual',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad actual disponible'
    )
    
    costo_unitario = models.DecimalField(
        'Costo Unitario',
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0000'))],
        help_text='Costo unitario del lote'
    )
    
    valor_total = models.DecimalField(
        'Valor Total',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Valor total del lote'
    )
    
    proveedor = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.PROTECT,
        related_name='lotes_productos',
        verbose_name='Proveedor',
        blank=True,
        null=True,
        limit_choices_to={'tipo_cliente': 'persona_juridica'}
    )
    
    documento_origen = models.CharField(
        'Documento Origen',
        max_length=50,
        blank=True,
        null=True,
        help_text='Documento que originó el lote'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del lote'
    )
    
    # Control de calidad
    estado_calidad = models.CharField(
        'Estado de Calidad',
        max_length=20,
        choices=[
            ('bueno', 'Bueno'),
            ('regular', 'Regular'),
            ('malo', 'Malo'),
            ('vencido', 'Vencido'),
            ('cuarentena', 'En Cuarentena'),
        ],
        default='bueno',
        help_text='Estado de calidad del lote'
    )
    
    temperatura_almacenamiento = models.DecimalField(
        'Temperatura Almacenamiento',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Temperatura de almacenamiento en °C'
    )
    
    humedad_almacenamiento = models.DecimalField(
        'Humedad Almacenamiento',
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text='Humedad de almacenamiento en %'
    )
    
    class Meta:
        db_table = 'inventario_lote_producto'
        verbose_name = 'Lote de Producto'
        verbose_name_plural = 'Lotes de Productos'
        unique_together = [['producto', 'almacen', 'numero_lote']]
        indexes = [
            models.Index(fields=['producto'], name='idx_lote_producto'),
            models.Index(fields=['almacen'], name='idx_lote_almacen'),
            models.Index(fields=['numero_lote'], name='idx_lote_numero'),
            models.Index(fields=['fecha_ingreso'], name='idx_lote_fecha_ing'),
            models.Index(fields=['fecha_vencimiento'], name='idx_lote_vencimiento'),
            models.Index(fields=['cantidad_actual'], name='idx_lote_cantidad'),
            models.Index(fields=['estado_calidad'], name='idx_lote_calidad'),
            models.Index(fields=['activo'], name='idx_lote_activo'),
        ]
        ordering = ['fecha_ingreso', 'numero_lote']
    
    def __str__(self):
        return f"{self.producto.codigo} - Lote: {self.numero_lote}"
    
    def save(self, *args, **kwargs):
        """Override save para calcular valor total"""
        self.valor_total = self.cantidad_actual * self.costo_unitario
        super().save(*args, **kwargs)
    
    def esta_vencido(self):
        """Verifica si el lote está vencido"""
        if not self.fecha_vencimiento:
            return False
        return timezone.now().date() > self.fecha_vencimiento
    
    def dias_hasta_vencimiento(self):
        """Retorna los días hasta el vencimiento"""
        if not self.fecha_vencimiento:
            return None
        return (self.fecha_vencimiento - timezone.now().date()).days
    
    def esta_disponible(self, cantidad_requerida):
        """Verifica disponibilidad del lote"""
        if self.estado_calidad not in ['bueno', 'regular']:
            return False, f"Lote en estado: {self.estado_calidad}"
        
        if self.esta_vencido():
            return False, "Lote vencido"
        
        if self.cantidad_actual < cantidad_requerida:
            return False, f"Cantidad insuficiente. Disponible: {self.cantidad_actual}"
        
        return True, "Lote disponible"
    
    def consumir_cantidad(self, cantidad):
        """Consume una cantidad del lote (método PEPS)"""
        if self.cantidad_actual >= cantidad:
            self.cantidad_actual -= cantidad
            self.save(update_fields=['cantidad_actual'])
            return cantidad
        else:
            cantidad_consumida = self.cantidad_actual
            self.cantidad_actual = Decimal('0.0000')
            self.save(update_fields=['cantidad_actual'])
            return cantidad_consumida


class MovimientoInventario(ModeloBase):
    """
    Modelo principal para movimientos de inventario
    Registra todas las entradas y salidas de productos
    """
    
    ESTADOS_MOVIMIENTO = [
        ('borrador', 'Borrador'),
        ('pendiente', 'Pendiente'),
        ('autorizado', 'Autorizado'),
        ('ejecutado', 'Ejecutado'),
        ('anulado', 'Anulado'),
    ]
    
    # Identificación única
    uuid = models.UUIDField(
        'UUID',
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text='Identificador único universal'
    )
    
    numero = models.CharField(
        'Número',
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Número único del movimiento'
    )
    
    tipo_movimiento = models.ForeignKey(
        TipoMovimiento,
        on_delete=models.PROTECT,
        related_name='movimientos',
        verbose_name='Tipo de Movimiento'
    )
    
    almacen = models.ForeignKey(
        Almacen,
        on_delete=models.PROTECT,
        related_name='movimientos',
        verbose_name='Almacén'
    )
    
    fecha_movimiento = models.DateTimeField(
        'Fecha de Movimiento',
        default=timezone.now,
        db_index=True,
        help_text='Fecha y hora del movimiento'
    )
    
    # Referencias
    documento_origen = models.CharField(
        'Documento Origen',
        max_length=50,
        blank=True,
        null=True,
        help_text='Documento que origina el movimiento'
    )
    
    documento_electronico = models.ForeignKey(
        'facturacion.DocumentoElectronico',
        on_delete=models.PROTECT,
        related_name='movimientos_inventario',
        verbose_name='Documento Electrónico',
        blank=True,
        null=True
    )
    
    proveedor_cliente = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.PROTECT,
        related_name='movimientos_inventario',
        verbose_name='Proveedor/Cliente',
        blank=True,
        null=True
    )
    
    # Control de autorización
    estado = models.CharField(
        'Estado',
        max_length=20,
        choices=ESTADOS_MOVIMIENTO,
        default='borrador',
        db_index=True,
        help_text='Estado del movimiento'
    )
    
    usuario_creacion = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='movimientos_creados',
        verbose_name='Usuario Creación'
    )
    
    usuario_autorizacion = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='movimientos_autorizados',
        verbose_name='Usuario Autorización',
        blank=True,
        null=True
    )
    
    fecha_autorizacion = models.DateTimeField(
        'Fecha Autorización',
        blank=True,
        null=True,
        help_text='Fecha de autorización'
    )
    
    # Información adicional
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del movimiento'
    )
    
    motivo = models.TextField(
        'Motivo',
        blank=True,
        null=True,
        help_text='Motivo del movimiento'
    )
    
    # Totales
    total_items = models.PositiveIntegerField(
        'Total Items',
        default=0,
        help_text='Cantidad total de items'
    )
    
    total_cantidad = models.DecimalField(
        'Total Cantidad',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Cantidad total del movimiento'
    )
    
    total_valor = models.DecimalField(
        'Total Valor',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Valor total del movimiento'
    )
    
    class Meta:
        db_table = 'inventario_movimiento_inventario'
        verbose_name = 'Movimiento de Inventario'
        verbose_name_plural = 'Movimientos de Inventario'
        indexes = [
            models.Index(fields=['numero'], name='idx_mov_numero'),
            models.Index(fields=['fecha_movimiento'], name='idx_mov_fecha'),
            models.Index(fields=['tipo_movimiento'], name='idx_mov_tipo'),
            models.Index(fields=['almacen'], name='idx_mov_almacen'),
            models.Index(fields=['estado'], name='idx_mov_estado'),
            models.Index(fields=['usuario_creacion'], name='idx_mov_usuario'),
            models.Index(fields=['documento_electronico'], name='idx_mov_documento'),
            models.Index(fields=['proveedor_cliente'], name='idx_mov_proveedor'),
            models.Index(fields=['activo'], name='idx_mov_activo'),
        ]
        ordering = ['-fecha_movimiento', '-numero']
    
    def __str__(self):
        return f"{self.numero} - {self.tipo_movimiento.nombre}"
    
    def save(self, *args, **kwargs):
        """Override save para generar número automático"""
        if not self.numero:
            self.numero = self._generar_numero()
        super().save(*args, **kwargs)
    
    def _generar_numero(self):
        """Genera número automático para el movimiento"""
        from datetime import datetime
        
        prefix = f"MOV{datetime.now().strftime('%Y%m')}"
        ultimo = MovimientoInventario.objects.filter(
            numero__startswith=prefix
        ).order_by('-numero').first()
        
        if ultimo:
            ultimo_numero = int(ultimo.numero[-6:])
            nuevo_numero = ultimo_numero + 1
        else:
            nuevo_numero = 1
        
        return f"{prefix}{nuevo_numero:06d}"
    
    def puede_autorizar(self, usuario):
        """Verifica si el usuario puede autorizar el movimiento"""
        if self.estado != 'pendiente':
            return False, f"Movimiento en estado: {self.estado}"
        
        if not self.tipo_movimiento.requiere_autorizacion:
            return True, "Movimiento no requiere autorización"
        
        # Verificar permisos del usuario (implementar según roles)
        return True, "Usuario autorizado"
    
    def autorizar(self, usuario):
        """Autoriza el movimiento"""
        puede, mensaje = self.puede_autorizar(usuario)
        if not puede:
            raise ValidationError(mensaje)
        
        self.estado = 'autorizado'
        self.usuario_autorizacion = usuario
        self.fecha_autorizacion = timezone.now()
        self.save(update_fields=['estado', 'usuario_autorizacion', 'fecha_autorizacion'])
    
    def ejecutar(self):
        """Ejecuta el movimiento afectando el inventario"""
        if self.estado not in ['autorizado', 'pendiente']:
            raise ValidationError(f"No se puede ejecutar movimiento en estado: {self.estado}")
        
        # Ejecutar cada detalle del movimiento
        for detalle in self.detalles.all():
            detalle.ejecutar()
        
        # Actualizar estado
        self.estado = 'ejecutado'
        self.save(update_fields=['estado'])
        
        # Recalcular totales
        self._calcular_totales()
    
    def anular(self, motivo):
        """Anula el movimiento"""
        if self.estado == 'ejecutado':
            # Reversar movimientos
            for detalle in self.detalles.all():
                detalle.reversar()
        
        self.estado = 'anulado'
        self.motivo = motivo
        self.save(update_fields=['estado', 'motivo'])
    
    def _calcular_totales(self):
        """Calcula los totales del movimiento"""
        detalles = self.detalles.all()
        self.total_items = detalles.count()
        self.total_cantidad = sum(d.cantidad for d in detalles)
        self.total_valor = sum(d.valor_total for d in detalles)
        self.save(update_fields=['total_items', 'total_cantidad', 'total_valor'])


class DetalleMovimiento(ModeloBase):
    """
    Modelo para detalle de movimientos de inventario
    Items individuales de cada movimiento
    """
    
    movimiento = models.ForeignKey(
        MovimientoInventario,
        on_delete=models.CASCADE,
        related_name='detalles',
        verbose_name='Movimiento'
    )
    
    numero_item = models.PositiveIntegerField(
        'Número de Item',
        help_text='Número correlativo del item'
    )
    
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.PROTECT,
        related_name='movimientos_inventario',
        verbose_name='Producto'
    )
    
    lote = models.ForeignKey(
        LoteProducto,
        on_delete=models.PROTECT,
        related_name='movimientos',
        verbose_name='Lote',
        blank=True,
        null=True
    )
    
    cantidad = models.DecimalField(
        'Cantidad',
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))],
        help_text='Cantidad del movimiento'
    )
    
    costo_unitario = models.DecimalField(
        'Costo Unitario',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Costo unitario del producto'
    )
    
    valor_total = models.DecimalField(
        'Valor Total',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Valor total del item'
    )
    
    # Información específica para entradas
    numero_lote_entrada = models.CharField(
        'Número Lote Entrada',
        max_length=50,
        blank=True,
        null=True,
        help_text='Número de lote para nuevas entradas'
    )
    
    fecha_vencimiento_entrada = models.DateField(
        'Vencimiento Entrada',
        blank=True,
        null=True,
        help_text='Fecha de vencimiento para nuevas entradas'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del item'
    )
    
    # Control de ejecución
    ejecutado = models.BooleanField(
        'Ejecutado',
        default=False,
        help_text='Si el detalle ha sido ejecutado'
    )
    
    fecha_ejecucion = models.DateTimeField(
        'Fecha Ejecución',
        blank=True,
        null=True,
        help_text='Fecha de ejecución del detalle'
    )
    
    class Meta:
        db_table = 'inventario_detalle_movimiento'
        verbose_name = 'Detalle de Movimiento'
        verbose_name_plural = 'Detalles de Movimientos'
        unique_together = [['movimiento', 'numero_item']]
        indexes = [
            models.Index(fields=['movimiento'], name='idx_det_mov_movimiento'),
            models.Index(fields=['producto'], name='idx_det_mov_producto'),
            models.Index(fields=['lote'], name='idx_det_mov_lote'),
            models.Index(fields=['ejecutado'], name='idx_det_mov_ejecutado'),
            models.Index(fields=['activo'], name='idx_det_mov_activo'),
        ]
        ordering = ['numero_item']
    
    def __str__(self):
        return f"{self.movimiento.numero} - Item {self.numero_item} - {self.producto.codigo}"
    
    def save(self, *args, **kwargs):
        """Override save para calcular valor total"""
        self.valor_total = self.cantidad * self.costo_unitario
        super().save(*args, **kwargs)
    
    def ejecutar(self):
        """Ejecuta el detalle del movimiento"""
        if self.ejecutado:
            return
        
        if self.movimiento.tipo_movimiento.tipo == 'entrada':
            self._ejecutar_entrada()
        elif self.movimiento.tipo_movimiento.tipo == 'salida':
            self._ejecutar_salida()
        elif self.movimiento.tipo_movimiento.tipo == 'ajuste':
            self._ejecutar_ajuste()
        
        self.ejecutado = True
        self.fecha_ejecucion = timezone.now()
        self.save(update_fields=['ejecutado', 'fecha_ejecucion'])
    
    def _ejecutar_entrada(self):
        """Ejecuta una entrada de inventario"""
        # Crear o actualizar lote
        if self.numero_lote_entrada:
            lote, creado = LoteProducto.objects.get_or_create(
                producto=self.producto,
                almacen=self.movimiento.almacen,
                numero_lote=self.numero_lote_entrada,
                defaults={
                    'fecha_ingreso': self.movimiento.fecha_movimiento,
                    'fecha_vencimiento': self.fecha_vencimiento_entrada,
                    'cantidad_inicial': self.cantidad,
                    'cantidad_actual': self.cantidad,
                    'costo_unitario': self.costo_unitario,
                    'proveedor': self.movimiento.proveedor_cliente,
                    'documento_origen': self.movimiento.documento_origen,
                }
            )
            
            if not creado:
                # Actualizar lote existente (promedio ponderado)
                cantidad_total = lote.cantidad_actual + self.cantidad
                costo_promedio = ((lote.cantidad_actual * lote.costo_unitario) + 
                                 (self.cantidad * self.costo_unitario)) / cantidad_total
                
                lote.cantidad_actual = cantidad_total
                lote.costo_unitario = costo_promedio
                lote.save()
            
            self.lote = lote
            self.save(update_fields=['lote'])
        
        # Actualizar stock del producto
        self._actualizar_stock_producto('entrada')
    
    def _ejecutar_salida(self):
        """Ejecuta una salida de inventario usando PEPS"""
        cantidad_pendiente = self.cantidad
        
        # Obtener lotes disponibles ordenados por fecha (PEPS)
        lotes_disponibles = LoteProducto.objects.filter(
            producto=self.producto,
            almacen=self.movimiento.almacen,
            cantidad_actual__gt=0,
            estado_calidad__in=['bueno', 'regular'],
            activo=True
        ).order_by('fecha_ingreso')
        
        for lote in lotes_disponibles:
            if cantidad_pendiente <= 0:
                break
            
            cantidad_a_consumir = min(cantidad_pendiente, lote.cantidad_actual)
            cantidad_consumida = lote.consumir_cantidad(cantidad_a_consumir)
            cantidad_pendiente -= cantidad_consumida
        
        if cantidad_pendiente > 0:
            raise ValidationError(f"Stock insuficiente. Faltante: {cantidad_pendiente}")
        
        # Actualizar stock del producto
        self._actualizar_stock_producto('salida')
    
    def _ejecutar_ajuste(self):
        """Ejecuta un ajuste de inventario"""
        # Los ajustes afectan directamente el stock
        if self.movimiento.tipo_movimiento.categoria == 'ajuste_positivo':
            self._actualizar_stock_producto('entrada')
        else:
            self._actualizar_stock_producto('salida')
    
    def _actualizar_stock_producto(self, tipo_operacion):
        """Actualiza el stock del producto en el almacén"""
        stock, creado = StockProducto.objects.get_or_create(
            producto=self.producto,
            almacen=self.movimiento.almacen,
            defaults={'cantidad_actual': Decimal('0.0000')}
        )
        
        if tipo_operacion == 'entrada':
            stock.cantidad_actual += self.cantidad
            stock.fecha_ultimo_ingreso = self.movimiento.fecha_movimiento
        else:  # salida
            stock.cantidad_actual -= self.cantidad
            stock.fecha_ultima_salida = self.movimiento.fecha_movimiento
        
        stock.fecha_ultimo_movimiento = self.movimiento.fecha_movimiento
        
        # Recalcular costo promedio
        stock.costo_promedio = self._calcular_costo_promedio()
        
        stock.save()
    
    def _calcular_costo_promedio(self):
        """Calcula el costo promedio del producto en el almacén"""
        lotes = LoteProducto.objects.filter(
            producto=self.producto,
            almacen=self.movimiento.almacen,
            cantidad_actual__gt=0,
            activo=True
        )
        
        if not lotes.exists():
            return Decimal('0.0000')
        
        total_cantidad = sum(lote.cantidad_actual for lote in lotes)
        total_valor = sum(lote.cantidad_actual * lote.costo_unitario for lote in lotes)
        
        if total_cantidad > 0:
            return total_valor / total_cantidad
        
        return Decimal('0.0000')
    
    def reversar(self):
        """Reversa el movimiento (para anulaciones)"""
        if not self.ejecutado:
            return
        
        if self.movimiento.tipo_movimiento.tipo == 'entrada':
            self._actualizar_stock_producto('salida')
        elif self.movimiento.tipo_movimiento.tipo == 'salida':
            self._actualizar_stock_producto('entrada')
        
        self.ejecutado = False
        self.fecha_ejecucion = None
        self.save(update_fields=['ejecutado', 'fecha_ejecucion'])