import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { get as getProjection } from 'ol/proj';

const LanduseMap = ({ geojsonData }) => {
  const mapRef = useRef(null);
  const mapObject = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const baseLayer = new TileLayer({ source: new OSM() });
    const view = new View({ center: [51.145203927463626, 10.21479252240413], zoom: 2, projection: getProjection('EPSG:4326'),   });

    mapObject.current = new Map({
      target: mapRef.current,
      layers: [baseLayer],
      view,
    });

    return () => mapObject.current?.setTarget(null);
  }, []);

  useEffect(() => {
    if (!geojsonData || !mapObject.current) return;

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(geojsonData, {
          featureProjection: 'EPSG:4326',
        }),
      }),
    });

    mapObject.current.getLayers().getArray().splice(1); 
    mapObject.current.addLayer(vectorLayer);
  }, [geojsonData]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default LanduseMap;
