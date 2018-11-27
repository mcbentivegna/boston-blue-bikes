const http = require('http');
const builder = require('./build.js');

process.env.NODE_DEBUG = 'http'


const hostname = '127.0.0.1'
const port = 8000;

http.createServer(function (newServerRequest, newServerResponse) {
		console.log(`${newServerRequest.url} was called`)
	
    if (newServerRequest.url === '/'){

	    	builder.build(newServerRequest, newServerResponse);
	    	console.dir(newServerRequest, {depth:0})

    }
    else{
    	console.log(newServerRequest.url)
    }
}).listen(port, hostname);


console.log(`Server running at http://${hostname}:${port}/`);

	
	
