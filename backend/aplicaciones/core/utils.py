"""
Utilidades Core - FELICITAFAC
Funciones utilitarias compartidas en todo el sistema
Optimizado para facturación electrónica Perú
"""

import re
import random
import string
import hashlib
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, date, timedelta
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.conf import settings
import logging

logger = logging.getLogger(__name__)
Usuario = get_user_model()


def obtener_usuario_actual(request=None):
    """
    Obtener el usuario actual desde el request o contexto
    Función principal requerida por el sistema
    """
    if request and hasattr(request, 'user') and request.user.is_authenticated:
        return request.user
    
    # Si no hay request, retornar None (para casos de sistema/cron)
    return None


def validar_ruc_peru(ruc):
    """
    Validar RUC peruano según algoritmo oficial
    Retorna True si es válido, False si no
    """
    if not ruc or len(ruc) != 11:
        return False
    
    if not ruc.isdigit():
        return False
    
    # Los dos primeros dígitos deben estar entre 10 y 20
    primeros_dos = int(ruc[:2])
    if primeros_dos < 10 or primeros_dos > 20:
        return False
    
    # Algoritmo de validación del dígito verificador
    factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    suma = 0
    
    for i in range(10):
        suma += int(ruc[i]) * factores[i]
    
    resto = suma % 11
    digito_verificador = 11 - resto if resto >= 2 else resto
    
    return int(ruc[10]) == digito_verificador


def validar_dni_peru(dni):
    """
    Validar DNI peruano (8 dígitos numéricos)
    Retorna True si es válido, False si no
    """
    if not dni or len(dni) != 8:
        return False
    
    return dni.isdigit()


def validar_documento_identidad(tipo_documento, numero_documento):
    """
    Validar documento de identidad según tipo
    Tipos: 1=DNI, 6=RUC, 7=Pasaporte, 0=Otros
    """
    numero_documento = str(numero_documento).strip()
    
    if tipo_documento == '1':  # DNI
        return validar_dni_peru(numero_documento)
    elif tipo_documento == '6':  # RUC
        return validar_ruc_peru(numero_documento)
    elif tipo_documento == '7':  # Pasaporte
        # Pasaporte: 9-12 caracteres alfanuméricos
        return len(numero_documento) >= 9 and len(numero_documento) <= 12
    elif tipo_documento == '0':  # Otros
        # Otros documentos: mínimo 5 caracteres
        return len(numero_documento) >= 5
    
    return False


def formatear_documento_identidad(tipo_documento, numero_documento):
    """
    Formatear documento según tipo para mostrar
    """
    numero = str(numero_documento).strip()
    
    if tipo_documento == '1' and len(numero) == 8:  # DNI
        return f"{numero[:2]}.{numero[2:5]}.{numero[5:]}"
    elif tipo_documento == '6' and len(numero) == 11:  # RUC
        return f"{numero[:2]}-{numero[2:10]}-{numero[10]}"
    
    return numero


def calcular_igv(subtotal, porcentaje_igv=18.0):
    """
    Calcular IGV desde subtotal
    Retorna el monto del IGV
    """
    if not isinstance(subtotal, Decimal):
        subtotal = Decimal(str(subtotal))
    
    porcentaje = Decimal(str(porcentaje_igv)) / Decimal('100')
    igv = subtotal * porcentaje
    
    return igv.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calcular_subtotal_desde_total(total_con_igv, porcentaje_igv=18.0):
    """
    Calcular subtotal desde total que incluye IGV
    Retorna el subtotal sin IGV
    """
    if not isinstance(total_con_igv, Decimal):
        total_con_igv = Decimal(str(total_con_igv))
    
    factor = Decimal('1') + (Decimal(str(porcentaje_igv)) / Decimal('100'))
    subtotal = total_con_igv / factor
    
    return subtotal.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def formatear_moneda(monto, moneda='PEN', decimales=2):
    """
    Formatear monto como moneda
    """
    if not isinstance(monto, Decimal):
        monto = Decimal(str(monto))
    
    # Formatear con separadores de miles
    monto_str = f"{monto:,.{decimales}f}"
    
    if moneda == 'PEN':
        return f"S/ {monto_str}"
    elif moneda == 'USD':
        return f"$ {monto_str}"
    elif moneda == 'EUR':
        return f"€ {monto_str}"
    else:
        return f"{moneda} {monto_str}"


