let convertString = function (milisecs) {
  var diff_hours = Math.floor(milisecs / 3600, 1)
  var diff_minutes = (milisecs - 3600 * diff_hours) / 60
  return `${diff_hours}h${diff_minutes}m`
}

let getCity = async function (pos) {
  return await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos[0]}&lon=${pos[1]}`)
    .then(res => res.json())
    .then(res => {
      var key_city = Object.keys(res.address).includes("city") ? "city" : (
        Object.keys(res.address).includes("town") ? "town" : (
          Object.keys(res.address).includes("village") ? "village" : null))

      var town = key_city ? new String(res.address[key_city]) : "----"
      var state = new String(res.address["ISO3166-2-lvl4"].split("-")[1])
      return `${town.slice(0, 20)} (${state})`
    })
}

var yellowIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

async function renderMap() {

  var iconCity = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#3d4be1;' class='marker-pin'></div><i class='material-icons'>location_city</i>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  var iconTrain = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#3d4be1;' class='marker-pin'></div><i class='material-icons'>train</i>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  var iconShelter = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#3d4be1;' class='marker-pin'></div><i class='material-icons'>night_shelter</i>",
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });

  const frame = new L.LatLngBounds(new L.LatLng(32, -122.292293), new L.LatLng(45.500295, -73.567149))

  const map = L.map(document.querySelector(".map"), { attributionControl: false });

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  L.control.scale({ position: 'topright' })
    .addTo(map);

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += `<h4>Informations</h4>`;
    div.innerHTML += `<center><span>---- (---)</span></center>`;
    div.innerHTML += `<span>Vitesse actuelle : --.-- km/h</span><br>`;
    div.innerHTML += `<span>Prochaine destination : ---- (---)</span><br>`;
    return div;
  };
  legend.addTo(map);

  var cityMarkers = new L.FeatureGroup();
  var stationMarkers = new L.FeatureGroup();

  var mask = x => `https://lh3.googleusercontent.com/d/${x}`
  var id_lists = {
    "Montréal": [],
    "Albany": ["15pMnwo8LR6HVG8c7JfXTsNf8KReG5boF"],
    "Chicago": [],
    "Seattle": [],
    "San Francisco": [],
    "Los Angeles": [],
    "El Paso": [],
    "La Nouvelle-Orléans": [],
    "Washington": [],
    "New York": []
  }

  let htmlPage = x => `<div class="city title">${x}</div>${id_lists[x].reduce((prev, id, idx) => prev + `<img class="photos" src="${mask(id)}" hspace="3" />${idx % 2 ? "<br>" : ""}`, "")}`

  cityMarkers.addLayer(L.marker([42.6511674, -73.754968], { icon: iconCity })
    .bindTooltip(htmlPage("Albany")))
  cityMarkers.addLayer(L.marker([41.878773, -87.638622], { icon: iconCity })
    .bindTooltip(htmlPage("Chicago")))
  cityMarkers.addLayer(L.marker([47.597811, -122.329564], { icon: iconCity })
    .bindTooltip(htmlPage("Seattle")))
  cityMarkers.addLayer(L.marker([37.7792588, -122.4193286], { icon: iconCity })
    .bindTooltip(htmlPage("San Francisco")))
  cityMarkers.addLayer(L.marker([34.0536909, -118.242766], { icon: iconCity })
    .bindTooltip(htmlPage("Los Angeles")))
  cityMarkers.addLayer(L.marker([29.946275, -90.078913], { icon: iconCity })
    .bindTooltip(htmlPage("La Nouvelle-Orléans")))
  cityMarkers.addLayer(L.marker([40.750262, -73.992824], { icon: iconCity })
    .bindTooltip(htmlPage("New York")))
  cityMarkers.addLayer(L.marker([45.500295, -73.567149], { icon: iconCity })
    .bindTooltip(htmlPage("Montréal")))
  cityMarkers.addLayer(L.marker([38.898487, -77.005291], { icon: iconCity })
    .bindTooltip(htmlPage("Washington")))
  cityMarkers.addLayer(L.marker([31.7575839, -106.49583], { icon: iconCity })
    .bindTooltip(htmlPage("El Paso")))

  stationMarkers.addLayer(L.marker([42.641298, -73.741554], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Albany-Rensselaer Station</div>`))
  stationMarkers.addLayer(L.marker([41.878773, -87.638622], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Chicago Union Station</div>`))
  stationMarkers.addLayer(L.marker([47.597811, -122.329564], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Seattle King Street</div>`))
  stationMarkers.addLayer(L.marker([37.79370106439311, -122.27162491397662], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Oakland Jack London Station</div>`))
  stationMarkers.addLayer(L.marker([34.055863, -118.234245], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Union Station</div>`))
  stationMarkers.addLayer(L.marker([29.946275, -90.078913], { icon: iconTrain })
    .bindTooltip(`<div class="city title">New-Orleans Station</div>`))
  stationMarkers.addLayer(L.marker([40.750262, -73.992824], { icon: iconTrain })
    .bindTooltip(`<div class="city title">New-York Penn Station</div>`))
  stationMarkers.addLayer(L.marker([45.500295, -73.567149], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Gare Centrale</div>`))
  stationMarkers.addLayer(L.marker([38.898487, -77.005291], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Washington Union Station</div>`))
  stationMarkers.addLayer(L.marker([31.7575839, -106.49583], { icon: iconTrain })
    .bindTooltip(`<div class="city title">Union Depot</div>`))

  map.fitBounds(frame);

  var center_default = map.getCenter()
  var zoom_default = map.getZoom()

  var AlbLog = L.marker([42.6729622, -73.783004], { icon: iconShelter })
    .bindTooltip(`<div class="city title">AirBnB</div>`)

  var ChiLog = L.marker([41.87562082670103, -87.6264550090755], { icon: iconShelter })
    .bindTooltip(`<div class="city title">HI Chicago Hostel</div>`)

  var SeaLog = L.marker([47.7364269, -122.3460506], { icon: iconShelter })
    .bindTooltip(`<div class="city title">Americas Inn and Suite</div>`)

  var SFLog = L.marker([37.7879, -122.411994], { icon: iconShelter })
    .bindTooltip(`<div class="city title">Fitzgerald Hotel Union Square</div>`)

  var LALog = L.marker([34.0442543, -118.3035257], { icon: iconShelter })
    .bindTooltip(`<div class="city title">AirBnB</div>`)

  var EPLog = L.marker([31.8158525, -106.5175854], { icon: iconShelter })
    .bindTooltip(`<div class="city title">AirBnB</div>`)

  var NOLog = L.marker([29.9680541, -90.0923779], { icon: iconShelter })
    .bindTooltip(`<div class="city title">India House Hostel</div>`)

  var WALog = L.marker([38.9217766, -77.042119], { icon: iconShelter })
    .bindTooltip(`<div class="city title">Washington International Student Center</div>`)

  var shelterMarkers = new L.FeatureGroup();
  shelterMarkers.addLayer(AlbLog);
  shelterMarkers.addLayer(ChiLog);
  shelterMarkers.addLayer(SeaLog);
  shelterMarkers.addLayer(SFLog);
  shelterMarkers.addLayer(LALog);
  shelterMarkers.addLayer(EPLog);
  shelterMarkers.addLayer(NOLog);
  shelterMarkers.addLayer(WALog);

  map.addLayer(cityMarkers);

  map.on('zoomend', function () {
    if (map.getZoom() < 12) {
      map.removeLayer(shelterMarkers);
      map.removeLayer(stationMarkers);
      map.addLayer(cityMarkers);
    } else {
      map.addLayer(shelterMarkers);
      map.addLayer(stationMarkers);
      map.removeLayer(cityMarkers);
    }
  });

  await fetch(`https://raw.githubusercontent.com/tlecardo/USProject/main/USTracks/Amtrak_tracks.geojson`)
    .then(res => res.json())
    .then(res => {
      new L.geoJSON(res, {
        onEachFeature: function (feature, layer) {
          layer.bindTooltip(
            `<center class="track title">${feature.properties.name}</center>` +
            `<center>${(feature.properties.distance / 1000).toFixed(2)} km</center>` +
            `<center>${convertString(feature.properties.time / 1000)}</center>`,
            { sticky: true, });
        },
        async: true,
        marker_options: { startIconUrl: '', endIconUrl: '', shadowUrl: '' },
        style: { color: "blue", opacity: 0.5, dashArray: "5 10" },
      }).addTo(map);
    })

  // test

  var sections = [
    {
      route: "Adirondack",
      origin: {
        code: "MTR",
        date: ""
      },
      dest: {
        code: "ALB",
        date: ""
      },
    },
    {
      route: "Lake Shore Limited",
      origin: {
        code: "ALB",
        date: ""
      },
      dest: {
        code: "CHI",
        date: ""
      },
    },
    {
      route: "Empire Builder",
      origin: {
        code: "CHI",
        date: ""
      },
      dest: {
        code: "SEA",
        date: ""
      },
    },
    {
      route: "Coast Starlight",
      origin: {
        code: "SEA",
        date: ""
      },
      dest: {
        code: "EMY",
        date: ""
      },
    },
    {
      route: "Coast Starlight",
      origin: {
        code: "EMY",
        date: ""
      },
      dest: {
        code: "LAX",
        date: ""
      },
    },
    {
      route: "Sunset Limited",
      origin: {
        code: "LAX",
        date: ""
      },
      dest: {
        code: "ELP",
        date: ""
      },
    },
    {
      route: "Sunset Limited",
      origin: {
        code: "ELP",
        date: ""
      },
      dest: {
        code: "NOL",
        date: ""
      },
    },
    {
      route: "Crescent",
      origin: {
        code: "NOL",
        date: ""
      },
      dest: {
        code: "WAS",
        date: ""
      },
    },
    {
      route: "",
      origin: {
        code: "WAS",
        date: ""
      },
      dest: {
        code: "NYP",
        date: ""
      },
    },
    ,
    {
      route: "Adirondack",
      origin: {
        code: "NYP",
        date: ""
      },
      dest: {
        code: "MTR",
        date: ""
      },
    }
  ]


  sections = [
    {
      route: "Sunset Limited",
      origin: {
        code: "NOL",
        date: "2024-08-31T09:00:00-05:00"
      },
      dest: {
        code: "LAX",
        date: "2024-09-02T05:35:00-07:00"
      },
    }
    ]

  var today = new Date();
  var cur_section = sections.filter(section => today >= new Date(section.origin.date) && today <= new Date(section.dest.date))
  //console.log(cur_section)

  var stations = await fetch("https://api-v3.amtraker.com/v3/stations")
    .then(res => res.json())
    .then(res => { return res })
  //console.log(stations)

  var trains = await fetch("https://api-v3.amtraker.com/v3/trains")
    .then(res => res.json())
    .then(res => { return Object.values(res).flat(Infinity) })
  console.log(trains)

  if (cur_section.length > 0) {

    cur_section = cur_section[0]

    cur_travel = trains
      .filter(value => value.routeName === cur_section.route
        && value.trainState === "Active")
      .filter(value => {
        var nb_match = value.stations.reduce(
          (prev, cur) => prev + (cur.code === cur_section.dest.code && cur.schDep.includes(cur_section.dest.date))
            || (cur.code === cur_section.origin.code && cur.schDep.includes(cur_section.origin.date)), 0)
        return nb_match === 2
      })[0]

    console.log(cur_travel)

    var schDestDate = new Date(cur_travel.stations.at(-1).schDep)
    var curDestDate = new Date(cur_travel.stations.at(-1).dep)
    var diff_delay = (schDestDate - curDestDate) / 1000

    let cur_pos = [cur_travel.lat, cur_travel.lon]
    var marker = L.marker(cur_pos, { icon: yellowIcon })
      .addTo(map)

    marker.on('click', function (e) {
      var zoom = map.getZoom()
      map.flyTo(
        zoom === 10 ? center_default : e.latlng,
        zoom === 10 ? zoom_default : 10,
        {
          animate: true,
          duration: 1
        });
    });

    var cur_loc = await getCity(cur_pos)

    var next_travel = stations[cur_travel.eventCode]
    let next_pos = [next_travel.lat, next_travel.lon]
    var next_loc = await getCity(next_pos)

    var update_date = new Date(cur_travel.updatedAt)
    var diff_update = new Date(today - update_date)
    var seconds = `${diff_update.getSeconds()}`.padStart(2, "0")
    var minutes = `${diff_update.getMinutes()}`

    legend.onAdd = function (map) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += `<h4>Informations (act. ${minutes}' ${seconds}'')</h4>`;
      div.innerHTML += `<center><span>${cur_loc}</span></center>`;
      div.innerHTML += `<span>Vitesse actuelle : ${(1.609344 * cur_travel.velocity).toFixed(2)} km/h</span><br>`;
      div.innerHTML += `<span>Prochain arrêt : ${next_loc}</span><br>`;
      //div.innerHTML += `<span>Retard de ${convertString(diff_delay)}</span><br>`;
      return div;
    };
    legend.addTo(map);
  } else {

    var cur_code = "MTR"
    var next_code = "ALB"
    for (let idx = 0; idx < sections.length; idx++) {
      if (new Date(sections[idx].dest.date) <= today && new Date(sections[idx + 1].dest.date) >= today) {
        cur_code = sections[idx].dest.code
        next_code = sections[idx + 1].dest.code
        break
      }
    }

    var cur_station = stations[cur_code]
    var next_term = stations[next_code]

    let cur_pos = [cur_station.lat, cur_station.lon]
    L.marker(cur_pos, { icon: yellowIcon })
      .addTo(map)

    legend.onAdd = function (map) {
      var div = L.DomUtil.create("div", "legend");
      div.innerHTML += `<h4>Informations</h4>`;
      div.innerHTML += `<span>${cur_station.city} (${cur_station.state})</span><br>`;
      div.innerHTML += `<span>Vitesse actuelle : --.-- km/h</span><br>`;
      div.innerHTML += `<span>Prochaine destination : ${next_term.city} (${next_term.state})</span><br>`;
      return div;
    };

    legend.addTo(map);
  }
}

renderMap().catch(console.error)