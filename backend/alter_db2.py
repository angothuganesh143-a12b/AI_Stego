import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

db_user = os.environ.get('MYSQL_USER', 'root')
db_password = os.environ.get('MYSQL_PASSWORD', '')
db_host = os.environ.get('MYSQL_HOST', 'localhost')
db_name = os.environ.get('MYSQL_DB', 'stego_db')

con = pymysql.connect(host=db_host, user=db_user, password=db_password, database=db_name)
cursor = con.cursor()

try:
    cursor.execute("ALTER TABLE embed_history ADD COLUMN original_hash VARCHAR(255)")
    print("Added original_hash")
except Exception as e:
    print("original_hash error:", e)

try:
    cursor.execute("ALTER TABLE embed_history ADD COLUMN stego_hash VARCHAR(255)")
    print("Added stego_hash")
except Exception as e:
    print("stego_hash error:", e)

con.commit()
con.close()
