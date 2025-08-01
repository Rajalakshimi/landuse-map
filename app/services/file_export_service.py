from flask import Response,jsonify,send_file
import pandas as pd
import geopandas as gpd
import io
import zipfile
import tempfile
import os
from app.services.tiles_export_service import generate_pmtiles


def export_formats(df, format):
    format = format.lower()
    
    if format == "csv":
        csv_data = df.drop(columns="geometry", errors="ignore").to_csv(index=False)
        return Response(csv_data,
                mimetype="text/csv",
                headers={"Content-Disposition": "attachment; filename=landuse.csv"})
    elif format == "geojson":
        gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")
        return gdf.__geo_interface__
    elif format == "geoparquet":
        buffer = io.BytesIO()
        df.to_parquet(buffer, index=False)
        buffer.seek(0)
        return Response(
            buffer,
            mimetype="application/octet-stream",
            headers={"Content-Disposition": "attachment; filename=landuse.parquet"}
        )
    elif format == "flatgeobuf":
        buffer = io.BytesIO()
        df.to_file(buffer, driver="FlatGeobuf")
        buffer.seek(0)
        return Response(
            buffer,
            mimetype="application/octet-stream",
            headers={"Content-Disposition": "attachment; filename=landuse.fgb"}
        )

    elif format == "shapefiles":
        with tempfile.TemporaryDirectory() as tmpdir:
            shapefile_path = os.path.join(tmpdir, "landuse.shp")
            df.to_file(shapefile_path)
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer,"w") as zipf:
                for fname in os.listdir(tmpdir):
                    fpath = os.path.join(tmpdir, fname)
                    zipf.write(fpath, arcname=fname)
            zip_buffer.seek(0)
            return Response(
                zip_buffer,
                mimetype="application/zip",
                headers={"Content-Disposition": "attachment; filename=landuse_shapefile.zip"}
            )
 
    else:
        return {"error":f"Unsupported format:{format}"}, 400
        
    return df