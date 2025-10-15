import React from "react";
import { Listbox } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

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
    <div className="flex flex-col h-full p-4">
      <aside className="aside-spacing">
        <h2 className="w-[7.875rem] h-[1.5625rem] text-[#c3c372] font-[istok text-[2rem] font-bold leading-[normal]">Filters</h2>
      </aside>
      {/* Bundesland */}
      
        <div className="w-[16rem] mb-4">
          <aside className="aside-spacing">
            <label className="w-[13.375rem] h-[0.5625rem] text-[#c3c372] font-['Inter'] font-bold leading-[normal]">Bundesland</label>
          </aside>
          <Listbox value={bundesland} onChange={onBundeslandChange}>
            <div className="relative">
              <Listbox.Button className="custom-dropdown flex items-center justify-between">
                <span>{bundesland || "Select"}</span>
                <FaChevronDown className="ml-2 text-white text-sm" />
              </Listbox.Button>
              <Listbox.Options as={React.Fragment}>
                <div className="custom-dropdown-list">
                  {bundeslandOptions.map((state) => (
                    <Listbox.Option
                      key={state}
                      value={state}
                      className={({ active }) =>
                        `custom-dropdown-option ${
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
          <aside className="aside-spacing">
            <label className="w-[13.375rem] h-[0.5625rem] text-[#c3c372] font-['Inter'] font-bold leading-[normal]">Landuse Type</label> 
          </aside>
          <Listbox value={landuseType} onChange={onLanduseTypeChange}>
            <div className="relative">
              <Listbox.Button className="custom-dropdown flex items-center justify-between">
                <span>{landuseType || "Select"}</span>
                <FaChevronDown className="ml-2 text-white text-sm" />
              </Listbox.Button>
              <Listbox.Options as={React.Fragment}>
                <div className="custom-dropdown-list">
                  {landuseOptions.map((lu) => (
                    <Listbox.Option
                      key={lu}
                      value={lu}
                      className={({ active }) =>
                        `custom-dropdown-option ${
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
          <aside className="aside-spacing">
            <label className="w-[13.375rem] h-[0.5625rem] text-[#c3c372] font-['Inter'] font-bold leading-[normal]">Geometry Type</label>
          </aside>
          <Listbox value={geometryType} onChange={onGeometryTypeChange}>
            <div className="relative">
              <Listbox.Button className="custom-dropdown flex items-center justify-between">
                <span>{geometryType || "Select"}</span>
                <FaChevronDown className="ml-2 text-white text-sm" />
              </Listbox.Button>
              <Listbox.Options as={React.Fragment}>
                <div className="custom-dropdown-list">
                  {geometryOptions.map((gt) => (
                    <Listbox.Option
                      key={gt}
                      value={gt}
                      className={({ active }) =>
                        `custom-dropdown-option ${
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
          <aside className="aside-spacing">
            <label className="w-[13.375rem] h-[0.5625rem] text-[#c3c372] font-['Inter'] font-bold leading-[normal]">Format</label>
          </aside>
          <Listbox value={format} onChange={onFormatChange}>
            <div className="relative">
              <Listbox.Button className="custom-dropdown flex items-center justify-between">
                <span>{format || "Select"}</span>
                <FaChevronDown className="ml-2 text-white text-sm" />
              </Listbox.Button>
              <Listbox.Options as={React.Fragment}>
                <div className="custom-dropdown-list">
                  {formatOptions.map((fmt) => (
                    <Listbox.Option
                      key={fmt}
                      value={fmt}
                      className={({ active }) =>
                        `custom-dropdown-option ${
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
      <div className="mt-auto pb-8 space-y-2">
        <div className="mt-auto pb-8 space-y-2">
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

        <div className="mt-auto pb-8 space-y-2">
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
