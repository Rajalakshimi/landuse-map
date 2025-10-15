from app.config.config_db import get_connection

def create_landuse_table():
    conn = get_connection()
    query = """DROP TABLE IF EXISTS landuse_by_h3;
               CREATE TABLE landuse_by_h3(
                id VARCHAR, 
                osm_id VARCHAR,
                name VARCHAR,
                landuse_type VARCHAR,
                leisure VARCHAR,
                city VARCHAR,
                area VARCHAR,
                geometry BLOB,              
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"""
    conn.execute(query)
    conn.close()

def add_landuse_data(parquet_path: str):
    conn = get_connection()
    query = f"""
        INSERT INTO landuse_by_h3 (id, osm_id, name, landuse_type, leisure, city, area, geometry)
        SELECT id, osm_id, name, landuse_type, leisure, city, area, geometry
        FROM read_parquet('{parquet_path}');
    """
    conn.execute(query)
    conn.close()
    
def merge_geoparquet_files():
    conn = get_connection()
    query = """SELECT h3_index, ST_Union_Agg(geometry) AS merged_geom
                FROM landuse_by_h3
                GROUP BY h3_index;
            """
    result = conn.execute(query).df()
    conn.close()
    return result

def clip_landuse_by_bundesland(bundesland):
    conn = get_connection()
    query =  """SELECT ST_Intersection(l.geometry, b.geometry) AS clipped_geom,l.landuse_type
                FROM landuse_by_h3 l
                JOIN bundesland b
                WHERE b.bundesland = ?
                AND ST_Intersects(l.geometry, b.geometry);
            """
    result = conn.execute(query,[bundesland]).df()
    conn.close()
    return result

def get_all_data():
    conn = get_connection()
    query = "SELECT * from landuse_by_h3;"            
    result = conn.execute(query).df()
    conn.close()
    return result 

def delete_all_files():
    conn = get_connection()
    query = "DROP TABLE IF EXISTS landuse_by_h3;"            
    result = conn.execute(query).df()
    conn.close()
    return result 
    

