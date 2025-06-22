"""
Modelos de Facturación - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Optimizado para MySQL y normativa SUNAT
"""

from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
from aplicaciones.core.models import ModeloBase


class TipoDocumentoElectronico(ModeloBase):
    """
    Modelo para tipos de documentos electrónicos SUNAT
    Facturas, Boletas, Notas de Crédito, etc.
    """
    
    TIPOS_DOCUMENTO_SUNAT = [
        ('01', 'Factura'),
        ('03', 'Boleta de Venta'),
        ('07', 'Nota de Crédito'),
        ('08', 'Nota de Débito'),
        ('09', 'Guía de Remisión'),
        ('12', 'Ticket de Máquina Registradora'),
        ('13', 'Documento emitido por bancos'),
        ('14', 'Recibo por servicios públicos'),
        ('20', 'Comprobante de Retención'),
        ('40', 'Constancia de Depósito DETRACCION'),
    ]
    
    codigo_sunat = models.CharField(
        'Código SUNAT',
        max_length=2,
        choices=TIPOS_DOCUMENTO_SUNAT,
        unique=True,
        db_index=True,
        help_text='Código según tabla 10 SUNAT'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del tipo de documento'
    )
    
    nomenclatura = models.CharField(
        'Nomenclatura',
        max_length=10,
        help_text='Nomenclatura del documento (F, B, NC, ND)'
    )
    
    requiere_cliente_ruc = models.BooleanField(
        'Requiere Cliente RUC',
        default=False,
        help_text='Si requiere que el cliente tenga RUC'
    )
    
    permite_exportacion = models.BooleanField(
        'Permite Exportación',
        default=False,
        help_text='Si permite operaciones de exportación'
    )
    
    afecta_inventario = models.BooleanField(
        'Afecta Inventario',
        default=True,
        help_text='Si afecta el stock de productos'
    )
    
    afecta_cuentas_cobrar = models.BooleanField(
        'Afecta Cuentas por Cobrar',
        default=True,
        help_text='Si genera cuentas por cobrar'
    )
    
    requiere_referencia = models.BooleanField(
        'Requiere Referencia',
        default=False,
        help_text='Si requiere documento de referencia'
    )
    
    serie_defecto = models.CharField(
        'Serie por Defecto',
        max_length=4,
        help_text='Serie por defecto para el documento'
    )
    
    class Meta:
        db_table = 'facturacion_tipo_documento_electronico'
        verbose_name = 'Tipo de Documento Electrónico'
        verbose_name_plural = 'Tipos de Documentos Electrónicos'
        indexes = [
            models.Index(fields=['codigo_sunat'], name='idx_tipo_doc_elec_codigo'),
            models.Index(fields=['activo'], name='idx_tipo_doc_elec_activo'),
        ]
    
    def __str__(self):
        return f"{self.codigo_sunat} - {self.nombre}"


class SerieDocumento(ModeloBase):
    """
    Modelo para series de documentos por sucursal
    Controla la numeración correlativa
    """
    
    from aplicaciones.core.models import Sucursal
    
    sucursal = models.ForeignKey(
        'core.Sucursal',
        on_delete=models.CASCADE,
        related_name='series_documentos',
        verbose_name='Sucursal'
    )
    
    tipo_documento = models.ForeignKey(
        TipoDocumentoElectronico,
        on_delete=models.CASCADE,
        related_name='series',
        verbose_name='Tipo de Documento'
    )
    
    serie = models.CharField(
        'Serie',
        max_length=4,
        validators=[RegexValidator(
            regex=r'^[A-Z0-9]{4}$',
            message='La serie debe tener 4 caracteres alfanuméricos'
        )],
        help_text='Serie del documento (ej: F001, B001)'
    )
    
    numero_actual = models.PositiveIntegerField(
        'Número Actual',
        default=0,
        help_text='Último número emitido'
    )
    
    numero_maximo = models.PositiveIntegerField(
        'Número Máximo',
        default=99999999,
        help_text='Número máximo permitido'
    )
    
    es_predeterminada = models.BooleanField(
        'Es Predeterminada',
        default=False,
        help_text='Si es la serie predeterminada para el tipo'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones de la serie'
    )
    
    class Meta:
        db_table = 'facturacion_serie_documento'
        verbose_name = 'Serie de Documento'
        verbose_name_plural = 'Series de Documentos'
        unique_together = [['sucursal', 'tipo_documento', 'serie']]
        indexes = [
            models.Index(fields=['sucursal'], name='idx_serie_sucursal'),
            models.Index(fields=['tipo_documento'], name='idx_serie_tipo_doc'),
            models.Index(fields=['serie'], name='idx_serie_serie'),
            models.Index(fields=['es_predeterminada'], name='idx_serie_default'),
            models.Index(fields=['activo'], name='idx_serie_activo'),
        ]
    
    def __str__(self):
        return f"{self.serie} - {self.tipo_documento.nombre}"
    
    def obtener_siguiente_numero(self):
        """Obtiene el siguiente número disponible"""
        siguiente = self.numero_actual + 1
        if siguiente > self.numero_maximo:
            raise ValidationError(f"Se ha alcanzado el número máximo para la serie {self.serie}")
        return siguiente
    
    def incrementar_numero(self):
        """Incrementa el número actual"""
        self.numero_actual = self.obtener_siguiente_numero()
        self.save(update_fields=['numero_actual'])
        return self.numero_actual


