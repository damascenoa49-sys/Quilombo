// Initialize the map
const map = L.map('map').setView([-5.0, -45.0], 7); // Center on Maranhão approximately

// Basemaps
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});

const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const googleSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});


// Add default basemap
esriSatellite.addTo(map);

// Layer Control
const baseMaps = {
    "Satélite (Esri)": esriSatellite,
    "Satélite (Google)": googleSatellite,
    "OpenStreetMap": osm
};

const overlayMaps = {};
let quilombosLayer;
let municipiosLayer;

const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

// Add Scale Control
L.control.scale({
    imperial: false,
    metric: true,
    maxWidth: 200
}).addTo(map);

// Custom North Arrow Control
const NorthArrowControl = L.Control.extend({
    options: {
        position: 'topright'
    },

    onAdd: function (map) {
        const container = L.DomUtil.create('div', 'north-arrow-control');
        const arrow = L.DomUtil.create('div', 'north-arrow', container);
        arrow.title = "Norte";
        return container;
    }
});

map.addControl(new NorthArrowControl());

// Styles
const quilomboStyle = {
    color: "#ff7800",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.4 // Trausparency
};

const municipioStyle = {
    color: "#3388ff",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.2 // Transparency
};

// Function to load Data from variables
function loadLayers() {
    try {
        logToScreen("Iniciando carregamento de camadas...");
                    }
                }

        // Load Municipios
        // Data is now in global variable 'municipiosData'
        if (typeof municipiosData !== 'undefined') {
            logToScreen("Dados de Municípios encontrados. Carregando (pode demorar)...");
            // Use global variable
            municipiosLayer = L.geoJSON(municipiosData, {
                style: municipioStyle,
                onEachFeature: function (feature, layer) {
                    if (feature.properties) {
                        let popupContent = "<strong>Município:</strong> " + (feature.properties.NM_MUN || "N/A");
                        layer.bindPopup(popupContent);
                    }
                }
            });
            municipiosLayer.addTo(map);
            layerControl.addOverlay(municipiosLayer, "Municípios");
            logToScreen("Municípios carregados com sucesso!");

            // Ensure Quilombos are on top if they exist
            if (quilombosLayer) {
                quilombosLayer.bringToFront();
            }
        } else {
            logToScreen("Variável 'municipiosData' não encontrada. Verifique Municipios.js", 'error');
        }

        // Hide loader
        logToScreen("Carregamento concluído. Ocultando tela de carregamento...");
        setTimeout(() => {
            const loader = document.getElementById('loader');
            if (loader) {
                loader.style.display = 'none';
            }
        }, 1000); // Small delay to let user see logs

        setupMapEvents(); // Initialize map events after loading layers

    } catch (error) {
        logToScreen("Erro fatal ao carregar camadas: " + error.message, 'error');
        console.error("Error loading layers:", error);
        alert("Erro ao carregar as camadas: " + error.message);

        // Hide loader even on error so user sees the map (even if empty) or alert
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// Check if document is ready (though defer handles this, safety check)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadLayers);
} else {
    loadLayers();
}

// ---------------------------------------------------------
// New Features: Zoom Styling & Filtering
// ---------------------------------------------------------

// Update styles based on zoom level
function updateMapStyles() {
    const currentZoom = map.getZoom();

    // Threshold: Zoom > 9 makes municipios transparent (hollow)
    // Adjust this threshold as needed based on user preference
    if (currentZoom > 9) {
        municipioStyle.fillOpacity = 0; // Transparent fill
    } else {
        municipioStyle.fillOpacity = 0.2; // Original fill
    }

    if (municipiosLayer) {
        municipiosLayer.setStyle(municipioStyle);
    }
}

