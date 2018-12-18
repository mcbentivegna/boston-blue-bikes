//we pull in the points we want from the JSON file we created in build.js 
let points = stationJSON

//defining our map variables - we'll need to use these to build the actual maps.
let map;
let baseHeatMapBikes;
let heatMapBikes
let baseHeatMapDocks;
let heatMapDocks
let baseHeatMapSystem;
let heatMapSystem;
let baseHeatMapRatio;
let heatMapRatio;

//let's define some of the map characteristics we'll want for all maps
let centerLng = points.reduce((accumulator, currentValue) => accumulator + currentValue.lon,0)/points.length
let centerLat = points.reduce((accumulator, currentValue) => accumulator + currentValue.lat,0)/points.length
let baseZoom = 12;
let baseRadius = 20;

//This function is where we initiate our maps. This function is called in the "callback" query string of the google maps api url
      function initMap() {

      	//this is a map showing all the stations and their details
        var map = new google.maps.Map(document.getElementById('map'), {
          center: {lng: centerLng, lat: centerLat},
          zoom: baseZoom
        });
      

        points.forEach((station) => {
          var marker = new google.maps.Marker({
            position:{lng: parseFloat(station.lon), lat: parseFloat(station.lat)},
            map: map,
            title: `${station.name} \nBikes Available: ${station.stationStatus.num_bikes_available}\nDocks Available: ${station.stationStatus.num_docks_available} \nCapacity: ${station.capacity}`
          })      

      })

        //we can just use our make heatmap function here...
        makeHeatMap(baseHeatMapBikes, heatMapBikes, 'heatmapBikes', getPointsWeightBikes(), baseRadius, baseZoom)
        makeHeatMap(baseHeatMapDocks, heatMapDocks, 'heatmapDocks', getPointsWeightDocks(), baseRadius, baseZoom)
        makeHeatMap(baseHeatMapSystem, heatMapSystem, 'heatmapSystem', getPointsWeightSystem(), baseRadius, baseZoom)
        //makeHeatMap(baseHeatMapRatio, heatMapRatio, 'heatmapRatio', getPointsRatio(), baseRadius, baseZoom)
      }

    //These are a bunch of functions for calculating the weight of the points - I played with a few variations.
    //some repetition here, I couldn't figure out how to avoid that.
      function getPointsWeightBikes(){
      	myPoints = [];
      	points.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {location:newLoc, weight:station.stationStatus.num_bikes_available}
      		myPoints.push(newPoint)
      	})
      	return myPoints
      }

      function getPointsWeightDocks(){
      	myPoints = [];
      	points.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {location:newLoc, weight:station.stationStatus.num_docks_available}
      		myPoints.push(newPoint)
      	})
      	return myPoints
      }

      //sum docks and bikes to get weight. aims to show weight of whole system regardless of current bike/dock arrangement.
      //I did not use station.capacity, because some systems did not populate this field.
      function getPointsWeightSystem(){
      	myPoints = [];
      	points.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {location:newLoc, weight:station.stationStatus.num_docks_available + station.stationStatus.num_bikes_available}
      		myPoints.push(newPoint)
      	})
      	return myPoints
      }

      function getPointsRatio(){
      	myPoints = [];
      	points.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {
      			location:newLoc, 
      			weight:(station.stationStatus.num_bikes_available/station.capacity)*100}
      		myPoints.push(newPoint)
      	})
      	console.log(myPoints)
      	return myPoints

      }

      function getPointsRatioDocks(){
      	myPoints = [];
      	points.forEach((station)=>{
      		let newLoc = new google.maps.LatLng(station.lat, station.lon)
      		let newPoint = {
      			location:newLoc, 
      			weight:(station.stationStatus.num_docks_available/station.capacity)*100}
      		myPoints.push(newPoint)
      	})
      	console.log(myPoints)
      	return myPoints

      }


  
  	//function for actually making the heatmaps.
      function makeHeatMap(mapVariable, heatMapVariable, mapDiv, heatMapConstructor, radius = 20, zoom = 12){
      	 mapVariable = new google.maps.Map(document.getElementById(mapDiv), {
          center: {lng: centerLng, lat: centerLat},
          zoom: zoom,
          
        });

       
        heatMapVariable = new google.maps.visualization.HeatmapLayer({
          data: heatMapConstructor,
          map: mapVariable,
          radius: radius
        });

      }

    function changeRadius() {
        heatmap.set('radius', heatmap.get('radius') ? null : 30);
        console.log(heatmap.get('radius'))
      }



