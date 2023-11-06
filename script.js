// Coordenadas del centro del mapa en Ica, Perú
var center = [-14.0674, -75.7285]; // Ica, Perú

// Crea un nuevo mapa de Leaflet y lo coloca en el elemento con el id "map"
var map = L.map("map").setView(center, 14); // 14 es el nivel de zoom inicial

// Carga el archivo JSON
fetch("cobertura.js")
  .then((response) => response.json())
  .then((data) => {
    // Itera sobre cada conjunto de coordenadas y dibuja un polígono
    data.aData.forEach((coordinateSet) => {
      var polygonPoints = coordinateSet.map(function (point) {
        return [point.lat, point.lng];
      });

      var polygon = L.polygon(polygonPoints, {
        color: "blue", // Color del borde del polígono
        fillColor: "blue", // Color del relleno del polígono
        fillOpacity: 0.5, // Opacidad del relleno
      }).addTo(map);

      // Añade una etiqueta emergente al polígono
      polygon.bindPopup("Con cobertura");

      // Cuando el mouse pasa sobre el polígono, muestra la etiqueta emergente
      polygon.on("mouseover", function (e) {
        this.openPopup();
      });

      // Cuando el mouse sale del polígono, cierra la etiqueta emergente
      polygon.on("mouseout", function (e) {
        this.closePopup();
      });
    });
  });

var numeroClientes = 0;

// Crear conjuntos para cada campo único
const departamentosSet = new Set();
const provinciasSet = new Set();
const distritosSet = new Set();
const segmentosSet = new Set();

// Polígonos de cobertura
var coveragePolygons = [];

