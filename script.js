console.log("WebGIS iniciado");

// ==========================
// Criar mapa
// ==========================
var map = L.map('map').setView([-5.0, -45.0], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var municipiosLayer;
var quilombosLayer;

// ==========================
// Carregar dados
// ==========================
Promise.all([
    fetch('dados/municipios_ma.json').then(res => res.json()),
    fetch('dados/quilombos_ma.json').then(res => res.json())
])
.then(([municipios, quilombos]) => {

    // Municípios
    municipiosLayer = L.geoJSON(municipios, {
        style: {
            color: '#555',
            weight: 1,
            fillOpacity: 0.2
