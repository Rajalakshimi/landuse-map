from pathlib import Path
import geopandas as gpd
import uuid
import os
import subprocess

from pathlib import Path

# Resolve /app/app as base (since __file__ is inside /app/app/services)
APP_DIR = Path(__file__).resolve().parents[1]   # /app/app
STATIC_DIR = APP_DIR / "static" / "tiles"

def generate_pmtiles(df, output_dir: Path = STATIC_DIR):
    output_dir.mkdir(parents=True, exist_ok=True)

    stem = f"landuse_{uuid.uuid4().hex}"
    geojson_path = output_dir / f"{stem}.geojson"
    pmtiles_path = output_dir / f"{stem}.pmtiles"

    gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")
    gdf.to_file(geojson_path, driver="GeoJSON")

    try:
        proc = subprocess.run(
            [
                "tippecanoe",
                "-o", str(pmtiles_path),
                str(geojson_path),
                "--force",
                "--minimum-zoom=5",          # overview
                "--maximum-zoom=14",         # detailed
                "--drop-densest-as-needed",  # thin very dense data
                "--coalesce-densest-as-needed"
            ],
            capture_output=True,
            text=True
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Tippecanoe failed:\n{proc.stderr}")

        with open(pmtiles_path, "rb") as f:
            if f.read(4) != b"PMTi":
                raise RuntimeError(f"{pmtiles_path} is not valid PMTiles")
    finally:
        if geojson_path.exists():
            geojson_path.unlink()

    return str(pmtiles_path)
