from datetime import datetime

class Utils:
    
    def calculate_age(dob: str) -> int:
        """Calculate age from date of birth (YYYY-MM-DD)."""
        birth_date = datetime.strptime(dob, "%Y-%m-%d")
        today = datetime.today()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        return age


