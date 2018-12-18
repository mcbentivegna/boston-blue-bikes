
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

		const table_contents = ` <td> ${stations[i].name} </td>
					 <td> ${stations[i].capacity} </td>
					 <td> ${stations[i].stationStatus.num_bikes_available} </td>
					 <td> ${stations[i].stationStatus.num_docks_available} </td>`

		if (i<4){
			html += '<tr>' + table_contents + '</tr>'
		}

		else if(i==4){
			html += 
				'<tr>' + table_contents + '<td><button id = "show-more">Show More</button></td></tr>'

		}
		else{
			html += '<tr class="hidden">' + table_contents + '</tr>'
		}
	}

	html += '</table>'

	  	//})
	    		return html;
}

function addNavToHTML(html, city_urls){
  nav_html = '';
    for(city in city_urls){
      nav_html += `<li class = "nav-item"><a class = "nav-link" href= ${city}>${city_urls[city].prettyName}</a></li>`
    }

    html = html.replace("{{nav}}", nav_html)

    return html;
}

function insertMetricsToHTML(systemMetrics, html){
	console.log(systemMetrics)
	for (metric in systemMetrics){
		//use RegExp() so you can have a regex without confusing template literals with the backslashes required for regex without this functioin.
		//g flag indicates global, so all matches on page will be replaced.
		regex =RegExp(`{{${metric}}}`,'g')
    	html = html.replace(regex, systemMetrics[metric])
    }
    return html;
}


module.exports.createStationsTable = createStationsTable
module.exports.addNavToHTML = addNavToHTML
module.exports.insertMetricsToHTML = insertMetricsToHTML