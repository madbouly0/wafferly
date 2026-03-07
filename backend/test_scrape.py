import traceback
from app.scraper.amazon import scrape_amazon_product
import pandas as pd 

db = pd.read_csv("amazon.csv")
link=db['product_id'] 
link=link.tolist()
i=0
while i < len(link):
    asin = link[i]
    try:
        print("Testing Amazon extraction...")
        product = scrape_amazon_product(f"https://www.amazon.com/dp/{asin}")
        print("Success: ", product)
    except Exception as e:
        print("Exception!")
        traceback.print_exc()
    i+=1
