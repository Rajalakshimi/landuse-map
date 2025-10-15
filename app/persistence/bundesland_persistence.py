from app.config.config_db import get_connection

def create_bundesland_table():
    conn = get_connection()
    query = """CREATE TABLE IF NOT EXISTS bundesland(
                id BIGINT AUTOINCREMENT,
                bundesland VARCHAR,
                area DOUBLE PRECISION,
                geometry BLOB
                );"""
    conn.execute(query)
    conn.close()
    
def insert_bundesland_data(df):
    conn = get_connection()
    conn.register("df_view", df)
    query = """INSERT INTO bundesland(bundesland, area, geometry)
               SELECT bundesland, area, geometry FROM df_view;"""
    conn.execute(query)
    conn.unregister("df_view")
    conn.close()
    
def get_bundesland_data(bundesland: str):
    conn = get_connection()
    query = "SELECT * from bundesland WHERE bundesland = ?;"            
    result = conn.execute(query, [bundesland]).df()
    conn.close()
    return result

def delete_bundesland_table():
    conn = get_connection()
    query = "DROP TABLE IF EXISTS bundesland;"
    conn.execute(query)
    conn.close()