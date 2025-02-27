from datetime import datetime

class Utils:
    
    def calculate_age(self, dob: str):
        """Calculate age from date of birth (YYYY-MM-DD)."""
        self.birth_date = datetime.strptime(dob, "%Y-%m-%d")
        self.today = datetime.today()
        age = self.today.year - self.birth_date.year - ((self.today.month, self.today.day) < (self.birth_date.month, self.birth_date.day))
        return age


