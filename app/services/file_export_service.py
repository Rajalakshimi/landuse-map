import geopandas as gpd
import io, os, tempfile, zipfile
from flask import Response

def export_formats(df, format: str):
    # 🔑 Ensure df is a GeoDataFrame with CRS set
    if not isinstance(df, gpd.GeoDataFrame):
        if "geometry" not in df.columns:
            return {"error": "No geometry column found"}, 400
        df = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")

    # --- GEOJSON ---
    if format == "geojson":
        buffer = io.BytesIO()
        df.to_file(buffer, driver="GeoJSON")
        return Response(
            buffer.getvalue(),
            mimetype="application/geo+json",
            headers={"Content-Disposition": "attachment; filename=landuse.geojson"}
        )

    # --- SHAPEFILE ---
    elif format in ("shapefile", "shp"):
        with tempfile.TemporaryDirectory() as tmpdir:
            shapefile_path = os.path.join(tmpdir, "landuse.shp")
            df.to_file(shapefile_path)   # ✅ GeoDataFrame
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w") as zipf:
                for fname in os.listdir(tmpdir):
                    fpath = os.path.join(tmpdir, fname)
                    zipf.write(fpath, arcname=fname)
            zip_buffer.seek(0)
            return Response(
                zip_buffer,
                mimetype="application/zip",
                headers={"Content-Disposition": "attachment; filename=landuse_shapefile.zip"}
            )

    # --- PARQUET / GEOPARQUET ---
    elif format in ("parquet", "geoparquet"):
        buffer = io.BytesIO()
        df.to_parquet(buffer, engine="pyarrow")
        buffer.seek(0)
        return Response(
            buffer,
            mimetype="application/x-parquet",
            headers={"Content-Disposition": "attachment; filename=landuse.parquet"}
        )

    # --- FLATGEOBUF ---
    elif format in ("fgb", "flatgeobuf"):
        buffer = io.BytesIO()
        df.to_file(buffer, driver="FlatGeobuf")  # ✅ requires GDAL >= 3.1
        buffer.seek(0)
        return Response(
            buffer,
            mimetype="application/octet-stream",
            headers={"Content-Disposition": "attachment; filename=landuse.fgb"}
        )

    # --- CSV ---
    elif format == "csv":
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        return Response(
            buffer.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=landuse.csv"}
        )

    else:
        return {"error": f"Unsupported format {format}"}, 400
