import sys
from sqlalchemy import text
from app import engine
from app.models.product import Base
# Import the new Collection model so it's registered with Base.metadata
from app.models.collection import Collection

def migrate():
    with engine.begin() as conn:
        print("Creating new tables (like collections if it doesn't exist)...")
        Base.metadata.create_all(engine)
        
        print("Checking if collection_id column exists on products table...")
        # A quick way to check if column exists in SQL Server
        check_col = conn.execute(text("""
            SELECT count(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'collection_id'
        """)).scalar()
        
        if check_col == 0:
            print("Adding collection_id column to products table...")
            conn.execute(text("ALTER TABLE products ADD collection_id INT NULL;"))
            
            print("Adding foreign key constraint...")
            conn.execute(text("""
                ALTER TABLE products 
                ADD CONSTRAINT FK_products_collections 
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;
            """))
            print("Schema updated successfully.")
        else:
            print("collection_id already exists on products table.")

if __name__ == '__main__':
    migrate()
    print("Migration complete!")