class DocumentoElectronico(ModeloBase):
    """
    Modelo base para documentos electrónicos
    Facturas, Boletas, Notas de Crédito/Débito
    """
    
    ESTADOS_DOCUMENTO = [
        ('borrador', 'Borrador'),
        ('emitido', 'Emitido'),
        ('enviado_sunat', 'Enviado a SUNAT'),
        ('aceptado_sunat', 'Aceptado por SUNAT'),
        ('rechazado_sunat', 'Rechazado por SUNAT'),
        ('anulado', 'Anulado'),
        ('observado', 'Observado'),
    ]
    
    MONEDAS = [
        ('PEN', 'Soles'),
        ('USD', 'Dólares Americanos'),
        ('EUR', 'Euros'),
    ]
    
    # Identificación única
    uuid = models.UUIDField(
        'UUID',
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text='Identificador único universal'
    )
    
    # Información del documento
    tipo_documento = models.ForeignKey(
        TipoDocumentoElectronico,
        on_delete=models.PROTECT,
        related_name='documentos',
        verbose_name='Tipo de Documento'
    )
    
    serie_documento = models.ForeignKey(
        SerieDocumento,
        on_delete=models.PROTECT,
        related_name='documentos',
        verbose_name='Serie'
    )
    
    numero = models.PositiveIntegerField(
        'Número',
        help_text='Número correlativo del documento'
    )
    
    numero_completo = models.CharField(
        'Número Completo',
        max_length=15,
        db_index=True,
        help_text='Serie-Número completo (ej: F001-00000001)'
    )
    
    # Fechas
    fecha_emision = models.DateTimeField(
        'Fecha de Emisión',
        default=timezone.now,
        db_index=True,
        help_text='Fecha y hora de emisión'
    )
    
    fecha_vencimiento = models.DateField(
        'Fecha de Vencimiento',
        blank=True,
        null=True,
        help_text='Fecha de vencimiento del documento'
    )
    
    # Cliente
    cliente = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.PROTECT,
        related_name='documentos_electronicos',
        verbose_name='Cliente'
    )
    
    # Datos del cliente al momento de la facturación
    cliente_tipo_documento = models.CharField(
        'Cliente Tipo Doc',
        max_length=2,
        help_text='Tipo de documento del cliente'
    )
    
    cliente_numero_documento = models.CharField(
        'Cliente Número Doc',
        max_length=15,
        help_text='Número de documento del cliente'
    )
    
    cliente_razon_social = models.CharField(
        'Cliente Razón Social',
        max_length=200,
        help_text='Razón social del cliente'
    )
    
    cliente_direccion = models.TextField(
        'Cliente Dirección',
        max_length=300,
        help_text='Dirección del cliente'
    )
    
    cliente_email = models.EmailField(
        'Cliente Email',
        blank=True,
        null=True,
        help_text='Email del cliente'
    )
    
    # Moneda y tipo de cambio
    moneda = models.CharField(
        'Moneda',
        max_length=3,
        choices=MONEDAS,
        default='PEN',
        help_text='Moneda del documento'
    )
    
    tipo_cambio = models.DecimalField(
        'Tipo de Cambio',
        max_digits=8,
        decimal_places=4,
        default=Decimal('1.0000'),
        help_text='Tipo de cambio del día'
    )
    
    # Importes
    subtotal = models.DecimalField(
        'Subtotal',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Subtotal sin IGV'
    )
    
    total_descuentos = models.DecimalField(
        'Total Descuentos',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total de descuentos aplicados'
    )
    
    base_imponible = models.DecimalField(
        'Base Imponible',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Base imponible gravada'
    )
    
    igv = models.DecimalField(
        'IGV',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Impuesto General a las Ventas'
    )
    
    total_exonerado = models.DecimalField(
        'Total Exonerado',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total de operaciones exoneradas'
    )
    
    total_inafecto = models.DecimalField(
        'Total Inafecto',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total de operaciones inafectas'
    )
    
    total_gratuito = models.DecimalField(
        'Total Gratuito',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total de operaciones gratuitas'
    )
    
    total = models.DecimalField(
        'Total',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total del documento'
    )
    
    # Información adicional
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del documento'
    )
    
    condiciones_pago = models.CharField(
        'Condiciones de Pago',
        max_length=100,
        default='CONTADO',
        help_text='Condiciones de pago'
    )
    
    vendedor = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='documentos_vendidos',
        verbose_name='Vendedor',
        blank=True,
        null=True
    )
    
    # Estado y control
    estado = models.CharField(
        'Estado',
        max_length=20,
        choices=ESTADOS_DOCUMENTO,
        default='borrador',
        db_index=True,
        help_text='Estado actual del documento'
    )
    
    motivo_anulacion = models.TextField(
        'Motivo de Anulación',
        blank=True,
        null=True,
        help_text='Motivo de anulación del documento'
    )
    
    # Información SUNAT
    hash_documento = models.CharField(
        'Hash SUNAT',
        max_length=100,
        blank=True,
        null=True,
        help_text='Hash generado por SUNAT'
    )
    
    codigo_qr = models.TextField(
        'Código QR',
        blank=True,
        null=True,
        help_text='Datos para código QR'
    )
    
    enlace_pdf = models.URLField(
        'Enlace PDF',
        blank=True,
        null=True,
        help_text='Enlace al PDF del documento'
    )
    
    enlace_xml = models.URLField(
        'Enlace XML',
        blank=True,
        null=True,
        help_text='Enlace al XML del documento'
    )
    
    enlace_cdr = models.URLField(
        'Enlace CDR',
        blank=True,
        null=True,
        help_text='Enlace al CDR de SUNAT'
    )
    
    # Fechas de proceso SUNAT
    fecha_envio_sunat = models.DateTimeField(
        'Fecha Envío SUNAT',
        blank=True,
        null=True,
        help_text='Fecha de envío a SUNAT'
    )
    
    fecha_respuesta_sunat = models.DateTimeField(
        'Fecha Respuesta SUNAT',
        blank=True,
        null=True,
        help_text='Fecha de respuesta de SUNAT'
    )
    
    # Información de referencia (para notas)
    documento_referencia = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name='documentos_relacionados',
        verbose_name='Documento de Referencia'
    )
    
    tipo_nota = models.CharField(
        'Tipo de Nota',
        max_length=2,
        blank=True,
        null=True,
        help_text='Tipo de nota de crédito/débito'
    )
    
    motivo_nota = models.TextField(
        'Motivo de Nota',
        blank=True,
        null=True,
        help_text='Motivo de la nota de crédito/débito'
    )
    
    class Meta:
        db_table = 'facturacion_documento_electronico'
        verbose_name = 'Documento Electrónico'
        verbose_name_plural = 'Documentos Electrónicos'
        unique_together = [['serie_documento', 'numero']]
        indexes = [
            models.Index(fields=['numero_completo'], name='idx_doc_numero_completo'),
            models.Index(fields=['fecha_emision'], name='idx_doc_fecha_emision'),
            models.Index(fields=['cliente'], name='idx_doc_cliente'),
            models.Index(fields=['estado'], name='idx_doc_estado'),
            models.Index(fields=['tipo_documento'], name='idx_doc_tipo'),
            models.Index(fields=['vendedor'], name='idx_doc_vendedor'),
            models.Index(fields=['moneda'], name='idx_doc_moneda'),
            models.Index(fields=['total'], name='idx_doc_total'),
            models.Index(fields=['uuid'], name='idx_doc_uuid'),
            models.Index(fields=['hash_documento'], name='idx_doc_hash'),
            models.Index(fields=['fecha_vencimiento'], name='idx_doc_vencimiento'),
            models.Index(fields=['activo'], name='idx_doc_activo'),
        ]
        ordering = ['-fecha_emision', '-numero']
    
    def __str__(self):
        return f"{self.numero_completo} - {self.cliente_razon_social}"
    
    def save(self, *args, **kwargs):
        """Override save para generar número completo"""
        if not self.numero_completo:
            self.numero_completo = f"{self.serie_documento.serie}-{self.numero:08d}"
        
        # Generar código QR para documentos válidos
        if self.estado in ['emitido', 'aceptado_sunat'] and not self.codigo_qr:
            self.codigo_qr = self._generar_codigo_qr()
        
        super().save(*args, **kwargs)
    
    def _generar_codigo_qr(self):
        """Genera datos para código QR según formato SUNAT"""
        from aplicaciones.core.models import Empresa
        
        try:
            empresa = Empresa.objects.filter(activo=True).first()
            if not empresa:
                return ""
            
            # Formato QR SUNAT: RUC|TIPO_DOC|SERIE|NUMERO|IGV|TOTAL|FECHA|TIPO_DOC_CLIENTE|NUM_DOC_CLIENTE|
            qr_data = f"{empresa.ruc}|{self.tipo_documento.codigo_sunat}|{self.serie_documento.serie}|{self.numero}|{self.igv}|{self.total}|{self.fecha_emision.strftime('%Y-%m-%d')}|{self.cliente_tipo_documento}|{self.cliente_numero_documento}|"
            return qr_data
        except Exception:
            return ""
    
    def puede_anular(self):
        """Verifica si el documento puede anularse"""
        if self.estado in ['anulado']:
            return False, "El documento ya está anulado"
        
        if self.estado == 'borrador':
            return True, "Documento en borrador puede eliminarse"
        
        # Verificar fecha límite para anulación (7 días)
        from datetime import timedelta
        limite_anulacion = self.fecha_emision + timedelta(days=7)
        if timezone.now() > limite_anulacion:
            return False, "Ha pasado el tiempo límite para anular (7 días)"
        
        return True, "Documento puede anularse"
    
    def anular(self, motivo):
        """Anula el documento"""
        puede, mensaje = self.puede_anular()
        if not puede:
            raise ValidationError(mensaje)
        
        self.estado = 'anulado'
        self.motivo_anulacion = motivo
        self.save(update_fields=['estado', 'motivo_anulacion'])
        
        # Reversar afectación de inventario
        self._reversar_inventario()
    
    def _reversar_inventario(self):
        """Reversa la afectación al inventario"""
        if self.tipo_documento.afecta_inventario:
            for detalle in self.detalles.all():
                if detalle.producto.controla_stock:
                    detalle.producto.actualizar_stock(
                        detalle.cantidad, 
                        'entrada'  # Reversa: entrada si era salida
                    )
    
    def calcular_totales(self):
        """Calcula los totales del documento basado en los detalles"""
        detalles = self.detalles.all()
        
        self.subtotal = sum(d.subtotal for d in detalles)
        self.total_descuentos = sum(d.descuento for d in detalles)
        self.base_imponible = sum(d.base_imponible for d in detalles)
        self.igv = sum(d.igv for d in detalles)
        self.total_exonerado = sum(d.subtotal for d in detalles if d.tipo_afectacion_igv.startswith('2'))
        self.total_inafecto = sum(d.subtotal for d in detalles if d.tipo_afectacion_igv.startswith('3'))
        self.total_gratuito = sum(d.subtotal for d in detalles if d.es_gratuito)
        self.total = self.base_imponible + self.igv + self.total_exonerado + self.total_inafecto
        
        self.save(update_fields=[
            'subtotal', 'total_descuentos', 'base_imponible', 'igv',
            'total_exonerado', 'total_inafecto', 'total_gratuito', 'total'
        ])


