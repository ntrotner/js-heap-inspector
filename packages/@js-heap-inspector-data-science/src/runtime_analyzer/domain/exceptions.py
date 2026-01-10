class ParsingError(Exception):
    """Raised when parsing fails."""
    pass

class InvalidRuntimeError(Exception):
    """Raised when an empty or invalid runtime is provided."""
    pass

class UnsupportedAlgorithmError(Exception):
    """Raised when an unsupported subgraph algorithm is requested."""
    pass
