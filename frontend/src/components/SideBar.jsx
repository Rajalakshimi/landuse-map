import React from "react";
import { Listbox } from "@headlessui/react";

// Options for dropdowns
const bundeslandOptions = [
  "All", "Berlin", "Brandenburg", "Bremen", "Bayern", "Baden-Württemberg",
  "Hamburg", "Hessen", "Niedersachsen", "NordRheine-Westphalia",
  "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt",
  "Schleswig-Holstein", "Thüringen", "Mecklenburg-Vorpommern"
];

const landuseOptions = [
  "All","Residential", "Farmland", "Forest", "Allotments", "Flowerbed",
  "Greenhouse-Horticulture", "Orchard", "Commercial", "Industrial"
];

const geometryOptions = ["All","Point", "Polygon", "MultiPolygon"];

const formatOptions = ["GeoJSON", "CSV", "SHP", "GeoParquet", "FlatGeobuf"];

const Sidebar = ({
  bundesland,
  onBundeslandChange,
  landuseType,
  onLanduseTypeChange,
  geometryType,
  onGeometryTypeChange,
  format,
  onFormatChange,
  onDrawBBox,
  onClearBBox,
  onDownload,
  onApplyFilter,
}) => {
  return (
    <div className="w-80 bg-gray-50 px-8 py-8 shadow-xl h-screen flex flex-col rounded-r-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Filters</h2>

      {/* Bundesland */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-800 mb-1">Bundesland</label>
        <Listbox value={bundesland} onChange={onBundeslandChange}>
          <div className="relative">
            <Listbox.Button className="w-full border border-gray-300 rounded-md bg-white py-2 px-3 text-left shadow-sm cursor-pointer hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {bundesland || "Select"}
            </Listbox.Button>
            <Listbox.Options as={React.Fragment}>
              <div className="absolute left-0 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white border border-gray-300 shadow-lg z-50">
                {bundeslandOptions.map((state) => (
                  <Listbox.Option
                    key={state}
                    value={state}
                    className={({ active }) =>
                      `cursor-pointer select-none py-2 px-3 ${
                        active ? "bg-cyan-100 text-cyan-900" : "text-gray-800"
                      }`
                    }
                  >
                    {state}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Landuse Type */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-800 mb-1">Landuse Type</label>
        <Listbox value={landuseType} onChange={onLanduseTypeChange}>
          <div className="relative">
            <Listbox.Button className="w-full border border-gray-300 rounded-md bg-white py-2 px-3 text-left shadow-sm cursor-pointer hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {landuseType || "Select"}
            </Listbox.Button>
            <Listbox.Options as={React.Fragment}>
              <div className="absolute left-0 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white border border-gray-300 shadow-lg z-50">
                {landuseOptions.map((lu) => (
                  <Listbox.Option
                    key={lu}
                    value={lu}
                    className={({ active }) =>
                      `cursor-pointer select-none py-2 px-3 ${
                        active ? "bg-cyan-100 text-cyan-900" : "text-gray-800"
                      }`
                    }
                  >
                    {lu}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Geometry Type */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-800 mb-1">Geometry Type</label>
        <Listbox value={geometryType} onChange={onGeometryTypeChange}>
          <div className="relative">
            <Listbox.Button className="w-full border border-gray-300 rounded-md bg-white py-2 px-3 text-left shadow-sm cursor-pointer hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {geometryType || "Select"}
            </Listbox.Button>
            <Listbox.Options as={React.Fragment}>
              <div className="absolute left-0 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white border border-gray-300 shadow-lg z-50">
                {geometryOptions.map((gt) => (
                  <Listbox.Option
                    key={gt}
                    value={gt}
                    className={({ active }) =>
                      `cursor-pointer select-none py-2 px-3 ${
                        active ? "bg-cyan-100 text-cyan-900" : "text-gray-800"
                      }`
                    }
                  >
                    {gt}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Download Format */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-800 mb-1">Format</label>
        <Listbox value={format} onChange={onFormatChange}>
          <div className="relative">
            <Listbox.Button className="w-full border border-gray-300 rounded-md bg-white py-2 px-3 text-left shadow-sm cursor-pointer hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500">
              {format || "Select"}
            </Listbox.Button>
            <Listbox.Options as={React.Fragment}>
              <div className="absolute left-0 mt-1 max-h-60 w-full overflow-y-auto rounded-md bg-white border border-gray-300 shadow-lg z-50">
                {formatOptions.map((fmt) => (
                  <Listbox.Option
                    key={fmt}
                    value={fmt}
                    className={({ active }) =>
                      `cursor-pointer select-none py-2 px-3 ${
                        active ? "bg-cyan-100 text-cyan-900" : "text-gray-800"
                      }`
                    }
                  >
                    {fmt}
                  </Listbox.Option>
                ))}
              </div>
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={onDrawBBox}
            className="flex-1 bg-gray-200 hover:bg-gray-300 rounded px-3 py-2 font-semibold text-sm whitespace-nowrap"
          >
            Draw BBox
          </button>
          <button
            onClick={onClearBBox}
            className="flex-1 bg-gray-200 hover:bg-gray-300 rounded px-3 py-2 font-semibold text-sm whitespace-nowrap"
          >
            Clear BBox
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onApplyFilter}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-2 font-semibold text-sm whitespace-nowrap"
          >
            Apply Filter
          </button>
          <button
            onClick={onDownload}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded px-3 py-2 font-semibold text-sm whitespace-nowrap"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
