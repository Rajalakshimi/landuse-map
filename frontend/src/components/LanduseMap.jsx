import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj'; 

const LanduseMap = ({ geojsonData }) => {
  const mapRef = useRef(null);
  const mapObject = useRef(null);
  const vectorLayerRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // init map once visible
  useEffect(() => {
    const interval = setInterval(() => {
      const container = mapRef.current;
      if (container && container.clientWidth > 0 && container.clientHeight > 0 && !mapInitialized) {
        const baseLayer = new TileLayer({ source: new OSM() });
        const view = new View({
          center: fromLonLat([10.21479252240413, 51.145203927463626]),
          zoom: 6,
        });

        mapObject.current = new Map({
          target: container,
          layers: [baseLayer],
          view,
        });

        mapObject.current.updateSize();
        setMapInitialized(true);
        clearInterval(interval);

        window.addEventListener('resize', () => mapObject.current?.updateSize());
      }
    }, 200);

    return () => clearInterval(interval);
  }, [mapInitialized]);

  // Load data into the map
  useEffect(() => {
    if (!geojsonData || !mapObject.current) return;

    if (vectorLayerRef.current) {
      mapObject.current.removeLayer(vectorLayerRef.current);
    }

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(geojsonData, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326',
        }),
      }),
    });

    mapObject.current.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;

    const extent = vectorLayer.getSource().getExtent();
    if (extent) {
      mapObject.current.getView().fit(extent, {
        padding: [20, 20, 20, 20],
        duration: 500,
      });
    }
  }, [geojsonData]);

  //  Render container
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={mapRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#eef',
        }}
      />
    </div>
  );
};

export default LanduseMap;
