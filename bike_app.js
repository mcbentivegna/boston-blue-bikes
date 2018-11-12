console.log('Bike data');

//let's get the bike data!

var https = require('https');
var eventEmitter = require('events');

bikeRegions = [
  {region_id: '8', name: 'Cambridge'},
  {region_id: '9', name: 'Somerville'},
  {region_id: '10', name: 'Boston'},
  {region_id: '4', name: 'Broookline'},
];

function getStationInfo(){
  
  body = "";

  var request = https.get('https://gbfs.bluebikes.com/gbfs/en/station_information.json', function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to this address'); 
    }
    else{
      //as the data comes in, capture it
      response.on('data', function(chunk){
        body += chunk;             
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
        var stationInfo = JSON.parse(body);
        console.log(stationInfo.data.stations[1].name);
      });
    }
  })

}
  

stationInfo = getStationInfo();
  console.log(stationInfo);
  
module.exports.getStationInfo = getStationInfo;

