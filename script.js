// =====================================
// INICIALIZAÇÃO DO MAPA (OTIMIZADA)
// =====================================

logToScreen("Inicializando mapa...");

// Ativa renderização em Canvas (melhora performance)
var map = L.map('map', {
    preferCanvas: true
}).setView([-5.5, -45], 6);

// Camada base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

logToScreen("Mapa base carregado com sucesso.");


// =====================================
// FUNÇÃO PARA CARREGAR CAMADAS
// =====================================

function carregarCamada(url, estilo = null, tipo = "poligono") {

    logToScreen("Carregando: " + url);

    return fetch(url)
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
                camada = L.geoJSON(data, {
                    renderer: L.canvas(),
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


// =====================================
// CARREGAMENTO EM SEQUÊNCIA
// =====================================

logToScreen("Iniciando carregamento de camadas...");

// 1️⃣ Carrega Municípios primeiro
carregarCamada(
    "./municipios_ma.json",
    {
        color: "#555",
        weight: 1,
        fillOpacity: 0.2
    },
    "poligono"
)
.then(() => {

    // 2️⃣ Pequeno intervalo antes dos Quilombos
    return new Promise(resolve => setTimeout(resolve, 500));

})
.then(() => {

    return carregarCamada(
        "./quilombos_ma.json",
        null,
        "ponto"
    );

})
.then(() => {

    logToScreen("Todas as camadas carregadas.");
    
    // Esconde loader
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none";
    }

})
.catch(error => {
    logToScreen("Erro geral no carregamento: " + error.message, "error");
});
