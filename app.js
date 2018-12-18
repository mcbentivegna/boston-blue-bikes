const http = require('http');
const builder = require('./build.js');

const express = require('express');
const app = express();

process.env.NODE_DEBUG = 'http'


const hostname = '127.0.0.1'
const port = 8000;

app.get('/city/:cityName', function(req, res) {
	builder.build(req, res);

});

app.use('/static',express.static('view'))

app.listen(port, hostname, () => {
	console.log(`server running at http://${hostname}:${port}/`)
})

console.log(`Server running at http://${hostname}:${port}/`);

	
	
