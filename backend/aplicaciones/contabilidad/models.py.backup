"""
Modelos de Contabilidad - FELICITAFAC
Sistema de Facturación Electrónica para Perú
Implementación del Plan Contable General Empresarial (PCGE)
Optimizado para MySQL y hosting compartido
"""

from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid
from aplicaciones.core.models import ModeloBase


class PlanCuentas(ModeloBase):
    """
    Modelo para el Plan de Cuentas según PCGE
    Plan Contable General Empresarial de Perú
    """
    
    TIPOS_CUENTA = [
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
        ('resultado', 'Resultado'),
    ]
    
    NATURALEZA_CUENTA = [
        ('deudora', 'Deudora'),
        ('acreedora', 'Acreedora'),
    ]
    
    NIVELES_CUENTA = [
        (1, 'Elemento (1 dígito)'),
        (2, 'Rubro (2 dígitos)'),
        (3, 'Cuenta (3 dígitos)'),
        (4, 'Divisionaria (4 dígitos)'),
        (5, 'Subdivisionaria (5 dígitos)'),
    ]
    
    # Validador para código de cuenta
    validador_codigo = RegexValidator(
        regex=r'^\d{1,10}$',
        message='El código debe contener solo dígitos'
    )
    
    codigo = models.CharField(
        'Código',
        max_length=10,
        unique=True,
        validators=[validador_codigo],
        db_index=True,
        help_text='Código de la cuenta según PCGE'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=200,
        help_text='Nombre de la cuenta contable'
    )
    
    descripcion = models.TextField(
        'Descripción',
        blank=True,
        null=True,
        help_text='Descripción detallada de la cuenta'
    )
    
    cuenta_padre = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='cuentas_hijas',
        verbose_name='Cuenta Padre',
        help_text='Cuenta padre en la jerarquía'
    )
    
    nivel = models.PositiveIntegerField(
        'Nivel',
        choices=NIVELES_CUENTA,
        help_text='Nivel de la cuenta en la jerarquía'
    )
    
    tipo_cuenta = models.CharField(
        'Tipo de Cuenta',
        max_length=20,
        choices=TIPOS_CUENTA,
        db_index=True,
        help_text='Tipo de cuenta contable'
    )
    
    naturaleza = models.CharField(
        'Naturaleza',
        max_length=10,
        choices=NATURALEZA_CUENTA,
        help_text='Naturaleza de la cuenta (deudora/acreedora)'
    )
    
    acepta_movimientos = models.BooleanField(
        'Acepta Movimientos',
        default=True,
        help_text='Si la cuenta acepta movimientos directos'
    )
    
    requiere_centro_costo = models.BooleanField(
        'Requiere Centro de Costo',
        default=False,
        help_text='Si requiere centro de costo'
    )
    
    requiere_documento = models.BooleanField(
        'Requiere Documento',
        default=False,
        help_text='Si requiere documento de respaldo'
    )
    
    moneda_funcional = models.CharField(
        'Moneda Funcional',
        max_length=3,
        choices=[
            ('PEN', 'Soles'),
            ('USD', 'Dólares'),
            ('EUR', 'Euros'),
            ('MIX', 'Mixta'),
        ],
        default='PEN',
        help_text='Moneda funcional de la cuenta'
    )
    
    # Información PCGE específica
    elemento_pcge = models.CharField(
        'Elemento PCGE',
        max_length=1,
        db_index=True,
        help_text='Elemento del PCGE (1-9)'
    )
    
    rubro_pcge = models.CharField(
        'Rubro PCGE',
        max_length=2,
        blank=True,
        null=True,
        help_text='Rubro del PCGE'
    )
    
    # Configuración automática
    afecta_resultado = models.BooleanField(
        'Afecta Resultado',
        default=False,
        help_text='Si afecta el resultado del ejercicio'
    )
    
    es_cuenta_resultado = models.BooleanField(
        'Es Cuenta de Resultado',
        default=False,
        help_text='Si es cuenta de resultado (ingresos/gastos)'
    )
    
    se_ajusta_inflacion = models.BooleanField(
        'Se Ajusta por Inflación',
        default=False,
        help_text='Si se ajusta por inflación'
    )
    
    # Control de uso
    uso_automatico = models.BooleanField(
        'Uso Automático',
        default=False,
        help_text='Si se usa automáticamente en procesos'
    )
    
    cuenta_ventas = models.BooleanField(
        'Cuenta de Ventas',
        default=False,
        help_text='Si es cuenta de ventas'
    )
    
    cuenta_compras = models.BooleanField(
        'Cuenta de Compras',
        default=False,
        help_text='Si es cuenta de compras'
    )
    
    cuenta_inventario = models.BooleanField(
        'Cuenta de Inventario',
        default=False,
        help_text='Si es cuenta de inventario'
    )
    
    cuenta_igv = models.BooleanField(
        'Cuenta de IGV',
        default=False,
        help_text='Si es cuenta de IGV'
    )
    
    cuenta_cuentas_cobrar = models.BooleanField(
        'Cuenta por Cobrar',
        default=False,
        help_text='Si es cuenta por cobrar'
    )
    
    cuenta_cuentas_pagar = models.BooleanField(
        'Cuenta por Pagar',
        default=False,
        help_text='Si es cuenta por pagar'
    )
    
    # Saldos acumulados
    saldo_inicial = models.DecimalField(
        'Saldo Inicial',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Saldo inicial del ejercicio'
    )
    
    saldo_debe = models.DecimalField(
        'Saldo Debe',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total movimientos al debe'
    )
    
    saldo_haber = models.DecimalField(
        'Saldo Haber',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total movimientos al haber'
    )
    
    saldo_actual = models.DecimalField(
        'Saldo Actual',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Saldo actual de la cuenta'
    )
    
    class Meta:
        db_table = 'contabilidad_plan_cuentas'
        verbose_name = 'Plan de Cuentas'
        verbose_name_plural = 'Plan de Cuentas'
        indexes = [
            models.Index(fields=['codigo'], name='idx_plan_codigo'),
            models.Index(fields=['elemento_pcge'], name='idx_plan_elemento'),
            models.Index(fields=['tipo_cuenta'], name='idx_plan_tipo'),
            models.Index(fields=['naturaleza'], name='idx_plan_naturaleza'),
            models.Index(fields=['cuenta_padre'], name='idx_plan_padre'),
            models.Index(fields=['acepta_movimientos'], name='idx_plan_movimientos'),
            models.Index(fields=['uso_automatico'], name='idx_plan_automatico'),
            models.Index(fields=['activo'], name='idx_plan_activo'),
        ]
        ordering = ['codigo']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar jerarquía de códigos
        if self.cuenta_padre:
            if not self.codigo.startswith(self.cuenta_padre.codigo):
                raise ValidationError({
                    'codigo': 'El código debe comenzar con el código de la cuenta padre'
                })
        
        # Validar nivel según longitud del código
        longitud_codigo = len(self.codigo)
        if longitud_codigo != self.nivel:
            if not (self.nivel == 5 and longitud_codigo > 5):  # Subdivisionarias pueden tener más de 5 dígitos
                raise ValidationError({
                    'nivel': f'El nivel no corresponde con la longitud del código'
                })
        
        # Validar elemento PCGE
        if self.codigo and len(self.codigo) >= 1:
            self.elemento_pcge = self.codigo[0]
        
        # Validar rubro PCGE
        if self.codigo and len(self.codigo) >= 2:
            self.rubro_pcge = self.codigo[:2]
    
    def save(self, *args, **kwargs):
        """Override save para configuraciones automáticas"""
        # Configurar naturaleza según elemento PCGE
        if self.elemento_pcge in ['1', '2', '3']:  # Activos
            self.naturaleza = 'deudora'
            self.tipo_cuenta = 'activo'
        elif self.elemento_pcge in ['4']:  # Pasivos
            self.naturaleza = 'acreedora'
            self.tipo_cuenta = 'pasivo'
        elif self.elemento_pcge in ['5']:  # Patrimonio
            self.naturaleza = 'acreedora'
            self.tipo_cuenta = 'patrimonio'
        elif self.elemento_pcge in ['6']:  # Gastos
            self.naturaleza = 'deudora'
            self.tipo_cuenta = 'gasto'
            self.afecta_resultado = True
            self.es_cuenta_resultado = True
        elif self.elemento_pcge in ['7']:  # Ingresos
            self.naturaleza = 'acreedora'
            self.tipo_cuenta = 'ingreso'
            self.afecta_resultado = True
            self.es_cuenta_resultado = True
        elif self.elemento_pcge in ['8', '9']:  # Resultados
            self.tipo_cuenta = 'resultado'
        
        super().save(*args, **kwargs)
    
    def obtener_saldo_real(self):
        """Calcula el saldo real basado en la naturaleza"""
        if self.naturaleza == 'deudora':
            return self.saldo_inicial + self.saldo_debe - self.saldo_haber
        else:
            return self.saldo_inicial + self.saldo_haber - self.saldo_debe
    
    def obtener_ruta_completa(self):
        """Retorna la ruta completa de la cuenta"""
        if self.cuenta_padre:
            return f"{self.cuenta_padre.obtener_ruta_completa()} > {self.nombre}"
        return self.nombre
    
    def obtener_cuentas_hijas(self):
        """Retorna todas las cuentas hijas recursivamente"""
        hijas = list(self.cuentas_hijas.filter(activo=True))
        for hija in self.cuentas_hijas.filter(activo=True):
            hijas.extend(hija.obtener_cuentas_hijas())
        return hijas
    
    def actualizar_saldo(self, debe=0, haber=0):
        """Actualiza los saldos de la cuenta"""
        self.saldo_debe += Decimal(str(debe))
        self.saldo_haber += Decimal(str(haber))
        self.saldo_actual = self.obtener_saldo_real()
        self.save(update_fields=['saldo_debe', 'saldo_haber', 'saldo_actual'])


