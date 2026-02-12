console.log("Biblioteca Leaflet carregada com sucesso.");
console.log("Iniciando carregamento de camadas...");

// =============================
// CAMADAS BASE
// =============================

// OpenStreetMap
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

// Satélite (Esri World Imagery)
var satelite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri'
    }
);

// =============================
// INICIALIZAÇÃO DO MAPA
// =============================

var map = L.map('map', {
    center: [-5.0, -44.0], // Ajuste se quiser centralizar melhor
    zoom: 7,
    layers: [satelite] // Começa em satélite
});

// Controle de camadas base
var baseMaps = {
    "Mapa": osm,
    "Satélite": satelite
};

var overlayMaps = {};

L.control.layers(baseMaps, overlayMaps).addTo(map);

// =============================
// CAMADA MUNICÍPIOS
// =============================

if (typeof municipiosData !== 'undefined') {

    var municipiosLayer = L.geoJSON(municipiosData, {
        style: {
            color: "#000000",
            weight: 1,
            fillOpacity: 0.1
        }
    }).addTo(map);

    overlayMaps["Municípios"] = municipiosLayer;

    console.log("Camada Municípios carregada com sucesso.");

} else {
    console.error("Variável 'municipiosData' não encontrada. Verifique Municipios.js");
}

// =============================
// CAMADA QUILOMBOS
// =============================

if (typeof quilombosData !== 'undefined') {

    var quilombosLayer = L.geoJSON(quilombosData, {
        style: {
            color: "#800026",
            weight: 2,
            fillOpacity: 0.5
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                var popupContent = "<b>Comunidade:</b> " + (feature.properties.nome || "Sem nome");
                layer.bindPopup(popupContent);
            }
        }
    }).addTo(map);

    overlayMaps["Quilombos"] = quilombosLayer;

    console.log("Camada Quilombos carregada com sucesso.");

} else {
    console.error("Variável 'quilombosData' não encontrada. Verifique Quilombos.js");
}

// Atualiza controle com overlays
L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

// =============================
// OCULTAR TELA DE CARREGAMENTO
// =============================

window.onload = function () {
    var loading = document.getElementById("loading");
    if (loading) {
        loading.style.display = "none";
    }
    console.log("Carregamento concluído. Ocultando tela de carregamento...");
};
