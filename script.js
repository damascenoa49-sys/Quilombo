window.onload = function () {

  var loader = document.getElementById("loader");

  var map = L.map("map").setView([-5.0, -45.0], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  var municipiosLayer = null;
  var quilombosLayer = null;

  // ===============================
  // CARREGAR MUNICÍPIOS
  // ===============================
  fetch("dados/municipios_ma.json")
    .then(response => {
      if (!response.ok) throw new Error("Erro ao carregar municípios");
      return response.json();
    })
    .then(data => {

      municipiosLayer = L.geoJSON(data, {
        style: {
          color: "#555",
          weight: 1,
          fillOpacity: 0.2
        }
      }).addTo(map);

    })
    .catch(error => console.error(error));

  // ===============================
  // CARREGAR QUILOMBOS
