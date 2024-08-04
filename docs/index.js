async function renderMap() {
  const map = L.map(document.querySelector(".map"));

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  L.control.scale().addTo(map);

  L.marker([42.641298, -73.741554]).bindTooltip(`<div class="city title">Albany</div>`).addTo(map);
  L.marker([41.878773, -87.638622]).bindTooltip(`<div class="city title">Chicago</div>`).addTo(map);
  L.marker([47.597811, -122.329564]).bindTooltip(`<div class="city title">Seattle</div>`).addTo(map);
  L.marker([37.840341, -122.292293]).bindTooltip(`<div class="city title">San Francisco</div>`).addTo(map);
  //L.marker([40.944502, -90.363511]).bindTooltip(`<div class="city title">Galesburg</div>`).addTo(map);
  L.marker([34.055863, -118.234245]).bindTooltip(`<div class="city title">Los Angeles</div>`).addTo(map);
  L.marker([29.946275, -90.078913]).bindTooltip(`<div class="city title">La Nouvelle-Orléans</div>`).addTo(map);
  L.marker([40.750262, -73.992824]).bindTooltip(`<div class="city title">New York</div>`).addTo(map);
  L.marker([45.500295, -73.567149]).bindTooltip(`<div class="city title">Montréal</div>`).addTo(map);
  L.marker([38.898487, -77.005291]).bindTooltip(`<div class="city title">Washington</div>`).addTo(map);

  map.fitBounds(new L.LatLngBounds(new L.LatLng(32, -122.292293), new L.LatLng(45.500295, -73.567149)));

  for await (let name of ['Adirondack', 'Lake_Shore_Limited', 'Empire_Builder', 'Sunset_Limited', 'Crescent', 'Coast_Starlight']) {
    await fetch(`https://raw.githubusercontent.com/tlecardo/USProject/main/USTracks/${name}.gpx`)
      .then(res => res.text())
      .then(res => {

        let time = res.match(/time = [0-9]*h [0-9]*m/)[0]
          .replace("time = ", "")

        let dist = res.match(/track-length = [0-9]* filtered/)[0]
          .replace("track-length = ", "")
          .replace(" filtered", "")

        dist = Math.round(dist / 100) / 10
        dist = parseInt(dist).toLocaleString()

        new L.GPX(res, {
          async: true,
          marker_options: { startIconUrl: '', endIconUrl: '', shadowUrl: '' },
          polyline_options: { color: "blue", opacity: 0.7, dashArray: "5 10" },
        }).bindTooltip(
          `<div class="track title">${name.replaceAll("_", " ")}</div><div class="track info">${dist} kms</div><div class="track info">${time}</div>`,
          { sticky: true, }
        ).addTo(map);
      })
  }

  for await (let name of ['California_Zephyr', 'Southwest_Chief']) {
    await fetch(`https://raw.githubusercontent.com/tlecardo/USProject/main/USTracks/${name}.gpx`)
      .then(res => res.text())
      .then(res => {

        let time = res.match(/time = [0-9]*h [0-9]*m/)[0]
          .replace("time = ", "")

        let dist = res.match(/track-length = [0-9]* filtered/)[0]
          .replace("track-length = ", "")
          .replace(" filtered", "")

        dist = Math.round(dist / 100) / 10
        dist = parseInt(dist).toLocaleString()

        new L.GPX(res, {
          async: true,
          marker_options: { startIconUrl: '', endIconUrl: '', shadowUrl: '' },
          polyline_options: { color: "blue", opacity: 0.3, dashArray: "5 10" },
        }).bindTooltip(
          `<div class="track title">${name.replaceAll("_", " ")}</div><div class="track info">${dist} kms</div><div class="track info">${time}</div>`,
          { sticky: true, }
        ).addTo(map);
      })
  }

  // test

  var yellowIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  let sections = [
    {
      route: "Sunset Limited",
      origin: {
        code: "NOL",
        date: "2024-08-03T09:00:00"
      },
      dest: {
        code: "LAX",
        date: "2024-08-05T05:35:00"
      },
    },
    {
      route: "Coast Starlight",
      origin: {
        code: "LAX",
        date: "2024-08-05T09:51:00"
      },
      dest: {
        code: "SEA",
        date: "2024-08-06T19:51:00"
      },
    }]

  var today = new Date();
  let current_section = sections.filter(section => today >= new Date(section.origin.date) && today <= new Date(section.dest.date))[0]

  console.log(current_section)

  await fetch("https://api-v3.amtraker.com/v3/trains")
    .then(res => res.json())
    .then(res => {

      console.log(res)

      let cur_travel = Object.values(res).filter(value =>
        value[0].routeName === current_section.route
        && value[0].stations.at(-1).code === current_section.dest.code
        && value[0].stations[0].code === current_section.origin.code
        && value[0].stations.at(-1).schDep.includes(current_section.dest.date)
        && value[0].stations[0].schDep.includes(current_section.origin.date)
      )[0][0]

      console.log(cur_travel)
      let currrent_pos = [cur_travel.lat, cur_travel.lon]
      L.marker(currrent_pos, { icon: yellowIcon })
        .bindTooltip(`<div class="city title">Train courant</div>`)
        .addTo(map)

      var update_date = new Date(cur_travel.updatedAt)
      var diff_update = new Date(today - update_date)
      var seconds = `${diff_update.getSeconds()}`.padStart(2, "0")
      var minutes = `${diff_update.getMinutes()}`

      /*
      <i class="icon" style="background-image: url(https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png);background-repeat: no-repeat;"></i>
      */

      var legend = L.control({ position: "bottomleft" });
      legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += `<h4>Informations (act. ${minutes}' ${seconds}'')</h4>`;
        div.innerHTML += `<span>Vitesse actuelle : ${(1.609344 * cur_travel.velocity).toFixed(2)} km/h</span><br>`;
        div.innerHTML += `<span>Prochain arrêt : ${cur_travel.eventName}</span><br>`;
        return div;
      };

      legend.addTo(map);
    }
    )

}

renderMap().catch(console.error)