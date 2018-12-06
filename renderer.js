
function createStationsTable(stations){

	html ='';
	    		//stations.forEach(function(station){
		  		html += '<table class = "station-table">'
		  		html += '<tr> \
		  					<td >Station</td>\
		  					<td>Capacity</td>\
		  					<td>Bikes Available</td>\
		  					<td>Docks Available</td>\
		  				</tr>'
		  		stations.map(station => {
		  			html += 
		  				`<tr>
			  				 <td> ${station.name} </td>
			  				 <td> ${station.capacity} </td>
			  				 <td> ${station.stationStatus.num_bikes_available} </td>
			  				 <td> ${station.stationStatus.num_docks_available} </td>
		  				</tr>`
		  		})
		  		html += '</table>'

	  	//})
	    		return html;
}


module.exports.createStationsTable = createStationsTable