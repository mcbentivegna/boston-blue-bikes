const http = require('http');
const builder = require('./build.js');

process.env.NODE_DEBUG = 'http'


const hostname = '127.0.0.1'
const port = 4000;

http.createServer(function (newServerRequest, newServerResponse) {
	
	builder.getRegions()
    builder.regionsBuild(newServerRequest, newServerResponse)

}).listen(port, hostname);



console.log(`Server running at http://${hostname}:${port}/`);

	
	
