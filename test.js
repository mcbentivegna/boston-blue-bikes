const EventEmitter = require('events').EventEmitter;
const chatRoomEvents = new EventEmitter;
var https = require('https')


function login(username){
  chatRoomEvents.emit('userJoined', username);
}

function userJoined(username){
  // Assuming we already have a function to alert all users.
  console.log('User ' + username + ' has joined the chat.');
}

// Run the userJoined function when a 'userJoined' event is triggered.
chatRoomEvents.on('userJoined', function(username) {console.log(username)})

//why does this work???
chatRoomEvents.on('userJoined',userJoined)

login('cprice')

////////////////////////////

const regionEvent = new EventEmitter;

function getRegions(){
	    var html = ''
	    var body = ''
  
  var request = https.get('https://gbfs.bluebikes.com/gbfs/en/system_regions.json', function(response){
    


   
      //as the data comes in, capture it
      response.on('data', function(chunk){
        body += chunk;             
      });
      
      //when the data's done coming in, parse it
      response.on('end', function(){
        var regionInfo = JSON.parse(body);
       
       	//extract regions and their names
        regions = regionInfo.data.regions;
        regions.map(x => {
        	html += '<p>'+ x.name + '</p>'
        })
        regionEvent.emit('end',html)
      });
    
  })

}

function printRegions(html){
	console.log('html')
}

regionEvent.on('end',printRegions)

getRegions();



