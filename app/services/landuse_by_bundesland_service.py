from app.utils.utils import load_bundesland_boundaries, choose_grid_size, split_polygon, parse_overpass_json_data
from app.persistence.landuse_persistence import create_landuse_table, add_landuse_data, merge_geoparquet_files,clip_landuse_by_bundesland

import asyncio
import aiohttp
from pathlib import Path
import pandas as pd
import geopandas as gpd
import uuid
import time
from shapely.geometry import Polygon, Point, LineString, box

async def fetch_overpass_api(session, overpass_query, sem):
    url = "https://overpass-api.de/api/interpreter"
    async with sem:
        start = time.time()
        print(f"➡️ Sending request at {start:.2f}: {overpass_query[:50]}...")
        async with session.post(url, data={"data": overpass_query}, timeout=600) as resp:
            if resp.status != 200:
                print(f"Overpass API error {resp.status}")
                return {"elements": []}
            try:
                end = time.time()
                print(f"✅ Response received at {end:.2f}, took {end - start:.2f}s")
                return await resp.json()

            except:
                return {"elements": []}

def build_query(bbox, landuse_type, geometry_type):
    minx, miny, maxx, maxy = bbox.bounds
    bbox_str = f"{miny},{minx},{maxy},{maxx}"
    landuse_filter = f'["landuse"="{landuse_type}"]' if landuse_type != "all" else '["landuse"]'

    if geometry_type == "point":
        return f"""
        [out:json][timeout:60];
        node{landuse_filter}({bbox_str});
        out geom;
        """
    elif geometry_type in ["polygon", "multipolygon"]:
        return f"""
        [out:json][timeout:60];
        (
          way{landuse_filter}({bbox_str});
          relation{landuse_filter}["type"="multipolygon"]({bbox_str});
        );
        out geom; >; out qt;
        """
    else:  # "all"
        return f"""
        [out:json][timeout:60];
        (
          node["landuse"]({bbox_str});
          way["landuse"]({bbox_str});
          relation["landuse"]({bbox_str});
          way["natural"]({bbox_str});
          relation["natural"]({bbox_str});
          way["leisure"]({bbox_str});
          relation["leisure"]({bbox_str});
        );
        out geom; >; out qt;
        """

async def fetch_all_overpass(bundesland, bboxes, landuse_type, geometry_type, max_concurrent=5):
    results = []
    sem = asyncio.Semaphore(max_concurrent)

    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=600)) as session:
        tasks = [fetch_overpass_api(session, build_query(b, landuse_type, geometry_type), sem) for b in bboxes]
        responses = await asyncio.gather(*tasks)
        

        for i, r in enumerate(responses):
            if not r or "elements" not in r:
                continue

            # Parse JSON → DataFrame
            df = parse_overpass_json_data(r)
            if df is None or df.empty:
                continue

            # Convert to GeoDataFrame
            gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")

            # Unique filename per bbox/grid
            file_id = uuid.uuid4().hex[:8]
            filename = f"data/landuse_bundesland_cache/{bundesland}_grid_{i}_{file_id}.geoparquet"

            # Save to GeoParquet
            gdf.to_parquet(filename, index=False)
            print(f"💾 Saved grid {i+1}/{len(bboxes)} → {filename}")

            results.append(filename)

    print(f"Completed {len(results)} GeoParquet files for {bundesland}")
    return results

def get_landuse_data_by_bundesland(bundesland_ip,landuse_type,geometry_type):
    landuse_type = landuse_type.lower()
    geometry_type = str(geometry_type).lower()
    
    bundesland_df = load_bundesland_boundaries()
    bundesland_gdf = gpd.GeoDataFrame(bundesland_df, geometry="geometry", crs="EPSG:4326")
    selected_row = bundesland_gdf[bundesland_gdf['bundesland'].str.lower() == bundesland_ip.lower()]
    
    if selected_row.empty:
        raise ValueError(f"{bundesland_ip} not found")
  
    boundary = selected_row.geometry.unary_union  
    
    grid_size_deg, _ = choose_grid_size(bundesland_ip, landuse_type=landuse_type)
    
    if grid_size_deg is None:  
        bboxes = [box(*boundary.bounds)]
    else:
        bboxes = split_polygon(boundary, grid_size_deg)

    parquet_files = asyncio.run(
        fetch_all_overpass(bundesland_ip, bboxes, landuse_type, geometry_type)
    )

    print(f" {len(parquet_files)} GeoParquet files saved for {bundesland_ip}")

    return parquet_files


def process_geoparquet_files(bundesland_ip,landuse_type,geometry_type):
    landuse_type = landuse_type.lower()
    geometry_type = str(geometry_type).lower()
    
    landuse_data = get_landuse_data_by_bundesland(bundesland_ip, landuse_type, geometry_type)
    
    create_landuse_table()
    add_landuse_data()
    
    parquet_path = Path("data/landuse_bundesland_cache")
    parquet_files = glob.glob(str(parquet_path / "*.geoparquet"))
    merged_data = merge_geoparquet_files(parquet_files)
    
    merged_data = merge_geoparquet_files(parquet_path)
    clipped_df = clip_landuse_by_bundesland(bundesland_ip)
    if clipped_df.empty:
        return None

    # ✅ Convert to GeoDataFrame
    gdf = gpd.GeoDataFrame(clipped_df, geometry="clipped_geom", crs="EPSG:4326")

    # ✅ Save to GeoParquet
    output_dir = Path("data/merged_landuse")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{bundesland_ip.lower()}_merged.geoparquet"

    gdf.to_parquet(output_file, index=False)
    return output_file
    
    