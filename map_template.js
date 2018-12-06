//const build = require('./build.js');

//console.log(build.myTest)
let map;

    let bostonLatLng = {{bostonLatLng}} ;

      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: bostonLatLng[0].loc,
          zoom: 12
        });
      

        stationJSON.forEach((station) => {
          var marker = new google.maps.Marker({
            position:{lng: parseFloat(station.lon), lat: parseFloat(station.lat)},
            map: map,
            title: station.name
          })      

      })
      }