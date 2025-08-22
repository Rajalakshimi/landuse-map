Landuse Mapping
------------------------------------------------------------------------------------------------------------
An interactive land use map built from OpenStreetMap (OSM) data.
This web application allows users to filter, visualize, and download land use data by:

* Bundesland (state)

* Landuse type

* Geometry type

* Custom bounding box (BBox)

The filtered data can be exported in multiple formats: GeoJSON, CSV, Shapefile, GeoParquet, and FlatGeobuf.

🚀 Tech Stack
---------------------------------------------------------------------------------------------------------------------------------
Backend: Python, Flask, Docker

Frontend: React.js, Vite, OpenLayers

I chose Flask for the backend since the processing requirements are lightweight and only a few endpoints are needed.
On the frontend, React + OpenLayers provide efficient rendering of geospatial data and also gave me an opportunity to strengthen my frontend skills.

⚡ Optimization & Challenges
-----------------------------------------------------------------------------------------------------------------------------------------------
One of the main motivations was solving a problem I faced as a GIS Data analyst:
When downloading OSM data, I often had to fetch large files (e.g., from Geofabrik) and then filter them manually.

This app makes it possible to download only the required data directly in the desired format.

Challenges & bottlenecks:
------------------------------------------------------------------------------------------------------------------------------------------------
Downloading large bounding boxes (e.g., whole states) from Overpass API is slow.

Possible future solutions:

* Use PBF extracts from Geofabrik instead of Overpass.

* Split large states into smaller bounding boxes before sending data to the frontend.

📝 Takeaways
--------------------------------------------------------------------------------------------------------------------------------------------
Backend development (structuring endpoints, exporting formats) was straightforward.

Frontend had a bigger learning curve, especially with:

* PMTiles integration

* Drawing and managing bounding boxes (state management issues)

I eventually solved these by resetting the map state and cursor handling. I also added better cleanup for interactions and ensured the drawing tools deactivate correctly after applying filters.

🎥 Demo
----------------------------------------------------------------------------------------------------------------------------------------------------------
