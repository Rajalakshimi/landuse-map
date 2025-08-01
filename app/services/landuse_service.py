from app.utils.utils import get_landuse_data,load_bundesland_boundaries
import pandas as pd
import geopandas as gpd

import uuid
from shapely import Polygon, LineString


def normalize_landuse_data(bbox,landuse_type):
    
    json_data = get_landuse_data(bbox,landuse_type)
    col = ['id','osm_id','name','landuse_type','leisure','city','area','geometry']    
    df = pd.DataFrame(columns=col)
        
    for item in json_data['elements']: 
        tags = item.get("tags")        
        if not tags or "landuse" not in tags:
            continue      
         
       # Geometry of landuse 
        coords = [(pt["lon"],pt["lat"]) for pt in item.get("geometry",[])]
        if not coords:
           continue
        
        if coords[0] == coords[-1] and len(coords) >=4:
            geom = Polygon(coords)
        else:
            geom = LineString(coords)
       
        gdf = gpd.GeoDataFrame([{"geometry": geom}], crs="EPSG:4326")
        gdf = gdf.to_crs("EPSG:3857")
        area = gdf['geometry'].area.values[0]
                
        data = {
            "id": str(uuid.uuid1()),
            "osm_id": item.get("id"),
            "name": tags.get("name") or None,
            "landuse_type" : tags["landuse"],
            "leisure": tags.get("leisure") or None,
            "city": tags.get("addr:city") or tags.get("is_in"),
            "area" : area,
            "geometry" : geom
        }
        
        df = pd.concat([df, pd.DataFrame([data])], ignore_index=True)
        
    return df
            
                
       
    
        