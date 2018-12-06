//const build = require('./build.js');

console.log('hello')
//console.log(build.myTest)
let map;

    let bostonLatLng = [
        {lat: 42.3601, lng:-71.0589},
        {lat: 42.3701, lng:-71.1589},
        {lat: 42.365, lng:-71.20}
        ]

     /*let bostonLatLng2 = [
        {lat: 42.3601, lng:-71.0589},
        {lat: 42.3701, lng:-71.1589}
        ]
        */
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: bostonLatLng[0],
          zoom: 12
        });
      

        bostonLatLng.forEach((element) => {
          var marker = new google.maps.Marker({
            position:element,
            map: map,
            //title: 'Hello World!'
          })      

      })
      }