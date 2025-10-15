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
import { FaDrawPolygon, FaLayerGroup } from "react-icons/fa";

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
  const pmtilesLoadedRef = useRef(false); 

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
      pmtilesLoadedRef.current = true;
    },
    clearPmtiles: () => {
      if (mapRef.current && pmtilesLayerRef.current) {
        mapRef.current.removeLayer(pmtilesLayerRef.current);
        pmtilesLayerRef.current = null;
        popupOverlayRef.current?.setPosition(undefined);
      }
      pmtilesLoadedRef.current = false;
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

    // popup setup
    popupRef.current = document.createElement("div");
    popupRef.current.className = "ol-popup";
    popupRef.current.style.background = "white";
    popupRef.current.style.padding = "4px";
    popupRef.current.style.border = "1px solid black";
    popupRef.current.style.minWidth = "150px";

    popupOverlayRef.current = new Overlay({
      element: popupRef.current,
      autoPan: { animation: { duration: 250 } },
    });
    map.addOverlay(popupOverlayRef.current);

    // click handler for popup
    map.on("singleclick", (evt) => {
      //disable popup if drawing OR no pmtiles
      if (drawInteractionRef.current || !pmtilesLoadedRef.current) return;

      const features = [];
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        features.push(feature);
      });

      if (features.length > 0) {
        const props = features[0].getProperties();
        const coord = evt.coordinate;

        const area =
          props.area != null ? `${Number(props.area).toFixed(2)} m²` : "-";

        popupRef.current.innerHTML = `
          <div style="font-size:12px">
            <b>Properties</b><br/>
            OSM ID: ${props.osm_id || "-"}<br/>
            Name: ${props.name || "Unnamed"}<br/>
            Landuse: ${props.landuse_type || "Unknown"}<br/>
            Leisure: ${props.leisure || "-"}<br/>
            City: ${props.city || "-"}<br/>
            Area: ${area}
          </div>`;
        popupOverlayRef.current.setPosition(coord);
      } else {
        popupOverlayRef.current.setPosition(undefined);
      }
    });

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
      mapRef.current
        .getView()
        .fit(extent, { padding: [24, 24, 24, 24], duration: 400 });
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
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", background: "#eef" }}
      />
      <div 
        className="absolute top-2 right-2 z-10 flex flex-col rounded-none"
        style={{ position: "absolute", top: "8px", right: "8px", zIndex: 10 }}
      >
        <button
          className="icon-button"
          title="Draw BBox"
        >
          <FaDrawPolygon />
        </button>
        <button
          className="icon-button"
          title="Layers"
        >
          <FaLayerGroup />
        </button>
      </div>
    </div>
  );
});

export default LanduseMap;