// Ray-casting algorithm for point in polygon
function isPointInPolygon(point, vs) {
    // point = [lng, lat]
    // vs = [[lng, lat], ...]

    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Helper to check if a Feature is inside any of a list of Municipality Features
function isFeatureInMunicipios(feature, municipiosFeatures) {
    if (!feature.geometry || !municipiosFeatures || municipiosFeatures.length === 0) return false;

    // Get a representative point for the Quilombo (e.g., first point of polygon)
    // Note: GeoJSON Polygon coordinates are [ [ [x, y], ... ] ]
    let point;
    if (feature.geometry.type === 'Polygon') {
        point = feature.geometry.coordinates[0][0];
    } else if (feature.geometry.type === 'MultiPolygon') {
        point = feature.geometry.coordinates[0][0][0];
    } else if (feature.geometry.type === 'Point') {
        point = feature.geometry.coordinates;
    }

    if (!point) return false;

    // Check against each Municipality
    for (const muni of municipiosFeatures) {
        const geom = muni.geometry;
        if (geom.type === 'Polygon') {
            if (isPointInPolygon(point, geom.coordinates[0])) return true;
        } else if (geom.type === 'MultiPolygon') {
            for (const polygonCoords of geom.coordinates) {
                if (isPointInPolygon(point, polygonCoords[0])) return true;
            }
        }
    }
    return false;
}

// Filter features based on search text
function filterFeatures(searchText) {
    const normalize = (str) => {
        return str ? str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    };

    const search = normalize(searchText);

    if (!searchText || searchText.trim() === "") {
        // Reset to full data if search is empty
        reloadLayerData(quilombosData, municipiosData);
        return;
    }

    // 1. Filter Municipios first
    const filteredMunicipiosFeatures = municipiosData.features.filter(f =>
        normalize(f.properties.NM_MUN).includes(search)
    );
    const filteredMunicipios = {
        type: "FeatureCollection",
        features: filteredMunicipiosFeatures
    };

    // 2. Filter Quilombos
    // Include if:
    // a) Name matches search
    // b) OR it is located inside one of the filtered Municipios
    const filteredQuilombos = {
        type: "FeatureCollection",
        features: quilombosData.features.filter(f => {
            const nameMatch = normalize(f.properties.NOM_TQ).includes(search) ||
                normalize(f.properties.NOM_TQ_UF).includes(search);

            if (nameMatch) return true;

            // Spatial check: If we have found municipios, check if this quilombo is inside them
            if (filteredMunicipiosFeatures.length > 0 && filteredMunicipiosFeatures.length < 20) {
                // Optimization: only check if we narrowed down to a few municipios (e.g. < 20)
                // to avoid expensive checks when search is generic like "a"
                return isFeatureInMunicipios(f, filteredMunicipiosFeatures);
            }

            return false;
        })
    };

    reloadLayerData(filteredQuilombos, filteredMunicipios);
}

// Helper to reload layers with new data (filtered or full)
function reloadLayerData(newQuilombosData, newMunicipiosData) {
    // Remove old layers from map and control
    if (quilombosLayer) {
        map.removeLayer(quilombosLayer);
        layerControl.removeLayer(quilombosLayer);
    }
    if (municipiosLayer) {
        map.removeLayer(municipiosLayer);
        layerControl.removeLayer(municipiosLayer);
    }

    // Recreate Quilombos Layer
    quilombosLayer = L.geoJSON(newQuilombosData, {
        style: quilomboStyle,
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                let popupContent = "<strong>Quilombo:</strong> " + (feature.properties.NOM_TQ || "N/A") + "<br>" +
                    "<strong>Município:</strong> " + (feature.properties.NOM_TQ_UF || "N/A") + "<br>" +
                    "<strong>Status:</strong> " + (feature.properties.STATUS || "N/A");
                layer.bindPopup(popupContent);
            }
        }
    });

    // Recreate Municipios Layer
    municipiosLayer = L.geoJSON(newMunicipiosData, {
        style: municipioStyle, // Will use current style (zoom dependent)
        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                let popupContent = "<strong>Município:</strong> " + (feature.properties.NM_MUN || "N/A");
                layer.bindPopup(popupContent);
            }
        }
    });

    // Add back to map and control
    // Add Municipios FIRST so they are behind
    municipiosLayer.addTo(map);
    quilombosLayer.addTo(map);

    // Ensure Quilombos are on top
    quilombosLayer.bringToFront();

    layerControl.addOverlay(quilombosLayer, "Quilombos");
    layerControl.addOverlay(municipiosLayer, "Municípios");

    // Apply current zoom styling
    updateMapStyles();
}

function setupMapEvents() {
    // Zoom listener
    map.on('zoomend', updateMapStyles);

    // Initial style application
    updateMapStyles();

    // Search UI listeners
    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value;
            filterFeatures(val);
            if (val.length > 0) {
                searchClear.style.display = 'block';
            } else {
                searchClear.style.display = 'none';
            }
        });
    }

    if (searchClear) {
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            filterFeatures('');
            searchClear.style.display = 'none';
            searchInput.focus();
        });
    }
}

logToScreen("Iniciando carregamento de camadas...");

// Municípios
fetch("./municipios_ma.json")
    .then(response => response.json())
    .then(data => {
        logToScreen("Municípios carregados com sucesso.");
        L.geoJSON(data).addTo(map);
    })
    .catch(error => {
        logToScreen("Erro ao carregar municípios: " + error, 'error');
    });

// Quilombos
fetch("./quilombos_ma.json")
    .then(response => response.json())
    .then(data => {
        logToScreen("Quilombos carregados com sucesso.");
        L.geoJSON(data).addTo(map);
    })
    .catch(error => {
        logToScreen("Erro ao carregar quilombos: " + error, 'error');
    });