class EjercicioContable(ModeloBase):
    """
    Modelo para ejercicios contables
    Controla los períodos contables de la empresa
    """
    
    ESTADOS_EJERCICIO = [
        ('abierto', 'Abierto'),
        ('cerrado', 'Cerrado'),
        ('auditado', 'Auditado'),
    ]
    
    codigo = models.CharField(
        'Código',
        max_length=10,
        unique=True,
        help_text='Código del ejercicio (ej: 2024)'
    )
    
    nombre = models.CharField(
        'Nombre',
        max_length=100,
        help_text='Nombre del ejercicio contable'
    )
    
    fecha_inicio = models.DateField(
        'Fecha de Inicio',
        help_text='Fecha de inicio del ejercicio'
    )
    
    fecha_fin = models.DateField(
        'Fecha de Fin',
        help_text='Fecha de fin del ejercicio'
    )
    
    estado = models.CharField(
        'Estado',
        max_length=10,
        choices=ESTADOS_EJERCICIO,
        default='abierto',
        db_index=True,
        help_text='Estado del ejercicio'
    )
    
    es_actual = models.BooleanField(
        'Es Actual',
        default=False,
        db_index=True,
        help_text='Si es el ejercicio actual'
    )
    
    fecha_cierre = models.DateTimeField(
        'Fecha de Cierre',
        blank=True,
        null=True,
        help_text='Fecha de cierre del ejercicio'
    )
    
    usuario_cierre = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='ejercicios_cerrados',
        verbose_name='Usuario Cierre',
        blank=True,
        null=True
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del ejercicio'
    )
    
    class Meta:
        db_table = 'contabilidad_ejercicio_contable'
        verbose_name = 'Ejercicio Contable'
        verbose_name_plural = 'Ejercicios Contables'
        indexes = [
            models.Index(fields=['codigo'], name='idx_ejercicio_codigo'),
            models.Index(fields=['fecha_inicio'], name='idx_ejercicio_inicio'),
            models.Index(fields=['fecha_fin'], name='idx_ejercicio_fin'),
            models.Index(fields=['estado'], name='idx_ejercicio_estado'),
            models.Index(fields=['es_actual'], name='idx_ejercicio_actual'),
            models.Index(fields=['activo'], name='idx_ejercicio_activo'),
        ]
        ordering = ['-fecha_inicio']
    
    def __str__(self):
        return f"{self.codigo} - {self.nombre}"
    
    def clean(self):
        """Validaciones del ejercicio"""
        if self.fecha_fin <= self.fecha_inicio:
            raise ValidationError('La fecha de fin debe ser posterior a la fecha de inicio')
    
    def save(self, *args, **kwargs):
        """Override save para ejercicio único actual"""
        if self.es_actual:
            # Solo un ejercicio puede ser actual
            EjercicioContable.objects.filter(es_actual=True).update(es_actual=False)
        
        super().save(*args, **kwargs)
    
    def cerrar_ejercicio(self, usuario):
        """Cierra el ejercicio contable"""
        if self.estado != 'abierto':
            raise ValidationError('Solo se pueden cerrar ejercicios abiertos')
        
        self.estado = 'cerrado'
        self.fecha_cierre = timezone.now()
        self.usuario_cierre = usuario
        self.es_actual = False
        self.save()


