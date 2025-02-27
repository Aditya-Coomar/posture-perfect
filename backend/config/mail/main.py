from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
import os

load_dotenv()

class MAIL_SERVER:
    
    conf = ConnectionConfig(
        MAIL_USERNAME=os.getenv("MAIL_USER"),
        MAIL_PASSWORD=os.getenv("MAIL_SECRET"),
        MAIL_FROM=os.getenv("MAIL_USER"),
        MAIL_PORT=os.getenv("MAIL_PORT"),
        MAIL_SERVER=os.getenv("MAIL_HOST"),
        MAIL_FROM_NAME="Techflow Industry Pvt. Ltd.",
        MAIL_STARTTLS = True,
        MAIL_SSL_TLS = False,
        USE_CREDENTIALS = True,
        VALIDATE_CERTS = True
    )
    
    async def send_mail(self, mail_recepient, mail_subject, mail_body):
        try :
            message = MessageSchema(
                subject=mail_subject,
                recipients=[mail_recepient],
                body=mail_body,
                subtype=MessageType.html
            )
            fm = FastMail(self.conf)
            await fm.send_message(message)
            return True
        except Exception as e:
            raise e