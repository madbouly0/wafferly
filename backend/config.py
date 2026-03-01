import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    # SQL Server connection
    DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS')
    DB_NAME = os.getenv('DB_NAME', 'wafferly')
    DB_DRIVER = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    DB_USERNAME = os.getenv('DB_USERNAME', '')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    @property
    def DATABASE_URL(self):
        if self.DB_USERNAME and self.DB_PASSWORD:
            return (
                f"mssql+pyodbc://{self.DB_USERNAME}:{self.DB_PASSWORD}"
                f"@{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={self.DB_DRIVER.replace(' ', '+')}"
            )
        else:
            return (
                f"mssql+pyodbc://@{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={self.DB_DRIVER.replace(' ', '+')}"
                f"&trusted_connection=yes"
            )

    # Email (Gmail SMTP)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('EMAIL_USER')
    MAIL_PASSWORD = os.getenv('EMAIL_PASS')