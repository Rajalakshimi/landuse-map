import requests
import json
import os


def get_landuse_data(bbox,landuse_type):  
    landuse_type = landuse_type.lower()
    
    if landuse_type == "all": 
        overpass_query = f"""[out:json][timeout:30];(
                        way["landuse"](if:is_closed())({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
                        relation["landuse"]["type"="multipolygon"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
                        );out geom;>;out qt;"""
    else:
        overpass_query = f"""[out:json][timeout:30];(
                        way["landuse"](if:is_closed())({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
                        relation["landuse"="{landuse_type}"]["type"="multipolygon"]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
                        );out geom;>;out qt;"""
        
    
    url = "https://overpass-api.de/api/interpreter"
    response = requests.post(url, data={"data":overpass_query})
    
    if response.status_code != 200:
        raise Exception(f"Overpass API error:{response.status_code}")
      
    return response.json()
    

def load_bundesland_boundaries():  
    json_file = os.path.join("data","bundesland_boundaries.json")
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        print(data)
    
    return data