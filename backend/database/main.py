import supabase
from dotenv import load_dotenv
from urllib.parse import quote_plus
import os

load_dotenv()

class Database:
    supabase_url: str = os.getenv("APP_DB_URL")
    supabase_key: str = os.getenv("APP_DB_PASS")
    
    def __init__(self):
        self.db = supabase.create_client(self.supabase_url, self.supabase_key)
    
    def check_connection(self):
        try:
            connection = self.db
            return connection
        except Exception as e:
            return f"{str(e)}"
    
    
        
    
    
    
        
    