
function createStationsTable(stations){

	html ='';
//stations.forEach(function(station){
	html += '<table class = "station-table">'
	html += '<tr> \
				<th >Station</th>\
				<th>Capacity</th>\
				<th>Bikes Available</th>\
				<th>Docks Available</th>\
			</tr>'

	for (let i = 0; i<stations.length; i++){
		if(i==5){
			html += 
				`<tr>
					 <td> ${stations[i].name} </td>
					 <td> ${stations[i].capacity} </td>
					 <td> ${stations[i].stationStatus.num_bikes_available} </td>
					 <td> ${stations[i].stationStatus.num_docks_available} </td>
					 <td id = 'button-cell'><button>OK Hello!</button></td>
				</tr>`

		}
		else{
			html += 
				`<tr>
					 <td> ${stations[i].name} </td>
					 <td> ${stations[i].capacity} </td>
					 <td> ${stations[i].stationStatus.num_bikes_available} </td>
					 <td> ${stations[i].stationStatus.num_docks_available} </td>
				</tr>`
		}
	}

	html += '</table>'

	  	//})
	    		return html;
}


module.exports.createStationsTable = createStationsTable