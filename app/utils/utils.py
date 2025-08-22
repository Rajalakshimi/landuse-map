import requests
import json
import os
import pandas as  pd
import geopandas as gpd
from shapely import Polygon, MultiPolygon

    
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
            
        rows.append({
            'id':id,
            'bundesland': bundesland,
            'geometry': geom
        })
        df = pd.DataFrame(rows)
    print(df)
    return df
