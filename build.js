const https = require('https')
const fs = require('fs')
const renderer = require('./renderer')


const eventEmitter = require('events')
class MyEmitter extends eventEmitter {}
const bikeDataEmitter = new MyEmitter();

//what's the base URL of the feed? In this case, we're interested in NYC bikes.
//note the english language specification at the end, I'm not sure if smaller bike shares bother to specify the language

city_urls = {
  'philidelphia': {url:'https://gbfs.bcycle.com/bcycle_indego', prettyName: 'Philidelphia', bikeShareName: 'Indego'},
  'newyork' :  {url:'https://gbfs.citibikenyc.com/gbfs/en', prettyName: 'New York', bikeShareName:'Citibike'},
  'boston' : {url:'https://gbfs.bluebikes.com/gbfs/en', prettyName:'Boston', bikeShareName: 'Blue Bikes'},
  'chicago': {url:'https://gbfs.divvybikes.com/gbfs/en', prettyName: "Chicago", bikeShareName: 'Divvy'},
  'sanfrancisco': {url:'https://gbfs.fordgobike.com/gbfs/en', prettyName: "San Francisco", bikeShareName: 'Ford GoBike'},
  'washingtondc': {url:'https://gbfs.capitalbikeshare.com/gbfs/en', prettyName: "Washington, D.C.", bikeShareName: 'Capital Bikeshare'},
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

  //read html file that will be our base
  let html = fs.readFileSync('./index.html', {encoding: 'utf8'})
  
  //figure out if the city requested in the URL is actually supported. If not, show error on page.
  let  GBFS_URL = '';

  try{
    GBFS_URL = city_urls[req.params.cityName].url;
  }
  catch(err){
    error_html = html.replace('{{body}}', '<h1>This page does not exist</h1>')
    error_html = renderer.addNavToHTML(error_html, city_urls)
    res.send(error_html)
    res.end()
  }

	//grab station data from API. When it's done loading, grab the station status as well.
	getStations(GBFS_URL);

	bikeDataEmitter.once('station_data_end', function(stations){
		getStationStatus(GBFS_URL,stations)
	})

  //when station status data is done loading, we start to build our webpage for the request.
	bikeDataEmitter.once('station_status_data_end', function(stations){

    //now that we have station status, let's write it to a JSON file so we can access it in the web browser, outside node.
    //this is not necessary for the table, but it IS necessary for the maps, which are built in the map.js file which runs in the browser.
    let stationJSON = 'stationJSON = '
    stationJSON += JSON.stringify(stations);
    fs.writeFileSync('view/stations.json', stationJSON, {encoding:'utf8'})

    

    //and now let's pull in the city page template, and stick it in our main html.
    let city_template = fs.readFileSync('./city_template.html', {encoding: 'utf8'})
    html = html.replace('{{body}}', city_template)

   //let's generate some metrics we'll want to display on the page, and then put them on the page.
    let systemMetrics = generateSystemMetrics(stations);
    html = renderer.insertMetricsToHTML(systemMetrics,html)

    //and let's also get the bike share name and city name on the page.
    html = html.replace(/{{prettyName}}/gi, city_urls[req.params.cityName].prettyName) 
    html = html.replace(/{{bikeShareName}}/gi, city_urls[req.params.cityName].bikeShareName) 
    
    //finally, let's build the station detail table 
		html = html.replace("{{station-table}}", renderer.createStationsTable(stations))
    html = renderer.addNavToHTML(html, city_urls)

    //and now, we send the HTML over.
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

function generateSystemMetrics(stations){
   let systemMetrics = {'totalBikesAvailable': 0,
                      'totalDocksAvailable': 0,
                      'Stations': 0}
    console.log(systemMetrics)

    stations.forEach((station) => systemMetrics.totalBikesAvailable += station.stationStatus.num_bikes_available)
    stations.forEach((station) => systemMetrics.totalDocksAvailable += station.stationStatus.num_docks_available)
    systemMetrics.Stations = stations.length
    console.log(systemMetrics)

    return systemMetrics

}


module.exports.build = build
module.exports.testBuild = testBuild
module.exports.getStations = getStations