class AsientoContable(ModeloBase):
    """
    Modelo para asientos contables
    Registra las transacciones contables del sistema
    """
    
    TIPOS_ASIENTO = [
        ('apertura', 'Apertura'),
        ('diario', 'Diario'),
        ('ajuste', 'Ajuste'),
        ('cierre', 'Cierre'),
        ('automatico', 'Automático'),
    ]
    
    ESTADOS_ASIENTO = [
        ('borrador', 'Borrador'),
        ('provisional', 'Provisional'),
        ('definitivo', 'Definitivo'),
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
        db_index=True,
        help_text='Número del asiento contable'
    )
    
    ejercicio = models.ForeignKey(
        EjercicioContable,
        on_delete=models.PROTECT,
        related_name='asientos',
        verbose_name='Ejercicio Contable'
    )
    
    fecha = models.DateField(
        'Fecha',
        db_index=True,
        help_text='Fecha del asiento contable'
    )
    
    tipo_asiento = models.CharField(
        'Tipo de Asiento',
        max_length=20,
        choices=TIPOS_ASIENTO,
        default='diario',
        db_index=True,
        help_text='Tipo de asiento contable'
    )
    
    estado = models.CharField(
        'Estado',
        max_length=20,
        choices=ESTADOS_ASIENTO,
        default='borrador',
        db_index=True,
        help_text='Estado del asiento'
    )
    
    glosa = models.TextField(
        'Glosa',
        max_length=500,
        help_text='Descripción del asiento contable'
    )
    
    # Referencias
    documento_origen = models.CharField(
        'Documento Origen',
        max_length=50,
        blank=True,
        null=True,
        help_text='Documento que origina el asiento'
    )
    
    documento_electronico = models.ForeignKey(
        'facturacion.DocumentoElectronico',
        on_delete=models.PROTECT,
        related_name='asientos_contables',
        verbose_name='Documento Electrónico',
        blank=True,
        null=True
    )
    
    # Moneda y tipo de cambio
    moneda = models.CharField(
        'Moneda',
        max_length=3,
        choices=[
            ('PEN', 'Soles'),
            ('USD', 'Dólares'),
            ('EUR', 'Euros'),
        ],
        default='PEN',
        help_text='Moneda del asiento'
    )
    
    tipo_cambio = models.DecimalField(
        'Tipo de Cambio',
        max_digits=8,
        decimal_places=4,
        default=Decimal('1.0000'),
        help_text='Tipo de cambio del día'
    )
    
    # Totales
    total_debe = models.DecimalField(
        'Total Debe',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total del debe'
    )
    
    total_haber = models.DecimalField(
        'Total Haber',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Total del haber'
    )
    
    diferencia = models.DecimalField(
        'Diferencia',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Diferencia entre debe y haber'
    )
    
    # Control de usuarios
    usuario_creacion = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='asientos_creados',
        verbose_name='Usuario Creación'
    )
    
    usuario_aprobacion = models.ForeignKey(
        'usuarios.Usuario',
        on_delete=models.PROTECT,
        related_name='asientos_aprobados',
        verbose_name='Usuario Aprobación',
        blank=True,
        null=True
    )
    
    fecha_aprobacion = models.DateTimeField(
        'Fecha Aprobación',
        blank=True,
        null=True,
        help_text='Fecha de aprobación del asiento'
    )
    
    # Información adicional
    centro_costo = models.CharField(
        'Centro de Costo',
        max_length=20,
        blank=True,
        null=True,
        help_text='Centro de costo del asiento'
    )
    
    proyecto = models.CharField(
        'Proyecto',
        max_length=50,
        blank=True,
        null=True,
        help_text='Proyecto relacionado'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del asiento'
    )
    
    # Control automático
    es_automatico = models.BooleanField(
        'Es Automático',
        default=False,
        help_text='Si fue generado automáticamente'
    )
    
    proceso_origen = models.CharField(
        'Proceso Origen',
        max_length=50,
        blank=True,
        null=True,
        help_text='Proceso que generó el asiento automático'
    )
    
    class Meta:
        db_table = 'contabilidad_asiento_contable'
        verbose_name = 'Asiento Contable'
        verbose_name_plural = 'Asientos Contables'
        unique_together = [['ejercicio', 'numero']]
        indexes = [
            models.Index(fields=['numero'], name='idx_asiento_numero'),
            models.Index(fields=['fecha'], name='idx_asiento_fecha'),
            models.Index(fields=['tipo_asiento'], name='idx_asiento_tipo'),
            models.Index(fields=['estado'], name='idx_asiento_estado'),
            models.Index(fields=['ejercicio'], name='idx_asiento_ejercicio'),
            models.Index(fields=['usuario_creacion'], name='idx_asiento_usuario'),
            models.Index(fields=['documento_electronico'], name='idx_asiento_documento'),
            models.Index(fields=['es_automatico'], name='idx_asiento_automatico'),
            models.Index(fields=['activo'], name='idx_asiento_activo'),
        ]
        ordering = ['-fecha', '-numero']
    
    def __str__(self):
        return f"{self.numero} - {self.fecha} - {self.glosa[:50]}"
    
    def save(self, *args, **kwargs):
        """Override save para generar número automático"""
        if not self.numero:
            self.numero = self._generar_numero()
        
        # Validar balance
        self.diferencia = self.total_debe - self.total_haber
        
        super().save(*args, **kwargs)
    
    def _generar_numero(self):
        """Genera número automático para el asiento"""
        prefijo = f"{self.ejercicio.codigo}-"
        if self.tipo_asiento == 'automatico':
            prefijo += "AUTO-"
        
        ultimo = AsientoContable.objects.filter(
            ejercicio=self.ejercicio,
            numero__startswith=prefijo
        ).order_by('-numero').first()
        
        if ultimo:
            numero_str = ultimo.numero.replace(prefijo, '')
            try:
                ultimo_numero = int(numero_str)
                nuevo_numero = ultimo_numero + 1
            except ValueError:
                nuevo_numero = 1
        else:
            nuevo_numero = 1
        
        return f"{prefijo}{nuevo_numero:06d}"
    
    def esta_balanceado(self):
        """Verifica si el asiento está balanceado"""
        return abs(self.diferencia) < Decimal('0.01')
    
    def calcular_totales(self):
        """Calcula los totales del asiento"""
        detalles = self.detalles.filter(activo=True)
        self.total_debe = sum(d.debe for d in detalles)
        self.total_haber = sum(d.haber for d in detalles)
        self.diferencia = self.total_debe - self.total_haber
        self.save(update_fields=['total_debe', 'total_haber', 'diferencia'])
    
    def aprobar(self, usuario):
        """Aprueba el asiento contable"""
        if self.estado != 'provisional':
            raise ValidationError('Solo se pueden aprobar asientos provisionales')
        
        if not self.esta_balanceado():
            raise ValidationError('El asiento no está balanceado')
        
        self.estado = 'definitivo'
        self.usuario_aprobacion = usuario
        self.fecha_aprobacion = timezone.now()
        self.save()
        
        # Actualizar saldos de las cuentas
        self._actualizar_saldos_cuentas()
    
    def anular(self, motivo):
        """Anula el asiento contable"""
        if self.estado == 'definitivo':
            # Reversar saldos de las cuentas
            self._reversar_saldos_cuentas()
        
        self.estado = 'anulado'
        self.observaciones = f"{self.observaciones or ''}\nAnulado: {motivo}"
        self.save()
    
    def _actualizar_saldos_cuentas(self):
        """Actualiza los saldos de las cuentas involucradas"""
        for detalle in self.detalles.filter(activo=True):
            detalle.cuenta.actualizar_saldo(
                debe=detalle.debe,
                haber=detalle.haber
            )
    
    def _reversar_saldos_cuentas(self):
        """Reversa los saldos de las cuentas involucradas"""
        for detalle in self.detalles.filter(activo=True):
            detalle.cuenta.actualizar_saldo(
                debe=-detalle.debe,
                haber=-detalle.haber
            )


