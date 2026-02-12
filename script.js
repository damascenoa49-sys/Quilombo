// ===============================
// LOADER
// ===============================
window.onload = function () {
  var loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = "none";
  }
};

// ===============================
// MAPA
// ===============================
var map = L.map("map").setView([-5.0, -45.0], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
var municipiosLayer;
var quilombosLayer;

// ===============================
// CARREGAR MUNICÍPIOS
// ===============================
fetch("dados/municipios_ma.json")
  .then(response => response.json())
  .then(data => {

    municipiosLayer = L.geoJSON(data, {
      style: {
        color: "#555",
        weight: 1,
        fillOpacity: 0.2
      }
    }).addTo(map);

  });

// ===============================
// CARREGAR QUILOMBOS
// ===============================
fetch("dados/quilombos_ma.json")
  .then(response => response.json())
  .then(data => {

    quilombosLayer = L.geoJSON(data, {

      style: {
        color: "#003366",
        weight: 1,
        fillColor: "#0077ff",
