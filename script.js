console.log("Inicializando WebGIS...");

// Evita erro se o mapa já existir
if (window.mapaExistente) {
    window.mapaExistente.remove();
}

// ===============================
// CRIAR MAPA UMA ÚNICA VEZ
// ===============================
var map = L.map("map").setView([-5.0, -45.0], 6);
window.mapaExistente = map;

// ===============================
// BASE MAP
// ===============================
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

var municipiosLayer = null;
var quilombosLayer = null;

// ===============================
// MUNICÍPIOS
// ===============================
fetch("dados/municipios_ma.json")
    .then(res => res.json())
    .then(data => {

        municipiosLayer = L.geoJSON(data, {
            style: {
                color: "#555",
                weight: 1,
                fillOpacity: 0.2
            }
        }).addTo(map);

    })
    .catch(err => console.error(err));

// ===============================
// QUILOMBOS
// ===============================
fetch("dados/quilombos_ma.json")
    .then(res => res.json())
    .then(data => {

        quilombosLayer = L.geoJSON(data, {
            style: {
                color: "#003366",
                weight: 1,
                fillColor: "#0077ff",
                fillOpacity: 0.6
            },
            onEachFeature: function (feature, layer) {

                var props = feature.properties || {};

                layer.bindPopup(
                    "<strong>Quilombo:</strong> " + (props.NOM_TQ || "") + "<br>" +
                    "<strong>Código:</strong> " + (props.COD_TQ || "") + "<br>" +
                    "<strong>Status:</strong> " + (props.STATUS || "")
                );
            }
        }).addTo(map);

    })
    .catch(err => console.error(err));

// ===============================
// FILTRO MUNICÍPIO
// ===============================
function filtrarMunicipio() {

    var nomeBusca = document.getElementById("buscaMunicipio").value.toUpperCase();
    if (!nomeBusca || !municipiosLayer || !quilombosLayer) return;

    var municipioEncontrado = null;

    municipiosLayer.eachLayer(function(layer) {
        var nome = layer.feature.properties.NOME_MUN;
        if (nome && nome.toUpperCase().includes(nomeBusca)) {
            municipioEncontrado = layer;
        }
    });

    if (!municipioEncontrado) {
        alert("Município não encontrado.");
        return;
    }

    map.fitBounds(municipioEncontrado.getBounds());

    var nomeSelecionado =
        municipioEncontrado.feature.properties.NOME_MUN.toUpperCase();

    quilombosLayer.eachLayer(function(layer) {

        var mun = layer.feature.properties.MUNICIPIO;

        if (mun && mun.toUpperCase() === nomeSelecionado) {

            layer.setStyle({
                fillColor: "#ff0000",
                fillOpacity: 0.8
            });

        } else {

            layer.setStyle({
                fillColor: "#0077ff",
                fillOpacity: 0.6
            });

        }

    });
}