// Función para verificar si un punto está dentro de un polígono
function isPointInsidePolygon(point, polygon) {
  var x = point[0];
  var y = point[1];
  var inside = false;

  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    var xi = polygon[i][0];
    var yi = polygon[i][1];
    var xj = polygon[j][0];
    var yj = polygon[j][1];

    var intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// Función para procesar los datos y mostrar empresas dentro de los polígonos
function processData(jsonData) {
  jsonData.forEach((item) => {
    let cliente = item.cliente;
    let ruc = item.ruc;
    let segmento = item.segmento;
    let latitud = parseFloat(item.latitud);
    let longitud = parseFloat(item.longitud);

    departamentosSet.add(item.departamento);
    provinciasSet.add(item.provincia);
    distritosSet.add(item.distrito);
    segmentosSet.add(item.segmento);

    // Verifica si el punto (latitud, longitud) está dentro de algún polígono de cobertura
    const point = [longitud, latitud];
    const insideCoverage = coveragePolygons.some((polygon) =>
      isPointInsidePolygon(point, polygon)
    );

    if (cliente && !isNaN(latitud) && !isNaN(longitud) && insideCoverage) {
      var marker = L.marker([latitud, longitud]).addTo(map);
      marker.bindPopup(
        "RUC: " + ruc + " Razón social: " + cliente + " Segmento: " + segmento
      );
      numeroClientes++;
    }
  });
}
let jsonData; // Declara la variable jsonData antes de usarla
// Carga el archivo JSON de polígonos de cobertura
fetch("cobertura.js")
  .then((response) => response.json())
  .then((data) => {
    // Construye los polígonos de cobertura
    coveragePolygons = data.aData.map((coordinateSet) =>
      coordinateSet.map((point) => [point.lng, point.lat])
    );

    const departamentos = [
      "Amazonas",
      "Ancash",
      "Apurimac",
      "Arequipa",
      "Ayacucho",
      "Cajamarca",
      "Callao",
      "Cusco",
      "Huancavelica",
      "Huanuco",
      "Ica",
      "Junin",
      "La Libertad",
      "Lambayeque",
      "Lima",
      "Loreto",
      "Madre de Dios",
      "Moquegua",
      "Pasco",
      "Piura",
      "Puno",
      "San Martin",
      "Tacna",
      "Tumbes",
      "Ucayali",
      null,
    ];

    // Obtén una referencia al elemento 'select' por su ID
    const departamentoSelect = document.getElementById("departamento-filter");

    // Agrega un controlador de eventos al elemento 'select'
    departamentoSelect.addEventListener("change", function () {
      // Obtiene el valor seleccionado en el 'select'
      const selectedDepartamento = departamentoSelect.value;
      console.log(selectedDepartamento);

      // Construye la URL del archivo JSON en función del departamento seleccionado
      const jsonUrl = selectedDepartamento
        ? `departamentos/${selectedDepartamento.toLowerCase()}.json`
        : "clientes.json";

      // Limpia el mapa de marcadores
      clearMapMarkers();

      // Carga y procesa el archivo JSON correspondiente
      fetch(jsonUrl)
        .then((response) => response.json())
        .then((data) => {
          jsonData = data; // Asigna los datos a la variable jsonData
          processData(data);

          // Luego, convertir conjuntos en arrays y ordenar alfabéticamente (opcional)
          const departamentos = Array.from(departamentosSet).sort();
          const provincias = Array.from(provinciasSet).sort();
          const distritos = Array.from(distritosSet).sort();
          const segmentos = Array.from(segmentosSet).sort();

          // Llenar las listas desplegables con las opciones únicas
          const departamentoSelect = document.getElementById(
            "departamento-filter"
          );
          const provinciaSelect = document.getElementById("provincia-filter");
          const distritoSelect = document.getElementById("distrito-filter");
          const segmentoSelect = document.getElementById("segmento-filter");

          departamentos.forEach((departamento) => {
            const option = document.createElement("option");
            option.value = departamento;
            option.textContent = departamento;
            departamentoSelect.appendChild(option);
          });

          provincias.forEach((provincia) => {
            const option = document.createElement("option");
            option.value = provincia;
            option.textContent = provincia;
            provinciaSelect.appendChild(option);
          });

          distritos.forEach((distrito) => {
            const option = document.createElement("option");
            option.value = distrito;
            option.textContent = distrito;
            distritoSelect.appendChild(option);
          });

          segmentos.forEach((segmento) => {
            const option = document.createElement("option");
            option.value = segmento;
            option.textContent = segmento;
            segmentoSelect.appendChild(option);
          });

          // Mostrar las listas en la consola
          console.log("Departamentos:", departamentos);
          console.log("Provincias:", provincias);
          console.log("Distritos:", distritos);
          console.log("Segmentos:", segmentos);
        });
    });
    // Itera sobre la lista de departamentos y crea opciones para cada uno
    departamentos.forEach((departamento) => {
      const option = document.createElement("option");
      option.value = departamento; // El valor de la opción será el nombre del departamento
      option.textContent = departamento; // El texto visible de la opción también será el nombre del departamento
      departamentoSelect.appendChild(option); // Agrega la opción al elemento 'select'
    });

    // Luego, carga el archivo JSON de empresas
    fetch("clientes.json")
      .then((response) => response.json())
      .then((data) => {
        jsonData = data; // Asigna los datos a la variable jsonData
        processData(data);

        // Luego, convertir conjuntos en arrays y ordenar alfabéticamente (opcional)
        const departamentos = Array.from(departamentosSet).sort();
        const provincias = Array.from(provinciasSet).sort();
        const distritos = Array.from(distritosSet).sort();
        const segmentos = Array.from(segmentosSet).sort();

        // Llenar las listas desplegables con las opciones únicas
        const departamentoSelect = document.getElementById(
          "departamento-filter"
        );
        const provinciaSelect = document.getElementById("provincia-filter");
        const distritoSelect = document.getElementById("distrito-filter");
        const segmentoSelect = document.getElementById("segmento-filter");

        departamentos.forEach((departamento) => {
          const option = document.createElement("option");
          option.value = departamento;
          option.textContent = departamento;
          departamentoSelect.appendChild(option);
        });

        provincias.forEach((provincia) => {
          const option = document.createElement("option");
          option.value = provincia;
          option.textContent = provincia;
          provinciaSelect.appendChild(option);
        });

        distritos.forEach((distrito) => {
          const option = document.createElement("option");
          option.value = distrito;
          option.textContent = distrito;
          distritoSelect.appendChild(option);
        });

        segmentos.forEach((segmento) => {
          const option = document.createElement("option");
          option.value = segmento;
          option.textContent = segmento;
          segmentoSelect.appendChild(option);
        });

        // Mostrar las listas en la consola
        console.log("Departamentos:", departamentos);
        console.log("Provincias:", provincias);
        console.log("Distritos:", distritos);
        console.log("Segmentos:", segmentos);
      });
  });

// Agregar una etiqueta HTML para mostrar el número de clientes
var numeroClientesLabel = L.control({ position: "topleft" });

numeroClientesLabel.onAdd = function (map) {
  var div = L.DomUtil.create("div", "numero-clientes-label");
  div.innerHTML = 'Número de clientes: <span id="numero-clientes">0</span>';
  return div;
};

numeroClientesLabel.addTo(map);

// Carga y muestra un mapa base de OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Obtén una referencia al botón de restablecimiento
const resetFiltersButton = document.getElementById("reset-filters-button");

// Agrega un controlador de eventos al botón
resetFiltersButton.addEventListener("click", function () {
  // Restablece los valores de las listas desplegables a su valor por defecto
  document.getElementById("departamento-filter").selectedIndex = 0;
  document.getElementById("provincia-filter").selectedIndex = 0;
  document.getElementById("distrito-filter").selectedIndex = 0;
  document.getElementById("segmento-filter").selectedIndex = 0;

  // Limpia el mapa de marcadores
  clearMapMarkers();

  // Vuelve a cargar y procesar los datos originales
  fetch("clientes.json")
    .then((response) => response.json())
    .then((data) => processData(data));
});

// Función para eliminar todos los marcadores del mapa
function clearMapMarkers() {
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
}

// Obtén una referencia al botón de aplicar filtros
const applyFiltersButton = document.getElementById("apply-filters");

// Agrega un controlador de eventos al botón
applyFiltersButton.addEventListener("click", function () {
  // Obtén los valores seleccionados de las listas desplegables
  const departamentoFilter = document.getElementById(
    "departamento-filter"
  ).value;
  const provinciaFilter = document.getElementById("provincia-filter").value;
  const distritoFilter = document.getElementById("distrito-filter").value;
  const segmentoFilter = document.getElementById("segmento-filter").value;

  // Filtra los datos en función de los valores seleccionados
  const filteredData = jsonData.filter((item) => {
    return (
      (departamentoFilter === "" || item.departamento === departamentoFilter) &&
      (provinciaFilter === "" || item.provincia === provinciaFilter) &&
      (distritoFilter === "" || item.distrito === distritoFilter) &&
      (segmentoFilter === "" || item.segmento === segmentoFilter)
    );
  });

  // Limpia el mapa de marcadores
  clearMapMarkers();

  // Procesa los datos filtrados
  processData(filteredData);
});

// Obtén una referencia al botón de búsqueda y al campo de entrada RUC
const searchButton = document.getElementById("ruc-search");
const rucInput = document.getElementById("ruc-text");

searchButton.addEventListener("click", function () {
  // Obtiene el valor del campo de entrada RUC
  const ruc = rucInput.value;
  console.log(ruc);

  // Luego, carga el archivo JSON de empresas
  fetch("bd.json")
    .then((response) => response.json())
    .then((jsonDataNew) => {
      // Busca el RUC en los datos JSON y obtiene las coordenadas si se encuentra
      const ruc = rucInput.value.trim(); // trim() para eliminar espacios en blanco

      const foundItem = jsonDataNew.find((item) => item.ruc.toString() === ruc);

      console.log(foundItem);

      if (foundItem) {
        const latitud = parseFloat(foundItem.latitud);
        const longitud = parseFloat(foundItem.longitud);

        // Verifica si las coordenadas son válidas
        if (!isNaN(latitud) && !isNaN(longitud)) {
          // Centra el mapa en las coordenadas del RUC y agrega un marcador
          map.setView([latitud, longitud], 14);
          const marker = L.marker([latitud, longitud]).addTo(map);

          // Abre una ventana emergente con información del RUC
          marker
            .bindPopup("RUC: " + ruc + " Razón social: " + foundItem.cliente)
            .openPopup();
        } else {
          // Muestra un mensaje si las coordenadas no son válidas
          alert("Las coordenadas del RUC no son válidas.");
        }
      } else {
        // Muestra un mensaje si no se encuentra el RUC
        alert("RUC no encontrado en los datos.");
      }
    });
});

// Agrega un controlador de eventos al botón de búsqueda
