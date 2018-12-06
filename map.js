//const build = require('./build.js');

console.log('hello')
//console.log(build.myTest)
let map;

    let bostonLatLng = {{bostonLatLng}} ;

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