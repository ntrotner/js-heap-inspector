import json
from ....domain.models import Runtime
from ....domain.exceptions import ParsingError

class RuntimeParserService:
    def parse(self, raw_input: str) -> Runtime:
        """
        Parses a raw string into the Runtime domain model.
        Currently supports JSON input matching the Runtime structure.
        """
        try:
            data = json.loads(raw_input)
        except json.JSONDecodeError as e:
            raise ParsingError(f"Invalid JSON input: {str(e)}") from e

        try:
            # If the input is a list or doesn't have the expected keys, pydantic will raise ValidationError
            return Runtime.model_validate(data)
        except Exception as e:
            raise ParsingError(f"Failed to parse runtime data: {str(e)}") from e
