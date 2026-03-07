import os
from dotenv import load_dotenv

# Load the .env file so we can use our secret settings
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))


class Config:
    # Which environment are we running in? (development or production)
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    # Database settings - these come from the .env file
    DB_SERVER = os.getenv('DB_SERVER', 'localhost\\SQLEXPRESS')
    DB_NAME = os.getenv('DB_NAME', 'wafferly')
    DB_DRIVER = os.getenv('DB_DRIVER', 'ODBC Driver 17 for SQL Server')
    DB_USERNAME = os.getenv('DB_USERNAME', '')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')

    @property
    def DATABASE_URL(self):
        # If we have a username and password, use them to log in
        if self.DB_USERNAME and self.DB_PASSWORD:
            url = (
                f"mssql+pyodbc://{self.DB_USERNAME}:{self.DB_PASSWORD}"
                f"@{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={self.DB_DRIVER.replace(' ', '+')}"
            )
        else:
            # Otherwise use Windows trusted connection (no password needed)
            url = (
                f"mssql+pyodbc://@{self.DB_SERVER}/{self.DB_NAME}"
                f"?driver={self.DB_DRIVER.replace(' ', '+')}"
                f"&trusted_connection=yes"
            )
        return url

    # Email settings - we use Gmail to send notifications
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('EMAIL_USER')
    MAIL_PASSWORD = os.getenv('EMAIL_PASS')