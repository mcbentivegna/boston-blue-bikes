let map;


      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lng: parseFloat(stationJSON[0].lon), lat: parseFloat(stationJSON[0].lat)},
          zoom: 12
        });
      

        stationJSON.forEach((station) => {
          var marker = new google.maps.Marker({
            position:{lng: parseFloat(station.lon), lat: parseFloat(station.lat)},
            map: map,
            title: `${station.name} \nBikes Available: ${station.stationStatus.num_bikes_available}\nDocks Available: ${station.stationStatus.num_docks_available} \nCapacity: ${station.capacity}`
          })      

      })
      }