def formatear_numero_documento(serie, numero, longitud=8):
    """
    Formatear número de documento con ceros a la izquierda
    Ejemplo: F001-00000123
    """
    numero_formateado = str(numero).zfill(longitud)
    return f"{serie}-{numero_formateado}"


def generar_codigo_aleatorio(longitud=8, incluir_numeros=True, incluir_letras=True):
    """
    Generar código aleatorio
    """
    caracteres = ""
    
    if incluir_numeros:
        caracteres += string.digits
    
    if incluir_letras:
        caracteres += string.ascii_uppercase
    
    if not caracteres:
        caracteres = string.digits + string.ascii_uppercase
    
    return ''.join(random.choice(caracteres) for _ in range(longitud))


def generar_hash_documento(contenido):
    """
    Generar hash SHA-256 para documentos
    """
    if isinstance(contenido, str):
        contenido = contenido.encode('utf-8')
    
    return hashlib.sha256(contenido).hexdigest()


def validar_email(email):
    """
    Validar formato de email
    """
    if not email:
        return False
    
    patron = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(patron, email) is not None


def validar_telefono_peru(telefono):
    """
    Validar teléfono peruano
    Acepta formatos: 999123456, 01-1234567, +51999123456
    """
    if not telefono:
        return False
    
    # Limpiar teléfono
    telefono_limpio = re.sub(r'[^\d]', '', telefono)
    
    # Remover código de país si está presente
    if telefono_limpio.startswith('51') and len(telefono_limpio) > 9:
        telefono_limpio = telefono_limpio[2:]
    
    # Validar longitud y formato
    if len(telefono_limpio) == 9:  # Celular
        return telefono_limpio.startswith('9')
    elif len(telefono_limpio) == 7:  # Fijo Lima
        return telefono_limpio.startswith(('1', '2', '3', '4', '5', '6', '7'))
    elif len(telefono_limpio) == 8:  # Fijo provincia
        return True
    
    return False


def limpiar_texto(texto, max_longitud=None):
    """
    Limpiar texto para usar en documentos
    """
    if not texto:
        return ""
    
    # Remover caracteres especiales problemáticos
    texto_limpio = re.sub(r'[^\w\s\-\.\,\:\;\(\)\[\]\/]', '', str(texto))
    
    # Normalizar espacios
    texto_limpio = ' '.join(texto_limpio.split())
    
    # Truncar si es necesario
    if max_longitud and len(texto_limpio) > max_longitud:
        texto_limpio = texto_limpio[:max_longitud].strip()
    
    return texto_limpio


def convertir_numero_a_letras(numero):
    """
    Convertir número a letras (básico para facturas)
    Solo para montos en soles
    """
    # Esta es una implementación básica
    # En producción se podría usar una librería más completa
    
    if not isinstance(numero, (int, float, Decimal)):
        return "CERO CON 00/100 SOLES"
    
    numero = float(numero)
    parte_entera = int(numero)
    parte_decimal = int(round((numero - parte_entera) * 100))
    
    # Implementación muy básica - mejorar en producción
    unidades = [
        "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE",
        "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", 
        "DIECISIETE", "DIECIOCHO", "DIECINUEVE"
    ]
    
    if parte_entera == 0:
        return f"CERO CON {parte_decimal:02d}/100 SOLES"
    elif parte_entera < 20:
        return f"{unidades[parte_entera]} CON {parte_decimal:02d}/100 SOLES"
    else:
        return f"*** CON {parte_decimal:02d}/100 SOLES"


def obtener_periodo_contable(fecha=None):
    """
    Obtener período contable en formato YYYYMM
    """
    if fecha is None:
        fecha = timezone.now().date()
    
    return fecha.strftime('%Y%m')


def obtener_ejercicio_fiscal(fecha=None):
    """
    Obtener ejercicio fiscal (año)
    """
    if fecha is None:
        fecha = timezone.now().date()
    
    return fecha.year


