from pathlib import Path
import duckdb

DB_PATH = Path("app/data/landuse.duckdb")

def get_connection():
    conn = duckdb.connect(str(DB_PATH))
    conn.install_extension("spatial")
    conn.load_extension("spatial") 
    return conn