class DetalleDocumento(ModeloBase):
    """
    Modelo para detalle de documentos electrónicos
    Items individuales de facturas, boletas, etc.
    """
    
    documento = models.ForeignKey(
        DocumentoElectronico,
        on_delete=models.CASCADE,
        related_name='detalles',
        verbose_name='Documento'
    )
    
    numero_item = models.PositiveIntegerField(
        'Número de Item',
        help_text='Número correlativo del item'
    )
    
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.PROTECT,
        related_name='detalles_facturacion',
        verbose_name='Producto'
    )
    
    # Datos del producto al momento de la venta
    codigo_producto = models.CharField(
        'Código Producto',
        max_length=50,
        help_text='Código del producto'
    )
    
    descripcion = models.TextField(
        'Descripción',
        max_length=500,
        help_text='Descripción del producto'
    )
    
    unidad_medida = models.CharField(
        'Unidad de Medida',
        max_length=3,
        help_text='Código de unidad SUNAT'
    )
    
    # Cantidades y precios
    cantidad = models.DecimalField(
        'Cantidad',
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))],
        help_text='Cantidad del producto'
    )
    
    precio_unitario = models.DecimalField(
        'Precio Unitario',
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Precio unitario sin IGV'
    )
    
    precio_unitario_con_igv = models.DecimalField(
        'Precio Unit. c/IGV',
        max_digits=12,
        decimal_places=4,
        default=Decimal('0.0000'),
        help_text='Precio unitario con IGV'
    )
    
    # Descuentos
    descuento_porcentaje = models.DecimalField(
        'Descuento (%)',
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('100.00'))],
        help_text='Porcentaje de descuento'
    )
    
    descuento = models.DecimalField(
        'Descuento',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Monto de descuento'
    )
    
    # Importes calculados
    subtotal = models.DecimalField(
        'Subtotal',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Subtotal del item'
    )
    
    base_imponible = models.DecimalField(
        'Base Imponible',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Base imponible del item'
    )
    
    igv = models.DecimalField(
        'IGV',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='IGV del item'
    )
    
    total_item = models.DecimalField(
        'Total Item',
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total del item con IGV'
    )
    
    # Configuración SUNAT
    tipo_afectacion_igv = models.CharField(
        'Tipo Afectación IGV',
        max_length=2,
        default='10',
        help_text='Código de afectación IGV según SUNAT'
    )
    
    codigo_tributo = models.CharField(
        'Código Tributo',
        max_length=4,
        default='1000',
        help_text='Código de tributo SUNAT'
    )
    
    porcentaje_igv = models.DecimalField(
        'Porcentaje IGV',
        max_digits=5,
        decimal_places=2,
        default=Decimal('18.00'),
        help_text='Porcentaje de IGV aplicado'
    )
    
    es_gratuito = models.BooleanField(
        'Es Gratuito',
        default=False,
        help_text='Si el item es gratuito'
    )
    
    # Información adicional
    lote = models.CharField(
        'Lote',
        max_length=50,
        blank=True,
        null=True,
        help_text='Número de lote del producto'
    )
    
    fecha_vencimiento_producto = models.DateField(
        'Vencimiento Producto',
        blank=True,
        null=True,
        help_text='Fecha de vencimiento del producto'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del item'
    )
    
    class Meta:
        db_table = 'facturacion_detalle_documento'
        verbose_name = 'Detalle de Documento'
        verbose_name_plural = 'Detalles de Documentos'
        unique_together = [['documento', 'numero_item']]
        indexes = [
            models.Index(fields=['documento'], name='idx_detalle_documento'),
            models.Index(fields=['producto'], name='idx_detalle_producto'),
            models.Index(fields=['numero_item'], name='idx_detalle_numero'),
            models.Index(fields=['activo'], name='idx_detalle_activo'),
        ]
        ordering = ['numero_item']
    
    def __str__(self):
        return f"{self.documento.numero_completo} - Item {self.numero_item}"
    
    def save(self, *args, **kwargs):
        """Override save para cálculos automáticos"""
        self._calcular_importes()
        super().save(*args, **kwargs)
        
        # Actualizar totales del documento padre
        self.documento.calcular_totales()
    
    def _calcular_importes(self):
        """Calcula todos los importes del detalle"""
        # Calcular subtotal
        self.subtotal = self.cantidad * self.precio_unitario
        
        # Calcular descuento
        if self.descuento_porcentaje > 0:
            self.descuento = self.subtotal * (self.descuento_porcentaje / 100)
        else:
            self.descuento = Decimal('0.00')
        
        # Calcular base imponible (subtotal - descuento)
        self.base_imponible = self.subtotal - self.descuento
        
        # Calcular IGV según tipo de afectación
        if self.tipo_afectacion_igv.startswith('1') and not self.es_gratuito:  # Gravado
            self.igv = self.base_imponible * (self.porcentaje_igv / 100)
            self.precio_unitario_con_igv = self.precio_unitario * (1 + self.porcentaje_igv / 100)
        else:  # Exonerado, Inafecto, Gratuito
            self.igv = Decimal('0.00')
            self.precio_unitario_con_igv = self.precio_unitario
        
        # Calcular total del item
        self.total_item = self.base_imponible + self.igv
    
    def afectar_inventario(self):
        """Afecta el inventario del producto"""
        if self.producto.controla_stock and self.documento.tipo_documento.afecta_inventario:
            self.producto.actualizar_stock(self.cantidad, 'salida')
            self.producto.actualizar_estadisticas_venta(self.cantidad, self.total_item)


