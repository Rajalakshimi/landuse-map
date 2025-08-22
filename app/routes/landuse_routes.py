from flask import send_file, request, jsonify, Response
from flask_restx import Namespace, Resource
from app.services.landuse_service import normalize_landuse_data, normalize_bundesland_landuse
from app.services.file_export_service import export_formats
from app.services.tiles_export_service import generate_pmtiles
import geopandas as gpd
import os
from pathlib import Path
APP_DIR = Path(__file__).resolve().parents[1]
STATIC_DIR = APP_DIR / "static" / "tiles"

landuse_ns = Namespace("landuse", description="Landuse Queries")
        
@landuse_ns.route("/filter")
class LanduseFilter(Resource):
    def get(self):
        landuse_type = request.args.get("landuse_type")
        geometry_type = request.args.get("geometry")
        bbox_str = request.args.get("bbox")
        bundesland = request.args.get("bundesland")

        if bbox_str:
            try:
                bbox = tuple(map(float, bbox_str.split(",")))
            except ValueError:
                return {"error": "Invalid bbox format"}, 400
            df = normalize_landuse_data(bbox, landuse_type, geometry_type)
        elif bundesland:
            from app.services.landuse_service import normalize_bundesland_landuse
            df = normalize_bundesland_landuse(bundesland, landuse_type, geometry_type)
        else:
            return {"error": "Missing bbox or bundesland"}, 400

        if df.empty:
            return {"message": "No landuse features found for the selected options"}, 400

        # Generate PMTiles
        pmtiles_path = generate_pmtiles(df)
        pmtiles_url = f"/static/tiles/{Path(pmtiles_path).name}"

        return {"pmtiles_url": pmtiles_url}

@landuse_ns.route("/download")
class LanduseDownload(Resource):
    def get(self):
        landuse_type = request.args.get("landuse_type", "all")
        geometry_type = request.args.get("geometry_type", "")
        format = request.args.get("format", "").lower()
        bbox_str = request.args.get("bbox")
        bundesland = request.args.get("bundesland")

        if bbox_str:
            bbox = tuple(map(float, bbox_str.split(",")))
            df = normalize_landuse_data(bbox, landuse_type,geometry_type)
        elif bundesland:
            df = normalize_bundesland_landuse(bundesland, landuse_type,geometry_type)
        else:
            return {"error": "Missing bbox or bundesland"}, 400

        if df.empty:
            return {"message": "No landuse features found for the selected options"}, 400

        return export_formats(df, format)         

