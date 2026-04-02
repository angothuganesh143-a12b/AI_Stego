import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

db_user = os.environ.get('MYSQL_USER', 'root')
db_password = urllib.parse.quote_plus(os.environ.get('MYSQL_PASSWORD', ''))
db_host = os.environ.get('MYSQL_HOST', 'localhost')
db_name = os.environ.get('MYSQL_DB', 'stego_db')

uri = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
engine = create_engine(uri)

with engine.connect() as con:
    try:
        con.execute(text("DROP TABLE embed_history"))
        print("Dropped embed_history!")
    except Exception as e:
        print(f"Error dropping table: {e}")
    con.commit()
