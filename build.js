var https = require('https')


var eventEmitter = require('events')

class MyEmitter extends eventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('blah',(myString) =>{
	console.log('Caroline');
	console.log(myString)
	html += myString
})

const regionEmitter = new MyEmitter();
const stationEmitter = new MyEmitter();


function getRegions(){
  
  var body = "";
  var url = 'https://gbfs.bluebikes.com/gbfs/en/system_regions.json'

  var request = https.get(url, function(response){
    
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
        var regionInfo = JSON.parse(body);
       
       	//extract regions and their names
        regions = regionInfo.data.regions;
        regionEmitter.emit('region_data_end', regions)
        
      });
    }
  })

}

function getStations(regions){
  
  var body = "";
  var html = '';
  var url = 'https://gbfs.bluebikes.com/gbfs/en/station_information.json'
	
  var request = https.get(url, function(response){
    
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
       var stationInfo = JSON.parse(body);
       
       //extract regions and their names
       var  stations = stationInfo.data.stations;

       //add stations field to regions object so there's somewhere to put the station data.
       regions.map(region => region.stations = []);


        //run through the regions. Filter all the stations that belong to the region, and add it to region.stations for posterity
        //while you're at it, let's make the HTML we'll need
        regions.forEach(function(region){
        	
	  		//add stations to region.stations
	  		var myStations = stations.filter(function(station){
	  			return station.region_id == region.region_id
	   		})
	  		region.stations = myStations;

	  		
	  	});
//throw out any regions without stations, we don't want to display these
				  	var regionsToDisplay = regions.filter(function(region){
				  		return region.stations.length>0
				  	})

	  
	  	//build HTML to return to regions to display
	  	regionsToDisplay.forEach(function(region){
	  		html += '<h1>' + region.name + '</h1>'
	  		region.stations.map(station => {
	  			html +=  '<p>'+ station.name + '</p>'
	  		})
	  	})

        //emit the HTML 
        stationEmitter.emit('station_data_end', html)
        	

      });
    }
  })

}

function getStationStatus(regions){
	var body = ''
	var html = ''
	url = 'https://gbfs.bluebikes.com/gbfs/en/station_status.json'

	//throw out any regions without stations, we don't want to display these
				  	var regionsToDisplay = regions.filter(function(region){
				  		return region.stations.length>0
				  	})

	var request = https.get(url, function(response){
	 	if (response.statusCode != 200){
	     	request.abort();
	     	console.log('There was an error connecting to ' + url ); 
    	}
    	else{
    		response.on('data',function(chunk){
    			body += chunk
    		})

    		response.on('end', function(){
    			var stationStatusInfo = JSON.parse(body);
    			var stationStatuses = stationStatusInfo.data.stations
    			
    			//tesssssssssssssssssting!
    			var num_bikes_available = stationStatuses.find((station) => station.station_id == '4')
    			console.log(num_bikes_available)


    			//for real (we'll try)
    			regions[0].stations.map(function(station){
    				var station_id = station.station_id
    				var stationStatus = stationStatuses.find((station) => station.station_id == station_id)
    				station.num_bikes_available = stationStatus.num_bikes_available;
    				//or????
    				station.station_status

    			})
    			console.log(regions[0])

    			
    		})

    	}

	})
}



function build(newServerRequest, newServerResponse){
	
	getRegions();
	regionEmitter.on('region_data_end', function(regions){
	getStations(regions);
	})

	
	stationEmitter.on('station_data_end', function(html){
		newServerResponse.writeHead(200, {'Content-Type': 'text/html'});  
		newServerResponse.write(html)
		newServerResponse.end()
	})
	
	
}

function testBuild(newServerRequest, newServerResponse){
	
	getRegions();
	regionEmitter.on('region_data_end', function(regions){
		regionInfo = regions;
		regionInfo.map(region => region.stations = []);
		getStations(regionInfo);
	})

	
	stationEmitter.on('station_data_end', function(html){
		//newServerResponse.writeHead(200, {'Content-Type': 'text/html'});  
		//newServerResponse.write(html)
		//newServerResponse.end()
		getStationStatus(regions)
	})
	
	
}




module.exports.build = build
module.exports.testBuild = testBuild
module.exports.getRegions = getRegions
module.exports.getStations = getStations