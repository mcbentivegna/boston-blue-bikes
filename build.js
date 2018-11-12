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
  var html = '';

  var request = https.get('https://gbfs.bluebikes.com/gbfs/en/system_regions.json', function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to the '); 
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

function getStations(regionInfo){
  
  var body = "";
  var html = '';
  console.log(regionInfo[0])
  
  		
  var request = https.get('https://gbfs.bluebikes.com/gbfs/en/station_information.json', function(response){
    
    if (response.statusCode != 200){
     request.abort();
     console.log('There was an error connecting to the '); 
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

        //run through the regions. Filter all the stations that belong to the region, and add it to region.stations for posterity
        //while you're at it, let's make the HTML we'll need
        regionInfo.forEach(function(region){
        	
	  		//add stations to region.stations
	  		var myStations = stations.filter(function(station){
	  			return station.region_id == region.region_id
	   		})
	  		region.stations = myStations;

	  		
	  	});

	  	//throw out any regions without stations, we don't want to display these
	  	var regionsToDisplay = regionInfo.filter(function(region){
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

function build(newServerRequest, newServerResponse){
	
	getRegions();
	regionEmitter.on('region_data_end', function(regions){
		regionInfo = regions;
		regionInfo.map(region => region.stations = []);
		getStations(regionInfo);
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
	})
	
	
}




module.exports.build = build
module.exports.testBuild = testBuild
module.exports.getRegions = getRegions
module.exports.getStations = getStations