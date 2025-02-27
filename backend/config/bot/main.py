import os
from dotenv import load_dotenv
from groq import Groq
from groq import GroqError

load_dotenv()

class GROQ_SERVER:
    
    groq_api_key = os.getenv("APP_LLM_KEY")
    
    def __init__(self):
        self.groq = Groq(
            api_key=self.groq_api_key,
        )
    
    async def ask(self, query):
        chat = self.groq.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "you are a knowledgable and experienced fitness coach."
                },
                {
                    "role": "user",
                    "content": query,
                },
            ],
            model="llama-3.3-70b-versatile",
        )
        
        return chat.choices[0].message.content