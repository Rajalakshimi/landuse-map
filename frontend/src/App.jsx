import { useState, useCallback, useRef } from "react";
import LanduseMap from "./components/LanduseMap";
import Sidebar from "./components/SideBar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // filters
  const [bbox, setBbox] = useState(null);
  const [bundesland, setBundesland] = useState("");
  const [landuseType, setLandUseType] = useState("");
  const [geometryType, setGeometryType] = useState("");
  const [format, setFormat] = useState("");

  // overlay
  const [geojsonData, setGeojsonData] = useState(null);

  // draw trigger → use timestamp
  const [drawTrigger, setDrawTrigger] = useState(0);

  // map reference
  const mapRef = useRef(null);

  // notification banner
  const [notification, setNotification] = useState(null);

  const handleRequestDrawBBox = useCallback(() => {
    setDrawTrigger(Date.now()); 
  }, []);

  // Base URL for filter 
  const buildFilterUrl = useCallback(() => {
    if (bbox && landuseType && geometryType) {
      return `http://127.0.0.1:5000/landuse/filter?bbox=${bbox.join(
        ","
      )}&landuse_type=${encodeURIComponent(
        landuseType
      )}&geometry=${encodeURIComponent(geometryType)}`;
    }
    if (!bbox && bundesland && landuseType && geometryType) {
      return `http://127.0.0.1:5000/landuse/filter?bundesland=${encodeURIComponent(
        bundesland
      )}&landuse_type=${encodeURIComponent(
        landuseType
      )}&geometry=${encodeURIComponent(geometryType)}`;
    }
    return null;
  }, [bbox, bundesland, landuseType, geometryType]);

  // Apply filter 
  const handleApplyFilter = useCallback(async () => {
    if (!landuseType || !geometryType) {
      setNotification("⚠️ Please select Landuse Type and Geometry Type.");
      return;
    }
    const base = buildFilterUrl();
    if (!base) {
      setNotification("⚠️ Please select either BBox or Bundesland.");
      return;
    }

    try {
      const res = await fetch(base);
      const raw = await res.json();

      if (raw?.pmtiles_url) {
        const fullUrl = `http://127.0.0.1:5000${raw.pmtiles_url}?ts=${Date.now()}`;
        mapRef.current?.showPmtiles(fullUrl);
        setNotification(null);
        mapRef.current?.resetCursor();
      } else {
        mapRef.current?.clearPmtiles?.();
      }

      if (raw?.data) setGeojsonData(raw.data);
      else setGeojsonData(null);
    } catch (e) {
      console.error("Apply Filter failed:", e);
      setNotification("⚠️ Failed to fetch data. Check backend logs.");
    }
  }, [buildFilterUrl, landuseType, geometryType]);

  // Download 
  const handleDownload = useCallback(() => {
    if (!landuseType || !geometryType || !format) {
      setNotification(
        "⚠️ Please select Landuse, Geometry and Format before downloading."
      );
      return;
    }

    let url;
    if (bbox && landuseType && geometryType) {
      url = `http://127.0.0.1:5000/landuse/download?bbox=${bbox.join(",")}&landuse_type=${encodeURIComponent(
        landuseType
      )}&geometry_type=${encodeURIComponent(
        geometryType
      )}&format=${encodeURIComponent(format)}&download=1`;
    } else if (!bbox && bundesland && landuseType && geometryType) {
      url = `http://127.0.0.1:5000/landuse/download?bundesland=${encodeURIComponent(
        bundesland
      )}&landuse_type=${encodeURIComponent(
        landuseType
      )}&geometry_type=${encodeURIComponent(
        geometryType
      )}&format=${encodeURIComponent(format)}&download=1`;
    } else {
      setNotification("⚠️ Please select either BBox or Bundesland.");
      return;
    }

    // ⬇️ Direct download
    window.location.href = url;
  }, [bbox, bundesland, landuseType, geometryType, format]);

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <div className="w-72 bg-white shadow-md z-10">
          <Sidebar
            bundesland={bundesland}
            onBundeslandChange={setBundesland}
            landuseType={landuseType}
            onLanduseTypeChange={setLandUseType}
            geometryType={geometryType}
            onGeometryTypeChange={setGeometryType}
            format={format}
            onFormatChange={setFormat}
            onDrawBBox={handleRequestDrawBBox}
            onClearBBox={() => {               
              mapRef.current?.clearBBox?.();
              setBbox(null);
            }}
            onApplyFilter={handleApplyFilter}
            onDownload={handleDownload}
          />
        </div>
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="m-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded shadow text-sm font-semibold"
      >
        {sidebarOpen ? "<<" : ">>"}
      </button>

      <div className="flex-1 h-screen relative">
        <LanduseMap
          ref={mapRef}
          geojsonData={geojsonData}
          onBboxDrawn={(extent) => setBbox(extent)}
          drawTrigger={drawTrigger}
        />
      </div>

      {notification && (
        <div className="fixed bottom-5 right-5 bg-white border border-gray-300 shadow-lg rounded-lg px-4 py-2 text-sm font-medium text-gray-800 z-[9999]">
          {notification}
          <button
            onClick={() => setNotification(null)}
            className="ml-3 text-gray-500 hover:text-gray-700 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
