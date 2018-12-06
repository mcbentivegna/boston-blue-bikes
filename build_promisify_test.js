const https = require('https')


const eventEmitter = require('events')
class MyEmitter extends eventEmitter {}
const bikeDataEmitter = new MyEmitter();



function getRegions(){
  
  let body = "";
  let url = 'https://gbfs.bluebikes.com/gbfs/en/system_regions.json'

  const request = https.get(url, function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to ' + url); 
    }
    else{
      //as the data comes in, capture it
      response.on('data', function(chunk){
        body += chunk;             
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

function getStations(regions){
  
  let body = "";
  let html = '';
  const url = 'https://gbfs.bluebikes.com/gbfs/en/station_information.json'
	
  const request = https.get(url, function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to ' + url ); 
    }
    else{
      //as the data comes in, capture it
      response.on('data', function(chunk){
        body += chunk;             
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
       const stationInfo = JSON.parse(body);
       
       //extract regions and their names
       const  stations = stationInfo.data.stations;

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

	  
	  	//build HTML to return to regions to display
	  	regionsToDisplay.forEach(function(region){
	  		html += '<h1>' + region.name + '</h1>'
	  		region.stations.map(station => {
	  			html +=  '<p>'+ station.name + '</p>'
	  		})
	  	})
	  	const regions_with_stations = regions;

        //emit the HTML 
        bikeDataEmitter.emit('station_data_end', regions_with_stations)
        	

      });
    }
  })

}

function getStationStatus(regions_with_stations){
	let body = ''
	let html = ''
	const url = 'https://gbfs.bluebikes.com/gbfs/en/station_status.json'

	//throw out any regions without stations, we don't want to display these
	const regionsToDisplay = regions_with_stations.filter(function(region){
		return region.stations.length>0
	})

	const request = https.get(url, function(response){
	 	if (response.statusCode != 200){
	     	request.abort();
	     	console.log('There was an error connecting to ' + url ); 
    	}
    	else{
    		response.on('data',function(chunk){
    			body += chunk
    		})

    		response.on('end', function(){
    			const stationStatusInfo = JSON.parse(body);
    			const stationStatuses = stationStatusInfo.data.stations
    		
    			//add station status info to station object
    		regionsToDisplay.forEach(function(region){
    			region.stations.map(function(station){
    				const station_id = station.station_id
    				const stationStatus = stationStatuses.find((station) => station.station_id == station_id)
    				station.station_status = stationStatus

    			})

    		});

    		regionsToDisplay.forEach(function(region){
		  		html += '<h1>' + region.name + '</h1>'
		  		html += '<table>'
		  		html += '<tr> \
		  					<td >Station</td>\
		  					<td>Capacity</td>\
		  					<td>Bikes Available</td>\
		  					<td>Docks Available</td>\
		  				</tr>'
		  		region.stations.map(station => {
		  			html += 
		  				`<tr>
			  				 <td> ${station.name} </td>
			  				 <td> ${station.capacity} </td>
			  				 <td> ${station.station_status.num_bikes_available} </td>
			  				 <td> ${station.station_status.num_docks_available} </td>
		  				</tr>`
		  		})
		  		html += '</table>'

	  	})
    	bikeDataEmitter.emit('station_status_data_end', html)
    			
    		})
		
    	}
    	

	})
}



function build(newServerRequest, newServerResponse){
	
	getRegions();
	
	bikeDataEmitter.on('region_data_end', function(regions){
		console.log('region_data_end')
		getStations(regions);
	})

	bikeDataEmitter.on('station_data_end', function(regions_with_stations){
		console.log('station_data_end')
		getStationStatus(regions_with_stations)
	})

	bikeDataEmitter.on('station_status_data_end', function(html){
		console.log('station_status_data_end')
		//newServerResponse.writeHead(200, {'Content-Type': 'text/html'});  
		newServerResponse.write(html);
		//newServerResponse.end();
		/*, function(err){
			try{
				newServerResponse.end()
				console.log('end')
			}
			catch(err){
				throw err
			}
		})*/
		
	})
	
	
}

function testBuild(newServerRequest, newServerResponse){
	
	getRegions();
	bikeDataEmitter.on('region_data_end', function(regions){
		console.log('region_data_end')
		getStations(regions);
	})

	
	bikeDataEmitter.on('station_data_end', function(regions_with_stations){
		console.log('station_data_end')
		getStationStatus(regions_with_stations)
	})

	

	bikeDataEmitter.on('station_status_data_end', function(html){
		console.log('station_status_data_end')
		console.log(html.substring(0,100))
	})
	

	
	
	
}

module.exports.build = build
module.exports.testBuild = testBuild
module.exports.getRegions = getRegions
module.exports.getStations = getStations