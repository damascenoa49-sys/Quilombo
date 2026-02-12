// ===============================
// INICIALIZAÇÃO DO MAPA
// ===============================

logToScreen("Inicializando mapa...");

var map = L.map('map').setView([-5.5, -45], 6);

// Camada base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

logToScreen("Mapa base carregado com sucesso.");


// ===============================
// FUNÇÃO PARA CARREGAR CAMADAS
// ===============================

function carregarCamada(url, estilo = null, tipo = "poligono") {

    logToScreen("Carregando: " + url);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro HTTP: " + response.status);
            }
            return response.json();
        })
        .then(data => {

            let camada;

            if (tipo === "ponto") {
                camada = L.geoJSON(data, {
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, {
                            radius: 5,
                            fillColor: "#800000",
                            color: "#000",
                            weight: 1,
                            fillOpacity: 0.8
                        });
                    }
                });
            } else {
                camada = L.geoJSON(data, {
                    style: estilo
                });
            }

            camada.addTo(map);
            logToScreen("Camada carregada com sucesso: " + url);

        })
        .catch(error => {
            logToScreen("Erro ao carregar " + url + ": " + error.message, "error");
        });
}


// ===============================
// CARREGAMENTO DAS CAMADAS
// ===============================

logToScreen("Iniciando carregamento de camadas...");

// Municípios (polígono)
carregarCamada(
    "./municipios_ma.json",
    {
        color: "#555",
        weight: 1,
        fillOpacity: 0.2
    },
    "poligono"
);

// Quilombos (ponto)
carregarCamada(
    "./quilombos_ma.json",
    null,
    "ponto"
);

logToScreen("Processo de carregamento iniciado.");
