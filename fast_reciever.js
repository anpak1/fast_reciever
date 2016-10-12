
'use strict';

process.setMaxListeners(0);

var http 		= require('http')
	, Generator = require('./idgenerator')
	, queryParse = require('querystring').parse;

var generator = new Generator();

var server = http.createServer();

var ClusterIPC = require('./clusterIPC'),
	clusterIPC = new ClusterIPC(server, process, {
		generator: generator
	});

// process all requests through this function
clusterIPC.server.request = function (req, res) {

	var timer = setTimeout(function(){
		res.end();
	}, 60000);

	res.writeHead(200, {
		// 'Content-Type': 'text/plain',
		'Expires' :  new Date(+new Date() - 1).toUTCString(),
		'Cache-Control' : 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
		'Pragma' : 'no-cache',
		'Last-Modified' : new Date().toUTCString(),
		'Content-Length': 0,
		'Content-Type': 'image/png',
		'Connection': 'Close'
		// 'Connection': 'Keep-Alive',
		// 'Keep-Alive': 'timeout=10, max=10'
	});
			// grab query
	var query = queryParse(urlParse(req.url).query);
	
	// clear long time connection skip timer
	clearTimeout(timer);
	res.end();
};

clusterIPC.server.connection = function(socket) {
//    socket.setNoDelay(); // disable nagle algorithm
};

clusterIPC.server.close = function() {
    // cleanup
//    workdb.close();
    
};

clusterIPC.smartObjects['console'] = console;

process.title = 'rc';

var exitFunction = function () {
	process.exit(0);
}

try{
	process.on('SIGINT', exitFunction);
	process.on('SIGKILL', exitFunction);
	process.on('SIGTERM', exitFunction);
	process.on('SIGHUP', exitFunction);

	process.on('SIGUSR1', function(){
		console.log(process.pid, 'requests:: ', generator.current());
	});
}catch(e){

}

clusterIPC.bindEvents();
server.listen(8010, 'localhost', function(){
	console.log(process.title + ' running pid::' + process.pid + ' on ' + 8010 + ' port');
});