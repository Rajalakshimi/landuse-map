import requests
import json
import os
import pandas as  pd
import geopandas as gpd
from shapely import Polygon, MultiPolygon
import math
from shapely.geometry import box, shape, LineString, Point, Polygon
import uuid

    
def get_landuse_data(bbox, landuse_type, geometry_type):
    landuse_type = landuse_type.lower()
    geometry_type = str(geometry_type).lower()

    # Base filter
    landuse_filter = f'["landuse"="{landuse_type}"]' if landuse_type != "all" else '["landuse"]'

    # Geometry handling
    if geometry_type == "point":
        overpass_query = f"""
        [out:json][timeout:30];
        node{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        out geom;
        """

    elif geometry_type in ["polygon", "multipolygon"]:
        overpass_query = f"""
        [out:json][timeout:30];
        (
        way{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        relation{landuse_filter}["type"="multipolygon"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        );
        out geom; >; out qt;
        """

    elif geometry_type == "all":
        if landuse_type == "all":
            
            overpass_query = f"""
            [out:json][timeout:30];
            (
            node["landuse"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way["landuse"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation["landuse"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way["natural"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation["natural"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way["leisure"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation["leisure"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            );
            out geom; >; out qt;
            """
        else:
            
            overpass_query = f"""
            [out:json][timeout:30];
            (
            node{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            );
            out geom; >; out qt;
            """

    url = "https://overpass-api.de/api/interpreter"
    response = requests.post(url, data={"data": overpass_query}, timeout=600)

    if response.status_code != 200:
        raise Exception(f"Overpass API error: {response.status_code}")

    return response.json()


def get_landuse_data_by_bundesland(bundesland_ip,landuse_type,geometry_type):
    landuse_type = landuse_type.lower()
    geometry_type = str(geometry_type).lower()
    
    bundesland_df = load_bundesland_boundaries()
    bundesland_gdf = gpd.GeoDataFrame(bundesland_df, geometry="geometry", crs="EPSG:4326")
    selected_row = bundesland_gdf[bundesland_gdf['bundesland'].str.lower() == bundesland_ip.lower()]
    
    if selected_row.empty:
        raise ValueError(f"{bundesland_ip} not found")
    boundary = selected_row.geometry.unary_union
    min_x, min_y, max_x, max_y = boundary.bounds
    bbox = [min_y, min_x, max_y, max_x]
    print(f"print bindesand bbox:{bbox}")
    
    
    # Base filter
    landuse_filter = f'["landuse"="{landuse_type}"]' if landuse_type != "all" else '["landuse"]'

    # Geometry handling
    if geometry_type == "point":
        overpass_query = f"""
        [out:json][timeout:30];
        node{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        out geom;
        """

    elif geometry_type in ["polygon", "multipolygon"]:
        overpass_query = f"""
        [out:json][timeout:30];
        (
        way{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        relation{landuse_filter}["type"="multipolygon"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        );
        out geom; >; out qt;
        """

    elif geometry_type == "all":
        if landuse_type == "all":
            
            overpass_query = f"""
            [out:json][timeout:30];
            (
            node["landuse"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way["landuse"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation["landuse"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way["natural"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation["natural"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way["leisure"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation["leisure"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            );
            out geom; >; out qt;
            """
        else:
            
            overpass_query = f"""
            [out:json][timeout:30];
            (
            node{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            way{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            relation{landuse_filter}({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
            );
            out geom; >; out qt;
            """
    
    url = "https://overpass-api.de/api/interpreter"
    response = requests.post(url, data={"data": overpass_query}, timeout=600)

    if response.status_code != 200:
        raise Exception(f"Overpass API error: {response.status_code}")

    return response.json()

def load_bundesland_boundaries():  
    json_file = os.path.join("data","bundesland_boundaries.json")
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    rows = []
    for item in data['features']:
        properties = item.get('properties')
        id = properties['id']
        bundesland = properties['name']
        print(bundesland)
        geometry = item.get('geometry')
        
        coords =  geometry["coordinates"]
        if geometry['type'] == 'Polygon' and coords:
            geom = Polygon(coords[0])
        elif geometry['type'] == 'MultiPolygon':
            geom = MultiPolygon([Polygon(part[0]) for part in coords])
        else:
            continue
        
        area = None
        if geom.geom_type in ["Polygon", "MultiPolygon"]:
            temp_gdf = gpd.GeoDataFrame([{"geometry": geom}], crs="EPSG:4326").to_crs("EPSG:3857")
            area = temp_gdf['geometry'].area.values[0]
            
        rows.append({
            'id':id,
            'bundesland': bundesland,
            'area' : area,
            'geometry': geom
        })
        df = pd.DataFrame(rows)
    print(df)
    return df

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


def choose_grid_size(bundesland, landuse_type ,target_size=15):
    df = load_bundesland_boundaries()
    df = df[df["bundesland"] == bundesland].iloc[0]
    area = df["area"]
    polygon = df ["geometry"]
    print(area)
    
    target_area = (area / 1e6) / target_size
    grid_size_deg = math.sqrt(target_area) / 111
    
    if landuse_type == "all":
        grid_size_deg /= 2 
        
    return round(grid_size_deg, 3), polygon

def split_polygon(polygon, grid_size):
    
    min_x, min_y, max_x, max_y = polygon.bounds
    bboxes = []

    x = min_x
    while x < max_x:
        y = min_y
        while y < max_y:
            bbox = box(x, y, min(x+grid_size, max_x), min(y+grid_size, max_y))
            bboxes.append(bbox)
            y += grid_size
        x += grid_size

    return bboxes