class FormaPago(ModeloBase):
    """
    Modelo para formas de pago
    Efectivo, Transferencia, Tarjeta, etc.
    """
    
    TIPOS_PAGO = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia Bancaria'),
        ('tarjeta_credito', 'Tarjeta de Crédito'),
        ('tarjeta_debito', 'Tarjeta de Débito'),
        ('cheque', 'Cheque'),
        ('deposito', 'Depósito Bancario'),
        ('yape', 'Yape'),
        ('plin', 'Plin'),
        ('billetera_digital', 'Billetera Digital'),
        ('credito', 'Crédito'),
    ]
    
    codigo = models.CharField(
        'Código',
        max_length=20,
        unique=True,
        db_index=True,
        help_text='Código único de la forma de pago'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre de la forma de pago'
    )
    
    tipo = models.CharField(
        'Tipo',
        max_length=20,
        choices=TIPOS_PAGO,
        help_text='Tipo de forma de pago'
    )
    
    requiere_referencia = models.BooleanField(
        'Requiere Referencia',
        default=False,
        help_text='Si requiere número de referencia'
    )
    
    es_credito = models.BooleanField(
        'Es Crédito',
        default=False,
        help_text='Si es una forma de pago a crédito'
    )
    
    dias_credito_defecto = models.PositiveIntegerField(
        'Días Crédito',
        default=0,
        help_text='Días de crédito por defecto'
    )
    
    cuenta_contable = models.CharField(
        'Cuenta Contable',
        max_length=10,
        blank=True,
        null=True,
        help_text='Cuenta contable asociada'
    )
    
    orden = models.PositiveIntegerField(
        'Orden',
        default=0,
        help_text='Orden de visualización'
    )
    
    class Meta:
        db_table = 'facturacion_forma_pago'
        verbose_name = 'Forma de Pago'
        verbose_name_plural = 'Formas de Pago'
        indexes = [
            models.Index(fields=['codigo'], name='idx_forma_pago_codigo'),
            models.Index(fields=['tipo'], name='idx_forma_pago_tipo'),
            models.Index(fields=['orden'], name='idx_forma_pago_orden'),
            models.Index(fields=['activo'], name='idx_forma_pago_activo'),
        ]
        ordering = ['orden', 'nombre']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"


