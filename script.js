console.log("Inicializando WebGIS...");

// =============================
// CAMADAS BASE
// =============================

var osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors' }
);

var satelite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri' }
);

// =============================
// MAPA (Canvas ativado)
// =============================

var map = L.map('map', {
    center: [-5.5, -45],
    zoom: 7,
    layers: [satelite],
    preferCanvas: true
});

// Controle de camadas
var baseMaps = {
    "Mapa": osm,
    "Satélite": satelite
};

var overlayMaps = {};

var controlLayers = L.control.layers(baseMaps, overlayMaps).addTo(map);


// =============================
// FUNÇÃO PARA CARREGAR GEOJSON
// =============================

function carregarGeoJSON(url, nome, estilo = null, tipo = "poligono") {

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro HTTP " + response.status);
            }
            return response.json();
        })
        .then(data => {

            let layer;

            if (tipo === "ponto") {
                layer = L.geoJSON(data, {
                    renderer: L.canvas(),
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: 4,
                            fillColor: "#800000",
                            color: "#000",
                            weight: 1,
                            fillOpacity: 0.8
                        });
                    }
                });
            } else {
                layer = L.geoJSON(data, {
                    renderer: L.canvas(),
                    style: estilo
                });
            }

            layer.addTo(map);
            overlayMaps[nome] = layer;

            controlLayers.remove();
            controlLayers = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);

            console.log(nome + " carregado com sucesso.");

        })
        .catch(error => {
            console.error("Erro ao carregar " + nome + ":", error);
        });
}


// =============================
// CARREGAMENTO DAS CAMADAS
// =============================

carregarGeoJSON(
    "./municipios_ma.json",
    "Municípios",
    {
        color: "#000",
        weight: 1,
        fillOpacity: 0.1
    },
    "poligono"
);

setTimeout(() => {
    carregarGeoJSON(
        "./quilombos_ma.json",
        "Quilombos",
        null,
        "ponto"
    );
}, 500);


// =============================
// REMOVER LOADER
// =============================

window.onload = function () {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
};
