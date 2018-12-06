const https = require('https')
const fs = require('fs')
const renderer = require('./renderer')


const eventEmitter = require('events')
class MyEmitter extends eventEmitter {}
const bikeDataEmitter = new MyEmitter();

//what's the base URL of the feed? In this case, we're interested in NYC bikes.
//note the english language specification at the end, I'm not sure if smaller bike shares bother to specify the language

city_urls = {
  'philidelphia': 'https://gbfs.bcycle.com/bcycle_indego',
  'newyork' :  'https://gbfs.citibikenyc.com/gbfs/en',
  'boston' : 'https://gbfs.bluebikes.com/gbfs/en',
  'chicago': 'https://gbfs.divvybikes.com/gbfs/en',
  'sanfrancisco': 'https://gbfs.fordgobike.com/gbfs/en',
  'washingtondc': 'https://gbfs.capitalbikeshare.com/gbfs/en',
}



//pull data about specific regions
function getRegions(GBFS_URL){
  
  let body = "";
  let url = `${GBFS_URL}/system_regions.json`

  const request = https.get(url, function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to ' + url); 
    }
    else{
      //as the data comes in, capture it
      response.on('data', function(chunk){
        body += chunk;
        bikeDataEmitter.emit('data',chunk)             
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
        const regionInfo = JSON.parse(body);
       
       	//extract regions and their names
        regions = regionInfo.data.regions;
        bikeDataEmitter.emit('region_data_end', regions)
        
      });
    }
  })

}

//pull data about stations
function getStations(GBFS_URL){
  
  let body = "";
  const url = `${GBFS_URL}/station_information.json`
	
  const request = https.get(url, function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to ' + url ); 
    }
    else{
      //as the data comes in, capture it
      	response.on('data', function(chunk){
        body += chunk;
        bikeDataEmitter.emit('data',chunk)               
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
       const stationInfo = JSON.parse(body);
       
       const  stations = stationInfo.data.stations;
 
        bikeDataEmitter.emit('station_data_end', stations)

      });
    }
  })

}

//pull data about station statuses, and merge it with station data. This merging should probably be done in a separate function...
function getStationStatus(GBFS_URL, stations){
	let body = ''
	const url = `${GBFS_URL}/station_status.json`


	const request = https.get(url, function(response){
	 	if (response.statusCode != 200){
	     	request.abort();
	     	console.log('There was an error connecting to ' + url ); 
    	}
    	else{
    		response.on('data',function(chunk){
    			//console.log('station status data')
    			body += chunk
    			bikeDataEmitter.emit('data',chunk)  
    		})

    		response.on('end', function(){
    			const stationStatusInfo = JSON.parse(body);
    			const stationStatuses = stationStatusInfo.data.stations


    		stations.map(function(station){
    				const station_id = station.station_id
    				const stationStatus = stationStatuses.find((station) => station.station_id == station_id)
    				station.stationStatus = stationStatus

    			})

    	bikeDataEmitter.emit('station_status_data_end', stations)
    			
    		})
		
    	}
    	

	})
}


function build(req, res){

  console.log(req.params)

  const GBFS_URL = city_urls[req.params.cityName]
  console.log(GBFS_URL)

	
	let html = fs.readFileSync('./index.html', {encoding: 'utf8'})

	getStations(GBFS_URL);

	bikeDataEmitter.once('station_data_end', function(stations){
		getStationStatus(GBFS_URL,stations)
	})

	bikeDataEmitter.once('station_status_data_end', function(stations){

    //now that we have station status, let's write it to a JSON file so we can access it in the web browser, outside node.
    let stationJSON = 'stationJSON = '
    stationJSON += JSON.stringify(stations);
    fs.writeFileSync('view/stations.json', stationJSON, {encoding:'utf8'})

    //find total bikes available
    systemMetrics = {'totalBikesAvialable': 0,
                      'totalDocksAvailable': 0,
                      'totalStations': 0}

    stations.forEach((station) => systemMetrics.totalBikesAvialable += station.stationStatus.num_bikes_available)
    stations.forEach((station) => systemMetrics.totalDocksAvailable += station.stationStatus.num_docks_available)
    systemMetrics.totalStations = stations.length

    html = html.replace('{{totalBikesAvailable}}', systemMetrics.totalBikesAvialable)
    html = html.replace('{{totalDocksAvailable}}', systemMetrics.totalDocksAvailable) 
    html = html.replace('{{Stations}}', systemMetrics.totalStations) 
    
    //let's also write the html for our file out to the server. 
		html = html.replace("{{station-table}}", renderer.createStationsTable(stations))
  	res.send(html);
		res.end();

		
	})
	
	
}

function testBuild(newServerRequest, newServerResponse){
	
	getRegions();
	bikeDataEmitter.on('region_data_end', function(regions){
		console.log('region_data_end')
		getStations(regions);
	})

	
	bikeDataEmitter.on('station_data_end', function(stations){
		console.log('station_data_end')
		getStationStatus(stations)
	})

	

	bikeDataEmitter.on('station_status_data_end', function(stations){
		console.log('station_status_data_end')
					myArray = [];

		stations.forEach( (station) =>{
			myArray.push({lat: station.lat, lon: station.lon })

		})
		myArray.forEach((station)=>console.log(station.lon))
	})
	
}

module.exports.build = build
module.exports.testBuild = testBuild
module.exports.getStations = getStations