class PagoDocumento(ModeloBase):
    """
    Modelo para pagos de documentos
    Permite múltiples formas de pago por documento
    """
    
    documento = models.ForeignKey(
        DocumentoElectronico,
        on_delete=models.CASCADE,
        related_name='pagos',
        verbose_name='Documento'
    )
    
    forma_pago = models.ForeignKey(
        FormaPago,
        on_delete=models.PROTECT,
        related_name='pagos',
        verbose_name='Forma de Pago'
    )
    
    monto = models.DecimalField(
        'Monto',
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text='Monto del pago'
    )
    
    referencia = models.CharField(
        'Referencia',
        max_length=100,
        blank=True,
        null=True,
        help_text='Número de referencia del pago'
    )
    
    fecha_pago = models.DateTimeField(
        'Fecha de Pago',
        default=timezone.now,
        help_text='Fecha y hora del pago'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del pago'
    )
    
    class Meta:
        db_table = 'facturacion_pago_documento'
        verbose_name = 'Pago de Documento'
        verbose_name_plural = 'Pagos de Documentos'
        indexes = [
            models.Index(fields=['documento'], name='idx_pago_documento'),
            models.Index(fields=['forma_pago'], name='idx_pago_forma'),
            models.Index(fields=['fecha_pago'], name='idx_pago_fecha'),
            models.Index(fields=['activo'], name='idx_pago_activo'),
        ]
        ordering = ['fecha_pago']
    
    def __str__(self):
        return f"{self.documento.numero_completo} - {self.forma_pago.nombre} - S/ {self.monto}"