class DetalleAsiento(ModeloBase):
    """
    Modelo para detalle de asientos contables
    Movimientos individuales por cuenta
    """
    
    asiento = models.ForeignKey(
        AsientoContable,
        on_delete=models.CASCADE,
        related_name='detalles',
        verbose_name='Asiento Contable'
    )
    
    numero_linea = models.PositiveIntegerField(
        'Número de Línea',
        help_text='Número de línea dentro del asiento'
    )
    
    cuenta = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='movimientos',
        verbose_name='Cuenta Contable',
        limit_choices_to={'acepta_movimientos': True}
    )
    
    glosa = models.TextField(
        'Glosa',
        max_length=300,
        help_text='Descripción del movimiento'
    )
    
    debe = models.DecimalField(
        'Debe',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Importe del debe'
    )
    
    haber = models.DecimalField(
        'Haber',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))],
        help_text='Importe del haber'
    )
    
    # Moneda extranjera
    debe_me = models.DecimalField(
        'Debe ME',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Importe debe en moneda extranjera'
    )
    
    haber_me = models.DecimalField(
        'Haber ME',
        max_digits=15,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Importe haber en moneda extranjera'
    )
    
    # Referencias adicionales
    documento_referencia = models.CharField(
        'Documento Referencia',
        max_length=50,
        blank=True,
        null=True,
        help_text='Documento de referencia'
    )
    
    fecha_vencimiento = models.DateField(
        'Fecha Vencimiento',
        blank=True,
        null=True,
        help_text='Fecha de vencimiento (para cuentas por cobrar/pagar)'
    )
    
    centro_costo = models.CharField(
        'Centro de Costo',
        max_length=20,
        blank=True,
        null=True,
        help_text='Centro de costo específico'
    )
    
    proyecto = models.CharField(
        'Proyecto',
        max_length=50,
        blank=True,
        null=True,
        help_text='Proyecto específico'
    )
    
    # Información de terceros
    cliente_proveedor = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.PROTECT,
        related_name='movimientos_contables',
        verbose_name='Cliente/Proveedor',
        blank=True,
        null=True
    )
    
    tipo_documento_tercero = models.CharField(
        'Tipo Doc. Tercero',
        max_length=2,
        blank=True,
        null=True,
        help_text='Tipo de documento del tercero'
    )
    
    numero_documento_tercero = models.CharField(
        'Núm. Doc. Tercero',
        max_length=15,
        blank=True,
        null=True,
        help_text='Número de documento del tercero'
    )
    
    observaciones = models.TextField(
        'Observaciones',
        blank=True,
        null=True,
        help_text='Observaciones del detalle'
    )
    
    class Meta:
        db_table = 'contabilidad_detalle_asiento'
        verbose_name = 'Detalle de Asiento'
        verbose_name_plural = 'Detalles de Asientos'
        unique_together = [['asiento', 'numero_linea']]
        indexes = [
            models.Index(fields=['asiento'], name='idx_detalle_asiento'),
            models.Index(fields=['cuenta'], name='idx_detalle_cuenta'),
            models.Index(fields=['numero_linea'], name='idx_detalle_linea'),
            models.Index(fields=['debe'], name='idx_detalle_debe'),
            models.Index(fields=['haber'], name='idx_detalle_haber'),
            models.Index(fields=['cliente_proveedor'], name='idx_detalle_tercero'),
            models.Index(fields=['activo'], name='idx_detalle_activo'),
        ]
        ordering = ['numero_linea']
    
    def __str__(self):
        return f"{self.asiento.numero} - Línea {self.numero_linea} - {self.cuenta.codigo}"
    
    def clean(self):
        """Validaciones del detalle"""
        # Validar que solo uno de debe o haber tenga valor
        if self.debe > 0 and self.haber > 0:
            raise ValidationError('No se puede tener importe en debe y haber al mismo tiempo')
        
        if self.debe == 0 and self.haber == 0:
            raise ValidationError('Debe tener importe en debe o haber')
        
        # Validar que la cuenta acepta movimientos
        if not self.cuenta.acepta_movimientos:
            raise ValidationError('La cuenta seleccionada no acepta movimientos directos')
    
    def save(self, *args, **kwargs):
        """Override save para cálculos automáticos"""
        # Calcular moneda extranjera si es necesario
        if self.asiento.tipo_cambio != 1 and self.asiento.moneda != 'PEN':
            if self.debe > 0:
                self.debe_me = self.debe / self.asiento.tipo_cambio
            if self.haber > 0:
                self.haber_me = self.haber / self.asiento.tipo_cambio
        
        super().save(*args, **kwargs)
        
        # Actualizar totales del asiento padre
        self.asiento.calcular_totales()
    
    def obtener_importe_neto(self):
        """Retorna el importe neto del movimiento"""
        return self.debe - self.haber


