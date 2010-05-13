"""
Trait for enumerations, with optional alias list
"""

#public symbols
__all__ = ["Enum"]

# pylint: disable-msg=E0611,F0401
from enthought.traits.api import Enum as TraitEnum
from enthought.traits.api import TraitError, TraitType

    
class Enum(TraitType):
    """A Public Variable wrapper for an enumeration, which is a variable that
       can assume one value from a set of specified values.
       """
    
    def __init__(self, default_value=None, values=(), iotype=None, 
                        aliases=(), desc=None, **metadata):

        # Allow some variant constructors (no default, no index)
        if not values:
            if default_value is None:
                raise TraitError("Enum must contain at least one value.")
            else:
                values = default_value
                if isinstance(values, tuple) or \
                   isinstance(values, list):
                    default_value = values[0]
        else:
            if default_value is None:
                default_value = values[0]

        # We need tuples or a list for the index
        if not ( isinstance(values, tuple) or \
                 isinstance(values, list) ):
            values = (values,)
                
        if aliases:
            
            if not ( isinstance(aliases, tuple) or \
                     isinstance(aliases, list) ):
                aliases = (aliases,)
                
            if len(aliases) != len(values):
                raise TraitError("Length of aliases does not match " + \
                                 "length of values.")
            
        if default_value not in values:
            raise TraitError("Default value not in values.")
            
        self._validator = TraitEnum(default_value, values, **metadata)
            
        # Put iotype in the metadata dictionary
        if iotype is not None:
            metadata['iotype'] = iotype
            
        # Put desc in the metadata dictionary
        if desc is not None:
            metadata['desc'] = desc
            
        # Put values in the metadata dictionary
        if values:
            metadata['values'] = values

        # Put aliases in the metadata dictionary
        if aliases:
            metadata['aliases'] = aliases

        super(Enum, self).__init__(default_value=default_value,
                                         **metadata)

    def validate(self, object, name, value):
        """ Validates that a specified value is valid for this trait."""
        
        try:
            return self._validator.validate(object, name, value)
        except TraitError:
            self.error(object, name, value)

    def error(self, object, name, value):
        """Returns a general error string for Enum."""
        
        # pylint: disable-msg=E1101
        vtype = type( value )
        if value not in self.values:
            info = str(self.values)
            msg = "Trait '%s' must be in %s, " % (name, info) + \
                "but a value of %s %s was specified." % (value, vtype)
        else:
            msg = "Unknown error while setting trait '%s';" % (name) +\
                  "a value of %s %s was specified." % (value, vtype)
            
        object.raise_exception(msg, TraitError)       