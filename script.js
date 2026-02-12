console.log("Inicializando WebGIS...");

// =============================
// CAMADAS BASE
// =============================

var osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '&copy; OpenStreetMap contributors' }
);

var esriSat = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles &copy; Esri' }
);

var googleSat = L.tileLayer(
    'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    {
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: '© Google'
    }
);

// =============================
// MAPA
// =============================

var map = L.map('map', {
    center: [-5.5, -45],
    zoom: 7,
    layers: [esriSat],
    preferCanvas: true
});

// =============================
// CONTROLE DE CAMADAS
// =============================

var baseMaps = {
    "OpenStreetMap": osm,
    "Satélite Esri": esriSat,
    "Satélite Google": googleSat
};

var overlayMaps = {};

var controlLayers = L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(map);

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

            // =========================
            // QUILOMBOS (PONTOS)
            // =========================
            if (tipo === "ponto") {

                layer = L.geoJSON(data, {
                    renderer: L.canvas(),

                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: 6,
                            fillColor: "#0077ff",
                            color: "#000",
                            weight: 1,
                            fillOpacity: 0.9
                        });
                    },

                    onEachFeature: function (feature, layer) {

                        let props = feature.properties || {};

                        let popupContent = `
                            <div style="font-size:14px">
                                <b>Nome do Quilombo:</b> ${props.NOM_TQ || "Não informado"}<br>
                                <b>Código:</b> ${props.COD_TQ || "Não informado"}<br>
                                <b>Status:</b> ${props.STATUS || "Não informado"}
                            </div>
                        `;

                        layer.bindPopup(popupContent);
                    }
                });

                layer.addTo(map);
                layer.bringToFront(); // garante que fique acima dos municípios
            }

            // =========================
            // MUNICÍPIOS (POLÍGONOS)
            // =========================
            else {

                layer = L.geoJSON(data, {
                    renderer: L.canvas(),
                    style: estilo,
                    interactive: false // não captura clique
                });

                layer.addTo(map);
            }

            overlayMaps[nome] = layer;

            controlLayers.remove();
            controlLayers = L.control.layers(baseMaps, overlayMaps, {
                collapsed: false
            }).addTo(map);

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
        fillOpacity: 0.15
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
