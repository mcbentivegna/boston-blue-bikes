var http = require('http');
var builder = require('./build.js');


hostname = '127.0.0.1'
port = 8000;

http.createServer(function (newServerRequest, newServerResponse) {
    builder.build(newServerRequest, newServerResponse);
}).listen(port, hostname);

console.log('Server running at http://'+ hostname + ':' + port + '/');

	
	
