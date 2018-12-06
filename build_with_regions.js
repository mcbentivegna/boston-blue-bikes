const https = require('https')
const fs = require('fs')
const renderer = require('./renderer')


const eventEmitter = require('events')
class MyEmitter extends eventEmitter {}
const bikeDataEmitter = new MyEmitter();



function getRegions(){
  
  let body = "";
  let url = 'https://gbfs.bluebikes.com/gbfs/en/system_regions.json'

  console.log("getRegions() started")

  const request = https.get(url, function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to ' + url); 
    }
    else{
      //as the data comes in, capture it
      response.on('data', function(chunk){
      	//console.log('region data')
        body += chunk;
        bikeDataEmitter.emit('data',chunk)             
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
      	console.log('region api response ended')
        const regionInfo = JSON.parse(body);
       
       	//extract regions and their names
        regions = regionInfo.data.regions;
        console.log('before emit region_data_end')
        bikeDataEmitter.emit('region_data_end', regions)
        console.log('after emit region_data_end')
        
      });
    }
  })

}

function getStations(regions){
  
  let body = "";
  const url = 'https://gbfs.bluebikes.com/gbfs/en/station_information.json'
	
  const request = https.get(url, function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to ' + url ); 
    }
    else{
      //as the data comes in, capture it
      response.on('data', function(chunk){
      	//console.log('station data')
        body += chunk;
        bikeDataEmitter.emit('data',chunk)               
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
       const stationInfo = JSON.parse(body);
       
       //extract regions and their names
       const  stations = stationInfo.data.stations;
       /*

       //add stations field to regions object so there's somewhere to put the station data.
       regions.map(region => region.stations = []);


        //run through the regions. Filter all the stations that belong to the region, and add it to region.stations for posterity
        //while you're at it, let's make the HTML we'll need
        regions.forEach(function(region){
        	
	  		//add stations to region.stations
	  		const myStations = stations.filter(function(station){
	  			return station.region_id == region.region_id
	   		})
	  		region.stations = myStations;

	  		
	  	});


	//throw out any regions without stations, we don't want to display these
				  	const regionsToDisplay = regions.filter(function(region){
				  		return region.stations.length>0
				  	})

	  
	  	const regions_with_stations = regions;

	  	*/

        //emit the HTML 
         console.log('before emit station_data_end')
        bikeDataEmitter.emit('station_data_end', stations)
        console.log('after emit station_data_end')	

      });
    }
  })

}

function getStationStatus(stations){
	let body = ''
	const url = 'https://gbfs.bluebikes.com/gbfs/en/station_status.json'
	/*

	//throw out any regions without stations, we don't want to display these
	const regionsToDisplay = regions_with_stations.filter(function(region){
		return region.stations.length>0
	})
	*/

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
    			/*
    		
    			//add station status info to station object
    		regionsToDisplay.forEach(function(region){
    			region.stations.map(function(station){
    				const station_id = station.station_id
    				const stationStatus = stationStatuses.find((station) => station.station_id == station_id)
    				station.stationStatus = stationStatus

    			})

    		});
    		*/

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


function regionsBuild(newServerRequest, newServerResponse){
	//getRegions();
	
	bikeDataEmitter.on('region_data_end', function(regions){
		console.log('region_data_end')
		newServerResponse.writeHead(200, {'Content-Type': 'text/html'});  
		//newServerResponse.write(regions[0].name);
		newServerResponse.end(regions[0].name);
	})
}

function build(req, res){
	
	//res.send('michelle')

	let maphtml = fs.readFileSync('./map.html', {encoding: 'utf8'})
	let mapjs = fs.readFileSync('./map_template.js', {encoding: 'utf8'})

	/*getRegions();
	
	//we're using once here, because when you reload the page, the callback function is run twice.
	//this is because when you run something with eventEmitter.on() it's added to the listener array in node
	//and it's not removed. When you do "once", it's added once and then removed.

	bikeDataEmitter.once('region_data_end', function(regions){
		console.log('on region_data_end')
		getStations(regions);
	})
	*/

	getStations();

	bikeDataEmitter.once('station_data_end', function(stations){
		console.log('station_data_end')
		getStationStatus(stations)
	})

	bikeDataEmitter.once('station_status_data_end', function(stations){
		console.log('station_status_data_end')
		maphtml = maphtml.replace("{{station-table}}", renderer.createStationsTable(stations))

		bostonLatLon = '['
		stations.forEach((station) => bostonLatLon += `{lat: ${station.lat}, lng: ${station.lon}},`)
		bostonLatLon += ']'


		mapjs = mapjs.replace("{{bostonLatLng}}", bostonLatLon)
        fs.writeFileSync('./view/map.js',mapjs, {encoding:'utf-8'})
		res.send(maphtml);
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

const myTest = 'my Test Variable'

module.exports.build = build
module.exports.regionsBuild = regionsBuild
module.exports.testBuild = testBuild
module.exports.getRegions = getRegions
module.exports.getStations = getStations
module.exports.myTest = myTest