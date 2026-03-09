from app import get_db
from sqlalchemy import text


def run_migrations():
    """
    Run with: python migrate.py
    Creates all new tables needed for email/password auth.
    Uses IF NOT EXISTS / information schema for safe re-runs.
    """
    statements = [
        # Check if users table exists, otherwise create it
        """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
        CREATE TABLE users (
            id            INT IDENTITY(1,1) PRIMARY KEY,
            email         NVARCHAR(255) UNIQUE NOT NULL,
            password_hash NVARCHAR(255) NOT NULL,
            created_at    DATETIME DEFAULT GETDATE(),
            last_login_at DATETIME NULL
        );
        """,
        
        # In case we ran the magic-link migration previously, 
        # let's add password_hash if it doesn't exist
        """
        IF EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U') 
        AND NOT EXISTS (
            SELECT 1 FROM sys.columns 
            WHERE Name = N'password_hash' 
            AND Object_ID = Object_ID(N'users')
        )
        BEGIN
            ALTER TABLE users ADD password_hash NVARCHAR(255) NOT NULL DEFAULT '';
        END
        """,

        # Sessions Table
        """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sessions' AND xtype='U')
        CREATE TABLE sessions (
            id         INT IDENTITY(1,1) PRIMARY KEY,
            user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token      NVARCHAR(100) UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT GETDATE()
        );
        """,

        # Add user_id to product_subscribers if it doesn't exist
        """
        IF NOT EXISTS (
            SELECT 1 FROM sys.columns 
            WHERE Name = N'user_id' 
            AND Object_ID = Object_ID(N'product_subscribers')
        )
        BEGIN
            ALTER TABLE product_subscribers ADD user_id INT NULL REFERENCES users(id) ON DELETE CASCADE;
        END
        """
    ]

    db = next(get_db())
    print("Running database migrations...")
    try:
        for stmt in statements:
            db.execute(text(stmt))
        db.commit()
        print("✅ Migration completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Migration failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations()
