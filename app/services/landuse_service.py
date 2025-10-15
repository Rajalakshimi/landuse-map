from app.utils.utils import get_landuse_data,load_bundesland_boundaries
from app.services.landuse_by_bundesland_service import get_landuse_data_by_bundesland
import pandas as pd
import geopandas as gpd

import uuid
from shapely import Polygon, Point, LineString



def normalize_landuse_data(bbox,landuse_type,geometry_type):   
    json_data = get_landuse_data(bbox,landuse_type,geometry_type)
    try:
        df = parse_overpass_json_data(json_data)
        if df.empty:
            return (f"No data is returned for {landuse_type}")
        return df
    except Exception as e:
        raise RuntimeError(f"Error: {e}")
    
            
def normalize_bundesland_landuse(bundesland,landuse_type,geometry_type):             
    bundesland_df = load_bundesland_boundaries()
    bundesland_gdf = gpd.GeoDataFrame(bundesland_df, geometry='geometry', crs='EPSG:4326')
    
    selected = bundesland_gdf[bundesland_gdf['bundesland'].str.lower() == bundesland.lower()]
    if selected.empty:
        raise ValueError(f"{bundesland} not found in boundary data.")
    json_data = get_landuse_data_by_bundesland(bundesland,landuse_type,geometry_type)
    
    try:
        df = parse_overpass_json_data(json_data)
        print(f"size of the prse data:{df.shape}")
        if df.empty:
            return (f"No data is returned for {landuse_type}")
        return df
    except Exception as e:
        raise RuntimeError(f"Error: {e}")
    
       
    
def parse_overpass_json_data(json_data):   
    data = []
    
    elements = []
    if isinstance(json_data, dict) and "elements" in json_data:
        elements = json_data["elements"]
    elif isinstance(json_data, list):
        elements = json_data
    else:
        return pd.DataFrame()
        
    for item in elements: 
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