import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
import urllib.parse

db_user = os.environ.get('MYSQL_USER', 'root')
db_password = urllib.parse.quote_plus(os.environ.get('MYSQL_PASSWORD', ''))
db_host = os.environ.get('MYSQL_HOST', 'localhost')
db_name = os.environ.get('MYSQL_DB', 'stego_db')

uri = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
engine = create_engine(uri)

with engine.connect() as con:
    try:
        con.execute(text("ALTER TABLE embed_history ADD COLUMN original_hash VARCHAR(255)"))
        print("Successfully added original_hash")
    except Exception as e:
        print(f"Error adding original_hash: {e}")
        
    try:
        con.execute(text("ALTER TABLE embed_history ADD COLUMN stego_hash VARCHAR(255)"))
        print("Successfully added stego_hash")
    except Exception as e:
        print(f"Error adding stego_hash: {e}")
        
    con.commit()