class ConfiguracionContable(ModeloBase):
    """
    Modelo para configuración contable del sistema
    Define cuentas automáticas y parámetros contables
    """
    
    # Cuentas automáticas para ventas
    cuenta_ventas_gravadas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuenta Ventas Gravadas',
        help_text='Cuenta para ventas gravadas con IGV'
    )
    
    cuenta_ventas_exoneradas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuenta Ventas Exoneradas',
        blank=True,
        null=True,
        help_text='Cuenta para ventas exoneradas de IGV'
    )
    
    cuenta_ventas_inafectas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuenta Ventas Inafectas',
        blank=True,
        null=True,
        help_text='Cuenta para ventas inafectas de IGV'
    )
    
    # Cuentas de IGV
    cuenta_igv_ventas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuenta IGV Ventas',
        help_text='Cuenta para IGV de ventas'
    )
    
    cuenta_igv_compras = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuenta IGV Compras',
        help_text='Cuenta para IGV de compras'
    )
    
    # Cuentas por cobrar y pagar
    cuenta_cuentas_cobrar_facturas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuentas por Cobrar Facturas',
        help_text='Cuenta para cuentas por cobrar - facturas'
    )
    
    cuenta_cuentas_cobrar_boletas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuentas por Cobrar Boletas',
        help_text='Cuenta para cuentas por cobrar - boletas'
    )
    
    # Cuentas de inventario
    cuenta_inventario_mercaderias = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Inventario Mercaderías',
        help_text='Cuenta para inventario de mercaderías'
    )
    
    cuenta_costo_ventas = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Costo de Ventas',
        help_text='Cuenta para costo de ventas'
    )
    
    # Cuentas de efectivo
    cuenta_caja = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Cuenta Caja',
        help_text='Cuenta principal de caja'
    )
    
    cuenta_banco_principal = models.ForeignKey(
        PlanCuentas,
        on_delete=models.PROTECT,
        related_name='+',
        verbose_name='Banco Principal',
        blank=True,
        null=True,
        help_text='Cuenta del banco principal'
    )
    
    # Configuraciones de proceso
    generar_asientos_venta = models.BooleanField(
        'Generar Asientos Venta',
        default=True,
        help_text='Si generar asientos automáticos por ventas'
    )
    
    generar_asientos_inventario = models.BooleanField(
        'Generar Asientos Inventario',
        default=True,
        help_text='Si generar asientos por movimientos de inventario'
    )
    
    usar_centro_costos = models.BooleanField(
        'Usar Centros de Costo',
        default=False,
        help_text='Si usar centros de costo'
    )
    
    usar_proyectos = models.BooleanField(
        'Usar Proyectos',
        default=False,
        help_text='Si usar control de proyectos'
    )
    
    cerrar_automatico_mes = models.BooleanField(
        'Cierre Automático Mes',
        default=False,
        help_text='Si cerrar automáticamente cada mes'
    )
    
    class Meta:
        db_table = 'contabilidad_configuracion_contable'
        verbose_name = 'Configuración Contable'
        verbose_name_plural = 'Configuraciones Contables'
    
    def __str__(self):
        return "Configuración Contable del Sistema"
    
    def save(self, *args, **kwargs):
        # Solo puede existir una configuración
        if not self.pk and ConfiguracionContable.objects.exists():
            raise ValidationError('Solo puede existir una configuración contable')
        super().save(*args, **kwargs)