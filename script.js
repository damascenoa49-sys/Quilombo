console.log("Inicializando WebGIS...");

// =============================
// CAMADAS BASE
// =============================

var osm = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  { attribution: "&copy; OpenStreetMap contributors" }
);

var esriSat = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  { attribution: "Tiles &copy; Esri" }
);

var googleSat = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "© Google"
  }
);

// =============================
// MAPA
// =============================

var map = L.map("map", {
  center: [-5.5, -45],
  zoom: 7,
  layers: [esriSat],
  preferCanvas: true
});

// =============================
// CONTROLE
// =============================

var baseMaps = {
  "OpenStreetMap": osm,
  "Satélite Esri": esriSat,
  "Satélite Google": googleSat
};

var overlayMaps = {};
var controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);

// =============================
// VARIÁVEIS GLOBAIS
// =============================

var municipiosLayer;
var quilombosLayer;
var municipiosData;
var quilombosData;

// =============================
// CARREGAR MUNICÍPIOS
// =============================

fetch("./municipios_ma.json")
  .then(res => res.json())
  .then(function(data) {

    municipiosData = data;

    municipiosLayer = L.geoJSON(data, {
      style: {
        color: "#000",
        weight: 1,
        fillOpacity: 0.15
      }
    }).addTo(map);

    overlayMaps["Municípios"] = municipiosLayer;
    controlLayers.addOverlay(municipiosLayer, "Municípios");
  });

// =============================
// CARREGAR QUILOMBOS
// =============================

fetch("./quilombos_ma.json")
  .then(res => res.json())
  .then(function(data) {

    quilombosData = data;

    quilombosLayer = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          fillColor: "#0077ff",
          color: "#000",
          weight: 1,
          fillOpacity: 0.9
        });
      },
      onEachFeature: function(feature, layer) {

        var props = feature.properties || {};

        var popupContent =
          "<b>Nome:</b> " + (props.NOM_TQ || "") + "<br>" +
          "<b>Código:</b> " + (props.COD_TQ || "") + "<br>" +
          "<b>Status:</b> " + (props.STATUS || "");

        layer.bindPopup(popupContent);
      }
    }).addTo(map);

    overlayMaps["Quilombos"] = quilombosLayer;
    controlLayers.addOverlay(quilombosLayer, "Quilombos");
  });

// =============================
// FUNÇÃO DE FILTRO
// =============================

function filtrarMunicipio() {

  var nomeBusca = document.getElementById("buscaMunicipio").value.toUpperCase();

  if (!nomeBusca) return;

  // Encontrar município
  var municipioEncontrado = municipiosData.features.find(function(f) {
    return f.properties.NOME_MUN.toUpperCase().includes(nomeBusca);
  });

  if (!municipioEncontrado) {
    alert("Município não encontrado.");
    return;
  }

  // Zoom no município
  var layerMunicipio = L.geoJSON(municipioEncontrado);
  map.fitBounds(layerMunicipio.getBounds());

  // Filtrar quilombos
  quilombosLayer.clearLayers();

  var filtrados = quilombosData.features.filter(function(f) {
    return f.properties.MUNICIPIO &&
           f.properties.MUNICIPIO.toUpperCase() === municipioEncontrado.properties.NOME_MUN.toUpperCase();
  });

  quilombosLayer.addData(filtrados);
}
