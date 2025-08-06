import React from "react";

const Sidebar = ({ onDrawBBox, onDownload, onApplyFilter }) => {
  return (
    <div className="w-64 bg-white p-4 shadow-md h-screen flex flex-col">
      <div className="mt-64 space-y-4 flex-grow overflow-y-auto">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Bundesland</label>
          <select className="w-full border rounded px-3 py-2 text-base">
            <option value="">Select</option>
            <option value="All">All</option>
            <option value="Berlin">Berlin</option>
            <option value="Brandenburg">Brandenburg</option>
            <option value="Bremen">Bremen</option>
            <option value="Bayern">Bayern</option>
            <option value="Baden-Württemberg">Baden-Württemberg</option>
            <option value="Hamburg">Hamburg</option>
            <option value="Hessen">Hessen</option>
            <option value="Niedersachsen">Niedersachsen</option>
            <option value="NordRheine-Westphalia">NordRheine-Westphalia</option>
            <option value="Rheinland-Pfalz">Rheinland-Pfalz</option>
            <option value="Saarland">Saarland</option>
            <option value="Sachsen">Sachsen</option>
            <option value="Sachsen-Anhalt">Sachsen-Anhalt</option>
            <option value="Schleswig-Holstein">Schleswig-Holstein</option>
            <option value="Thüringen">Thüringen</option>
            <option value="Mecklenburg-Vorpommern">Mecklenburg-Vorpommern</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Landuse Type</label>
          <select className="w-full border rounded px-2 py-1 text-sm">
            <option value="">Select</option>
            <option value="residential">Residential</option>
            <option value="farmland">Farmland</option>
            <option value="forest">Forest</option>
            <option value="allotments">Allotments</option>
            <option value="flowerbed">Flowerbed</option>
            <option value="greenhouse_horticulture">Greenhouse Horticulture</option>
            <option value="orchard">Orchard</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">Download</label>
          <select className="w-full border rounded px-2 py-1 text-sm">
            <option value="">Select</option>
            <option value="geojson">GeoJSON</option>
            <option value="csv">CSV</option>
            <option value="shp">Shapefiles</option>
            <option value="geoparquet">GeoParquet</option>
            <option value="flatgeobuf">FlatGeoBuf</option>
          </select>
        </div>

        <div className="space-y-2">
          <button onClick={onDrawBBox} className="w-full bg-gray-100 hover:bg-gray-200 rounded px-3 py-2 font-semibold text-sm">Draw BBox</button>
          <button onClick={onDownload} className="w-full bg-gray-100 hover:bg-gray-200 rounded px-3 py-2 font-semibold text-sm">Download</button>
          <button onClick={onApplyFilter} className="w-full bg-blue-100 hover:bg-blue-200 rounded px-3 py-2 font-semibold text-sm">Apply Filter</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
