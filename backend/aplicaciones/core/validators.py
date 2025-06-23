
"""
Validadores personalizados para FELICITAFAC
Sistema de Facturación Electrónica para Perú
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class PasswordComplexityValidator:
    """
    Validador de complejidad de contraseñas personalizado
    Requiere al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
    """
    
    def __init__(self, min_length=8):
        self.min_length = min_length
    
    def validate(self, password, user=None):
        """
        Validar complejidad de contraseña
        """
        errors = []
        
        # Verificar longitud mínima
        if len(password) < self.min_length:
            errors.append(
                _('La contraseña debe tener al menos %(min_length)d caracteres.') % {'min_length': self.min_length}
            )
        
        # Verificar al menos una mayúscula
        if not re.search(r'[A-Z]', password):
            errors.append(_('La contraseña debe contener al menos una letra mayúscula.'))
        
        # Verificar al menos una minúscula
        if not re.search(r'[a-z]', password):
            errors.append(_('La contraseña debe contener al menos una letra minúscula.'))
        
        # Verificar al menos un número
        if not re.search(r'[0-9]', password):
            errors.append(_('La contraseña debe contener al menos un número.'))
        
        # Verificar al menos un carácter especial
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]', password):
            errors.append(_('La contraseña debe contener al menos un carácter especial (!@#$%^&*).'))
        
        # Verificar que no sea solo números
        if password.isdigit():
            errors.append(_('La contraseña no puede ser solo números.'))
        
        # Verificar que no sea solo letras
        if password.isalpha():
            errors.append(_('La contraseña no puede ser solo letras.'))
        
        # Verificar patrones comunes débiles
        weak_patterns = [
            r'123456',
            r'password',
            r'qwerty',
            r'abc123',
            r'admin',
            r'letmein',
            r'welcome'
        ]
        
        for pattern in weak_patterns:
            if re.search(pattern.lower(), password.lower()):
                errors.append(_('La contraseña contiene un patrón común muy débil.'))
                break
        
        if errors:
            raise ValidationError(errors)
    
    def get_help_text(self):
        """
        Texto de ayuda para el validador
        """
        return _(
            'Su contraseña debe tener al menos %(min_length)d caracteres y contener '
            'al menos una letra mayúscula, una minúscula, un número y un carácter especial.'
        ) % {'min_length': self.min_length}


class RUCValidator:
    """
    Validador de RUC peruano
    """
    
    def __call__(self, value):
        """
        Validar RUC peruano
        """
        if not value:
            return
        
        # Limpiar espacios y guiones
        ruc = re.sub(r'[^0-9]', '', str(value))
        
        # Verificar longitud
        if len(ruc) != 11:
            raise ValidationError(_('El RUC debe tener 11 dígitos.'))
        
        # Verificar que sean solo números
        if not ruc.isdigit():
            raise ValidationError(_('El RUC debe contener solo números.'))
        
        # Verificar tipo de contribuyente (primeros 2 dígitos)
        tipo = ruc[:2]
        tipos_validos = ['10', '15', '17', '20']
        
        if tipo not in tipos_validos:
            raise ValidationError(_('Tipo de RUC no válido. Debe empezar con 10, 15, 17 o 20.'))
        
        # Validar dígito verificador
        if not self._validar_digito_verificador(ruc):
            raise ValidationError(_('RUC con dígito verificador inválido.'))
    
    def _validar_digito_verificador(self, ruc):
        """
        Algoritmo de validación del dígito verificador del RUC
        """
        # Factores para el cálculo
        factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
        
        # Calcular suma
        suma = sum(int(ruc[i]) * factores[i] for i in range(10))
        
        # Calcular resto
        resto = suma % 11
        
        # Calcular dígito verificador
        if resto == 0 or resto == 1:
            digito_verificador = resto
        else:
            digito_verificador = 11 - resto
        
        # Verificar
        return int(ruc[10]) == digito_verificador


class DNIValidator:
    """
    Validador de DNI peruano
    """
    
    def __call__(self, value):
        """
        Validar DNI peruano
        """
        if not value:
            return
        
        # Limpiar espacios y guiones
        dni = re.sub(r'[^0-9]', '', str(value))
        
        # Verificar longitud
        if len(dni) != 8:
            raise ValidationError(_('El DNI debe tener 8 dígitos.'))
        
        # Verificar que sean solo números
        if not dni.isdigit():
            raise ValidationError(_('El DNI debe contener solo números.'))
        
        # Verificar que no sean todos iguales
        if len(set(dni)) == 1:
            raise ValidationError(_('DNI no válido.'))


class CelularPeruanoValidator:
    """
    Validador de número celular peruano
    """
    
    def __call__(self, value):
        """
        Validar celular peruano
        """
        if not value:
            return
        
        # Limpiar formato
        celular = re.sub(r'[^0-9]', '', str(value))
        
        # Verificar longitud (9 dígitos sin código de país)
        if len(celular) == 9:
            # Verificar que empiece con 9
            if not celular.startswith('9'):
                raise ValidationError(_('El celular debe empezar con 9.'))
        elif len(celular) == 12:
            # Con código de país +51
            if not celular.startswith('519'):
                raise ValidationError(_('El celular debe empezar con +51 9.'))
        else:
            raise ValidationError(_('El celular debe tener 9 dígitos (sin código de país) o 12 con +51.'))