from flask import send_file, request, jsonify, Response
from flask_restx import Namespace, Resource
from app.services.landuse_service import normalize_landuse_data, normalize_bundesland_landuse
from app.services.file_export_service import export_formats
from app.services.tiles_export_service import generate_pmtiles
import geopandas as gpd
import os


landuse_ns = Namespace("landuse", description="Landuse Queries")

@landuse_ns.doc(params={
    'bundesland': 'Name of the German state (e.g. Bayern)',
    'landuse_type': 'Landuse category (e.g. forest, residential)',
    'format': 'Export format (geojson, csv, shapefile, etc.)'
})


@landuse_ns.route("/tiles/<filename>")
class ServeTiles(Resource):
    def get(self, filename):
        path = os.path.join("tmp", filename)
        return send_file(path, mimetype="application/vnd.mapbox-vector-tile")

@landuse_ns.route("/all")
class LanduseAll(Resource):
    def get(self):
        format = request.args.get("format","geojson").lower()
        bbox_str = request.args.get("bbox","52.515,13.375,52.525,13.385") #temp values
        if not bbox_str:
            return {"error": "Missing bbox"}, 400
        try:
            bbox = tuple(map(float,bbox_str.split(",")))
            if len(bbox) != 4:
                raise ValueError
        except ValueError:
            return {"error":"Invalid bbox format"}, 400
        
        try:
            df = normalize_landuse_data(bbox,landuse_type="all")
            print(df)
            if df.empty:
                return {"error": "No data found"}
            
            # pmtiles_path = generate_pmtiles(df)
            # filename = os.path.basename(pmtiles_path)
            
            result = export_formats(df, format)
            
            if format == "geojson":
                return {
                    "data": result,  # this is a JSON-serializable dict
                    #"pmtiles_url": f"/landuse/tiles/{filename}"
                }

            return result

        except Exception as e:
            return {"error":str(e)}, 500
    
@landuse_ns.route("/<string:landuse_type>")
class LanduseByType(Resource):
    def get(self,landuse_type):
        format = request.args.get("format","geojson").lower()
        bbox_str = request.args.get("bbox","52.515,13.375,52.525,13.385") #temp values
        if not bbox_str:
            return {"error": "Missing bbox"}, 400
        try:
            bbox = tuple(map(float,bbox_str.split(",")))
            if len(bbox) != 4:
                raise ValueError
        except ValueError:
            return {"error":"Invalid bbox format"}, 400
        try:
            df = normalize_landuse_data(bbox,landuse_type)
            if df.empty:
                return {"error": "No data found"}
            # pmtiles_path = generate_pmtiles(df)
            # filename = os.path.basename(pmtiles_path)
            
            result = export_formats(df, format)
            
            if format == "geojson":
                return {
                    "data": result,  # this is a JSON-serializable dict
                    #"pmtiles_url": f"/landuse/tiles/{filename}"
                }

            return result
        except Exception as e:
            return {"error":str(e)}, 500

@landuse_ns.route("/<string:bundesland>/<string:landuse_type>")
class LanduseByBundesland(Resource):
    def get(self, bundesland, landuse_type):
        format = request.args.get("format","geojson").lower()
        
        # valid_formats = {"geojson", "csv", "shapefile", "parquet"}
        # if format not in valid_formats:
        #     return {"error": f"Unsupported format '{format}'"}, 400

        if not bundesland or not landuse_type:
            return {"error": "Missing Bundesland Name"}, 400
        
        try:
            df = normalize_bundesland_landuse(bundesland,landuse_type)
            print(df)
            if df.empty:
                return {"error": "No data found"}
            # pmtiles_path = generate_pmtiles(df)
            # filename = os.path.basename(pmtiles_path)
            result = export_formats(df, format)
            
            if format == "geojson":
                return {
                    "data": result,  # this is a JSON-serializable dict
                    #"pmtiles_url": f"/landuse/tiles/{filename}"
                }

            return result

        except Exception as e:
            return {"error": str(e)}, 500 
    