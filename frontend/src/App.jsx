import { useState, useCallback, useRef } from "react";
import LanduseMap from "./components/LanduseMap1";
import Sidebar from "./components/SideBar";
import { FaTimes } from "react-icons/fa";

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
        setDrawTrigger(0);
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
  <div className="flex w-[1364px] h-[590px]">
    {/* Sidebar wrapper */}
    {sidebarOpen && (
      <div className="sidebar">
        
          {/* ⬅️ padding is here (p-4), height matches parent (h-full) */}
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

    {/* Vertical toggle bar – full height, no margins so no gaps */}
    <div className="h-[590px] flex items-start">
      <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="toggle-btn"
        >
          {sidebarOpen ? "<<" : ">>"}
      </button>
    </div>
    

    {/* Map */}
    <main className="flex-1">
      <div className="map">
        <LanduseMap
          ref={mapRef}
          geojsonData={geojsonData}
          onBboxDrawn={(extent) => setBbox(extent)}
          drawTrigger={drawTrigger}
        />
      </div>
    </main>

    {/* Notification */}
    {notification && (
      <div 
        
        className="absolute bottom-5 right-5 border-gray-300 shadow-lg rounded-lg px-4 py-2 text-base font-medium text-gray-800 z-[9999]"
        style = {{
          top: "8px",
          right: "8px",
          display: "flex",
          alignItems: "center",       // vertically center items
          justifyContent: "space-between",
          gap: "10px",
          fontSize: "16px",
        }}
        >
        <button
          onClick={() => setNotification(null)}
          className="icon-button"    
        >
          <span style={{ flex: 2,}}>{notification}</span>
          <FaTimes
            onClick={() => setNotification(null)}
            style={{
              cursor: "pointer",
              color: "white",
              fontSize: "18px",
              
            }}
            title="Close"
          />
        </button>
      </div>
    )}
  </div>
);
}

export default App;