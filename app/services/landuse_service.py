from app.utils.utils import get_landuse_data,load_bundesland_boundaries,get_landuse_data_by_bundesland
import pandas as pd
import geopandas as gpd

import uuid
from shapely import Polygon, Point, LineString



def normalize_landuse_data(bbox,landuse_type,geometry_type):   
    json_data = get_landuse_data(bbox,landuse_type,geometry_type)
    try:
        df = parse_overpass_json_data(json_data)
    except Exception as e:
        raise RuntimeError(f"Error: {e}")
    return df
            
def normalize_bundesland_landuse(bundesland,landuse_type,geometry_type):             
    bundesland_df = load_bundesland_boundaries()
    bundesland_gdf = gpd.GeoDataFrame(bundesland_df, geometry='geometry', crs='EPSG:4326')
    
    selected = bundesland_gdf[bundesland_gdf['bundesland'].str.lower() == bundesland.lower()]
    if selected.empty:
        raise ValueError(f"{bundesland} not found in boundary data.")
    boundary = selected.geometry.unary_union  
    json_data = get_landuse_data_by_bundesland(bundesland,landuse_type,geometry_type)
    
    try:
        df = parse_overpass_json_data(json_data)
    except Exception as e:
        raise RuntimeError(f"Error: {e}")
    
    gdf = gpd.GeoDataFrame(df, geometry='geometry', crs ='EPSG:4326')
    gdf = gdf.to_crs("EPSG:4326")
    #gdf.to_file("gdf.geojson", driver="GeoJSON")
    #gpd.GeoDataFrame(geometry=[boundary], crs="EPSG:4326").to_file("boundary.geojson", driver="GeoJSON")
    
    boundary_buffered = boundary.buffer(0.0005)  # about 50m
    gdf_clipped = gdf[gdf.within(boundary_buffered)]
    
    # print("gdf bounds:", gdf.total_bounds)
    # print("boundary bounds:", boundary.bounds)
    
    keep_cols = ["id", "osm_id", "name", "landuse_type", "leisure", "city", "area", "geometry"]
    df_cleaned = gdf_clipped[keep_cols] if not gdf_clipped.empty else gdf_clipped

    return df_cleaned
       
    
def parse_overpass_json_data(json_data):   
    data = []
        
    for item in json_data['elements']: 
        tags = item.get("tags")        
        if not tags or "landuse" not in tags:
            continue      
         
       # Geometry of landuse 
        coords = [(pt["lon"],pt["lat"]) for pt in item.get("geometry",[])]
        if not coords:
           continue
        
        if item["type"] == "node":
            geom = Point(coords) if coords else None
        elif item["type"] == "way":
            if coords[0] == coords[-1] and len(coords) >=4:
                geom = Polygon(coords)
            elif coords:
                geom = LineString(coords) 
        elif item["type"] == "relation": 
            if coords and coords[0] == coords[-1] and len(coords) >= 4:
                geom = Polygon(coords)  
            else:
                geom = None
        else:
            geom = None

        area = None
        if geom.geom_type in ["Polygon", "MultiPolygon"]:
            temp_gdf = gpd.GeoDataFrame([{"geometry": geom}], crs="EPSG:4326").to_crs("EPSG:3857")
            area = temp_gdf['geometry'].area.values[0]
                
        data.append({
            "id": str(uuid.uuid1()),
            "osm_id": item.get("id"),
            "name": tags.get("name") or None,
            "landuse_type" : tags["landuse"],
            "leisure": tags.get("leisure") or None,
            "city": tags.get("addr:city") or tags.get("is_in"),
            "area" : area,
            "geometry" : geom
        })
        
        df = pd.DataFrame(data)
        
        if df is None:
            print(f"df in parse json:{df}")
    
    return df