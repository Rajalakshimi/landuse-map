import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "ol/ol.css";
import { Map, View, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorTileLayer from "ol/layer/VectorTile";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { fromLonLat, toLonLat } from "ol/proj";
import Draw, { createBox } from "ol/interaction/Draw";
import { Fill, Stroke, Style } from "ol/style";
import { PMTilesVectorSource } from "ol-pmtiles";
import MVT from "ol/format/MVT";
import { unByKey } from "ol/Observable";

// color by type
function getColor(props) {
  const lu = props.landuse_type?.toLowerCase();
  switch (lu) {
    case "residential":
      return "rgba(255,0,0,0.4)";
    case "farmland":
      return "rgba(255,255,0,0.4)";
    case "forest":
      return "rgba(0,128,0,0.4)";
    case "allotments":
      return "rgba(0,0,255,0.4)";
    case "flowerbed":
      return "rgba(255,0,255,0.4)";
    case "greenhouse-horticulture":
      return "rgba(0,255,255,0.4)";
    case "orchard":
      return "rgba(128,64,0,0.4)";
    case "commercial":
      return "rgba(255,165,0,0.4)";
    case "industrial":
      return "rgba(128,128,128,0.4)";
    default:
      return "rgba(200,200,200,0.4)"; 
  }
}

const LanduseMap = forwardRef(function LanduseMap(
  { geojsonData, onBboxDrawn, drawTrigger = 0 },
  ref
) {
  const containerRef = useRef();
  const mapRef = useRef();
  const drawSourceRef = useRef(new VectorSource());
  const geojsonLayerRef = useRef(null);
  const pmtilesLayerRef = useRef(null);
  const drawInteractionRef = useRef(null);

  // popup
  const popupRef = useRef();
  const popupOverlayRef = useRef();

  useImperativeHandle(ref, () => ({
    showPmtiles: (pmtilesUrl) => {
      if (!mapRef.current || !pmtilesUrl) return;

      if (pmtilesLayerRef.current) {
        mapRef.current.removeLayer(pmtilesLayerRef.current);
        pmtilesLayerRef.current = null;
      }

      const pmtilesSource = new PMTilesVectorSource({
        url: pmtilesUrl,
        format: new MVT(),
      });

      const vtLayer = new VectorTileLayer({
        source: pmtilesSource,
        style: (feature) =>
          new Style({
            fill: new Fill({ color: getColor(feature.getProperties()) }),
            stroke: new Stroke({ color: "#333", width: 1 }),
          }),
      });

      mapRef.current.addLayer(vtLayer);
      pmtilesLayerRef.current = vtLayer;

      // popup only when pmtiles loaded
      mapRef.current.on("singleclick", (evt) => {
        const features = [];
        mapRef.current.forEachFeatureAtPixel(evt.pixel, (feature) => {
          features.push(feature);
        });

        if (features.length > 0) {
          const props = features[0].getProperties();
          const coord = evt.coordinate;
          popupRef.current.innerHTML = `
            <div style="font-size:12px">
              <b>${props.name || "Unnamed"}</b><br/>
              Landuse: ${props.landuse_type || "Unknown"}<br/>
              Leisure: ${props.leisure || "-"}<br/>
              City: ${props.city || "-"}<br/>
              OSM ID: ${props.osm_id || "-"}
            </div>`;
          popupOverlayRef.current.setPosition(coord);
        } else {
          popupOverlayRef.current.setPosition(undefined);
        }
      });
    },
    clearPmtiles: () => {
      if (mapRef.current && pmtilesLayerRef.current) {
        mapRef.current.removeLayer(pmtilesLayerRef.current);
        pmtilesLayerRef.current = null;
        popupOverlayRef.current?.setPosition(undefined);
      }
    },
    clearBBox: () => {
      drawSourceRef.current.clear();
    },
    // reset cursor after Apply Filter
    resetCursor: () => {
      if (containerRef.current) containerRef.current.style.cursor = "";
      if (drawInteractionRef.current && mapRef.current) {
        mapRef.current.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null;
      }
    },
  }));

  // init map
  useEffect(() => {
    if (mapRef.current) return;

    const raster = new TileLayer({ source: new OSM() });
    const vector = new VectorLayer({
      source: drawSourceRef.current,
      style: new Style({
        stroke: new Stroke({ color: "#d33", width: 2 }),
        fill: new Fill({ color: "rgba(200,0,0,0.1)" }),
      }),
    });

    const map = new Map({
      target: containerRef.current,
      layers: [raster, vector],
      view: new View({
        center: fromLonLat([10.21, 51.14]),
        zoom: 6,
      }),
    });

    // popup
    popupRef.current = document.createElement("div");
    popupRef.current.className = "ol-popup";
    popupRef.current.style.background = "white";
    popupRef.current.style.padding = "4px";
    popupRef.current.style.border = "1px solid black";
    popupRef.current.style.minWidth = "120px";

    popupOverlayRef.current = new Overlay({
      element: popupRef.current,
      autoPan: { animation: { duration: 250 } },
    });
    map.addOverlay(popupOverlayRef.current);

    mapRef.current = map;
    map.updateSize();
    window.addEventListener("resize", () => map.updateSize());
  }, []);

  // GeoJSON overlay
  useEffect(() => {
    if (!mapRef.current) return;

    if (geojsonLayerRef.current) {
      mapRef.current.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    if (!geojsonData) return;

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: new GeoJSON().readFeatures(geojsonData, {
          featureProjection: "EPSG:3857",
          dataProjection: "EPSG:4326",
        }),
      }),
    });

    mapRef.current.addLayer(vectorLayer);
    geojsonLayerRef.current = vectorLayer;

    const extent = vectorLayer.getSource().getExtent();
    if (extent && isFinite(extent[0])) {
      mapRef.current.getView().fit(extent, { padding: [24, 24, 24, 24], duration: 400 });
    }
  }, [geojsonData]);

  // BBox draw 
  useEffect(() => {
    if (!mapRef.current) return;

    if (drawInteractionRef.current) {
      mapRef.current.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    if (!drawTrigger) return;

    const interaction = new Draw({
      source: drawSourceRef.current,
      type: "Circle",
      geometryFunction: createBox(),
      style: new Style({
        stroke: new Stroke({ color: "#00f", width: 2 }),
        fill: new Fill({ color: "rgba(0,0,255,0.1)" }),
      }),
    });
    mapRef.current.addInteraction(interaction);
    drawInteractionRef.current = interaction;

    if (containerRef.current) containerRef.current.style.cursor = "crosshair";

    interaction.on("drawstart", () => {
      drawSourceRef.current.clear();
    });

    const onEndKey = interaction.on("drawend", (evt) => {
      const ex = evt.feature.getGeometry().getExtent();
      const [minLat, minLon] = toLonLat([ex[0], ex[1]], "EPSG:3857");
      const [maxLat, maxLon] = toLonLat([ex[2], ex[3]], "EPSG:3857");
      const extent4326 = [minLon, minLat, maxLon, maxLat];
      onBboxDrawn?.(extent4326);
      unByKey(onEndKey);
    });
  }, [drawTrigger, onBboxDrawn]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0, background: "#eef" }} />
    </div>
  );
});

export default LanduseMap;
