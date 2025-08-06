import { useState } from 'react';
import LanduseMap from './components/LanduseMap';
import Sidebar from './components/SideBar';

function App() {
  const [geojsonData, setGeojsonData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fetchExample = async () => {
    const response = await fetch('http://127.0.0.1:5000/landuse/bremen/forest');
    const raw = await response.json();
    setGeojsonData(raw.data);
  };

  const handleDrawBBox = () => {
    console.log("Draw BBox clicked");
  };
  const handleDownload = () => {
    console.log("File Downloaded");
  };

  return (
    <div className="flex h-screen">
      {/* Toggleable sidebar */}
      {sidebarOpen && (
        <div className="w-72 bg-white shadow-md z-10">
          <Sidebar
            onDrawBBox={handleDrawBBox}
            onDownload={handleDownload}
            onApplyFilter={fetchExample}
          />
        </div>
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mb-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded shadow text-sm font-semibold"
      >
        {sidebarOpen ? '<<' : '>>'} 
      </button>

      {/* Map fills the rest */}
      <div className="flex-1 h-screen">
        <LanduseMap geojsonData={geojsonData} />
      </div>
    </div>
  );
}

export default App;
