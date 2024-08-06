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

async function renderMap() {

  const frame = new L.LatLngBounds(new L.LatLng(32, -122.292293), new L.LatLng(45.500295, -73.567149))

  const map = L.map(document.querySelector(".map"), { attributionControl: false });

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  L.control.scale({ position: 'bottomleft' })
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

  L.marker([42.641298, -73.741554])
    .bindTooltip(`<div class="city title">Albany</div>`)
    .addTo(map);
  L.marker([41.878773, -87.638622])
    .bindTooltip(`<div class="city title">Chicago</div>`)
    .addTo(map);
  L.marker([47.597811, -122.329564])
    .bindTooltip(`<div class="city title">Seattle</div>`)
    .addTo(map);
  L.marker([37.840341, -122.292293])
    .bindTooltip(`<div class="city title">San Francisco</div>`)
    .addTo(map);
  L.marker([34.055863, -118.234245])
    .bindTooltip(`<div class="city title">Los Angeles</div>`)
    .addTo(map);
  L.marker([29.946275, -90.078913])
    .bindTooltip(`<div class="city title">La Nouvelle-Orléans</div>`)
    .addTo(map);
  L.marker([40.750262, -73.992824])
    .bindTooltip(`<div class="city title">New York</div>`)
    .addTo(map);
  L.marker([45.500295, -73.567149])
    .bindTooltip(`<div class="city title">Montréal</div>`)
    .addTo(map);
  L.marker([38.898487, -77.005291])
    .bindTooltip(`<div class="city title">Washington</div>`)
    .addTo(map);

  map.fitBounds(frame);

  var center_default = map.getCenter()
  var zoom_default = map.getZoom()

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

  var yellowIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  var sections = [
    {
      route: "Sunset Limited",
      origin: {
        code: "NOL",
        date: "2024-08-05T09:00:00-05:00"
      },
      dest: {
        code: "LAX",
        date: "2024-08-07T05:35:00-07:00"
      },
    },
    {
      route: "Coast Starlight",
      origin: {
        code: "LAX",
        date: "2024-08-07T09:51:00-07:00"
      },
      dest: {
        code: "SEA",
        date: "2024-08-08T19:51:00-07:00"
      },
    }]

  var today = new Date();
  var cur_section = sections.filter(section => today >= new Date(section.origin.date) && today <= new Date(section.dest.date))
  console.log(cur_section)

  var stations = await fetch("https://api-v3.amtraker.com/v3/stations")
    .then(res => res.json())
    .then(res => { return res })
  console.log(stations)

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