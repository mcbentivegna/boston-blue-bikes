let map;
let baseHeatMap;
let heatmap;
let stations = stationJSON
	

      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lng: parseFloat(stations[0].lon), lat: parseFloat(stations[0].lat)},
          zoom: 12
        });
      

        stations.forEach((station) => {
          var marker = new google.maps.Marker({
            position:{lng: parseFloat(station.lon), lat: parseFloat(station.lat)},
            map: map,
            title: `${station.name} \nBikes Available: ${station.stationStatus.num_bikes_available}\nDocks Available: ${station.stationStatus.num_docks_available} \nCapacity: ${station.capacity}`
          })      

      })

        var baseHeatMapBikes = new google.maps.Map(document.getElementById('heatmapBikes'), {
          center: {lng: parseFloat(stations[0].lon), lat: parseFloat(stations[0].lat)},
          zoom: 12,
          
        });

       
        heatmapBikes = new google.maps.visualization.HeatmapLayer({
          data: getPointsWeightBikes(),
          map: baseHeatMapBikes,
          radius:20
        });

        var baseHeatMapDocks = new google.maps.Map(document.getElementById('heatmapDocks'), {
          center: {lng: parseFloat(stations[0].lon), lat: parseFloat(stations[0].lat)},
          zoom: 12,
          
        });

       
        heatmapDocks = new google.maps.visualization.HeatmapLayer({
          data: getPointsWeightDocks(),
          map: baseHeatMapDocks,
          radius:20
        });

        var baseHeatMapStations = new google.maps.Map(document.getElementById('heatmapStations'), {
          center: {lng: parseFloat(stations[0].lon), lat: parseFloat(stations[0].lat)},
          zoom: 12,
          
        });

       
        heatmapStations = new google.maps.visualization.HeatmapLayer({
          data: getPointsNoWeight(),
          map: baseHeatMapStations,
          radius:20
        });
   
      }

    
      function getPointsWeightBikes(){
      	points = [];
      	stations.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {location:newLoc, weight:station.stationStatus.num_bikes_available}
      		points.push(newPoint)
      	})
      	return points
      }

      function getPointsWeightDocks(){
      	points = [];
      	stations.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {location:newLoc, weight:station.stationStatus.num_docks_available}
      		points.push(newPoint)
      	})
      	return points
      }

      function getPointsNoWeight(){
      	points = [];
      	stations.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		points.push(newLoc)
      	})
      	return points
      }

      function changeRadius() {
        heatmap.set('radius', heatmap.get('radius') ? null : 30);
        console.log(heatmap.get('radius'))
      }

