import { useState } from 'react';
import LanduseMap from './components/LanduseMap';

function App() {
  const [geojsonData, setGeojsonData] = useState(null);

  const fetchExample = async () => {
    const response = await fetch('http://127.0.0.1:5000/landuse/forest');
    console.log(response)
    const raw = await response.json();
    setGeojsonData(raw.data);
  };

  return (
    <div style={{ width: '100vw', height: '150vh', margin: 0 }}>
      {/*<h2>Landuse Map Viewer</h2>*/}
      <button onClick={fetchExample}>Load Example Forest Area</button>
      <LanduseMap geojsonData={geojsonData} />
    </div>
  );
}

export default App;
