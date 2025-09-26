from django import template
from decimal import Decimal

register = template.Library()

@register.filter
def peso_format(value):
    """Format a decimal value as Philippine Peso with comma separators"""
    if value is None:
        return "₱0.00"
    
    try:
        # Convert to Decimal if it's not already
        if isinstance(value, str):
            value = Decimal(value)
        elif not isinstance(value, Decimal):
            value = Decimal(str(value))
        
        # Format with 2 decimal places
        formatted = f"{value:,.2f}"
        return f"₱{formatted}"
    except (ValueError, TypeError, Exception):
        return "₱0.00"

@register.filter
def peso_format_no_symbol(value):
    """Format a decimal value with comma separators but no currency symbol"""
    if value is None:
        return "0.00"
    
    try:
        # Convert to Decimal if it's not already
        if isinstance(value, str):
            value = Decimal(value)
        elif not isinstance(value, Decimal):
            value = Decimal(str(value))
        
        # Format with 2 decimal places
        return f"{value:,.2f}"
    except (ValueError, TypeError, Exception):
        return "0.00"