def es_fecha_valida_emision(fecha_emision):
    """
    Validar que la fecha de emisión sea válida para SUNAT
    No puede ser futura ni muy antigua
    """
    if not fecha_emision:
        return False, "Fecha de emisión es requerida"
    
    hoy = timezone.now().date()
    
    # No puede ser futura
    if fecha_emision > hoy:
        return False, "La fecha de emisión no puede ser futura"
    
    # No puede ser muy antigua (más de 12 meses)
    fecha_limite = hoy - timedelta(days=365)
    if fecha_emision < fecha_limite:
        return False, "La fecha de emisión es muy antigua"
    
    return True, "Fecha válida"


def obtener_ubigeo_lima():
    """
    Obtener ubigeo de Lima por defecto
    """
    return {
        'ubigeo': '150101',
        'departamento': 'LIMA',
        'provincia': 'LIMA',
        'distrito': 'LIMA'
    }


def normalizar_texto_mayusculas(texto):
    """
    Normalizar texto a mayúsculas para SUNAT
    """
    if not texto:
        return ""
    
    return str(texto).upper().strip()


def validar_codigo_producto(codigo):
    """
    Validar código de producto
    """
    if not codigo:
        return False, "Código es requerido"
    
    codigo = str(codigo).strip()
    
    if len(codigo) < 3:
        return False, "Código debe tener al menos 3 caracteres"
    
    if len(codigo) > 50:
        return False, "Código no puede exceder 50 caracteres"
    
    # Solo alfanuméricos y algunos caracteres especiales
    if not re.match(r'^[A-Za-z0-9\-_\.]+$', codigo):
        return False, "Código contiene caracteres no válidos"
    
    return True, "Código válido"


def obtener_configuracion(clave, valor_defecto=None):
    """
    Obtener configuración del sistema
    """
    try:
        from aplicaciones.core.models import Configuracion
        config = Configuracion.objects.filter(clave=clave, activo=True).first()
        
        if config:
            return config.obtener_valor()
        
        return valor_defecto
    except Exception as e:
        logger.warning(f"Error al obtener configuración {clave}: {e}")
        return valor_defecto


def log_operacion(usuario, operacion, modelo, objeto_id, detalles=None):
    """
    Registrar operación en log de auditoría
    """
    try:
        logger.info(
            f"Usuario: {usuario.id if usuario else 'Sistema'} | "
            f"Operación: {operacion} | "
            f"Modelo: {modelo} | "
            f"ID: {objeto_id} | "
            f"Detalles: {detalles or ''}"
        )
    except Exception as e:
        logger.error(f"Error al registrar log: {e}")


def redondear_decimal(valor, decimales=2):
    """
    Redondear decimal correctamente para cálculos financieros
    """
    if not isinstance(valor, Decimal):
        valor = Decimal(str(valor))
    
    factor = Decimal('0.1') ** decimales
    return valor.quantize(factor, rounding=ROUND_HALF_UP)


def validar_periodo_fiscal(periodo):
    """
    Validar período fiscal en formato YYYYMM
    """
    if not periodo:
        return False, "Período es requerido"
    
    if not re.match(r'^\d{6}$', str(periodo)):
        return False, "Período debe tener formato YYYYMM"
    
    año = int(str(periodo)[:4])
    mes = int(str(periodo)[4:])
    
    if año < 2000 or año > 2099:
        return False, "Año no válido"
    
    if mes < 1 or mes > 12:
        return False, "Mes no válido"
    
    return True, "Período válido"


def obtener_siguiente_correlativo(modelo, campo, prefijo="", longitud=8):
    """
    Obtener siguiente número correlativo para un modelo
    """
    try:
        ultimo_objeto = modelo.objects.filter(
            **{f"{campo}__startswith": prefijo}
        ).order_by(f"-{campo}").first()
        
        if ultimo_objeto:
            ultimo_numero = getattr(ultimo_objeto, campo)
            # Extraer número del final
            numero_str = ultimo_numero.replace(prefijo, "")
            numero = int(numero_str) + 1
        else:
            numero = 1
        
        return f"{prefijo}{str(numero).zfill(longitud)}"
    
    except Exception as e:
        logger.error(f"Error al obtener correlativo: {e}")
        return f"{prefijo}{str(1).zfill(longitud)}"