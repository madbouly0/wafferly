import sys
from app import engine
from sqlalchemy import text

with open('out.txt', 'w') as f:
    sys.stdout = f
    with engine.connect() as conn:
        print("=== SCHEMA product_subscribers ===")
        res = conn.execute(text("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'product_subscribers'"))
        for row in res:
            print(row)
            
        print("\n=== PRICE HISTORY (Top 10) ===")
        res = conn.execute(text("SELECT * FROM price_history ORDER BY recorded_at DESC"))
        for row in res.fetchmany(10):
            print(row)
