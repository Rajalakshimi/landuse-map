import uuid
import geopandas as gpd
import os
import subprocess

def generate_pmtiles(df, output_dir:str="tmp"):
    
    gdf = gpd.GeoDataFrame(df, geometry='geometry',crs="EPSG:4326")
    os.makedirs(output_dir, exist_ok=True)
    geojson_path = f"{output_dir}/landuse_{uuid.uuid4().hex}.geojson"
    pmtiles_path = geojson_path.replace(".geojson",".pmtiles")
    gdf.to_file(geojson_path, driver="GeoJSON")

    try:
        subprocess.run(
            ["tippecanoe", "-o", pmtiles_path, geojson_path],
            check=True
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError("Tippecanoe failed to generatw PMTiles") from e
    
    if not os.path.exists(pmtiles_path):
        raise RuntimeError("PMTiles file was not created")
    print(f"pmtiles_path:{pmtiles_path}")
    return pmtiles_path