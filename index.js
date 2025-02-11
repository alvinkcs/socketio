'use strict';

//Loading dependencies & initializing express
var os = require('os'); //for operating system-related utility methods and properties
var express = require('express'); 
var app = express();
var http = require('http');//for creating http server

//For signalling in WebRTC
var socketIO = require('socket.io');

//Define the folder which contains the CSS and JS for the fontend
app.use(express.static('public'))

//Define a route 
app.get("/", function(req, res){
  //Render a view (located in the directory views/) on this route
	res.render("index.ejs");
});

//Initialize http server and associate it with express
var server = http.createServer(app);

//Ports on which server should listen - 8000 or the one provided by the environment
server.listen(process.env.PORT || 8080);

//Initialize socket.io
var io = socketIO(server);


//Implementing Socket.io
//connection is a synonym of reserved event connect
//connection event is fired as soon as a client connects to this socket.
io.sockets.on('connection', function(socket) {

    console.log("someone connected to the server");

	// Convenience function to log server messages on the client.
	// Arguments is an array like object which contains all the arguments of log(). 
	// To push all the arguments of log() in array, we have to use apply().
	function log() {
	  var array = ['Message from server:'];
	  array.push.apply(array, arguments);
	  socket.emit('log', array);
	}
  
    
  //Defining Server behavious on Socket Events
  socket.on('message', function(message, room) {
	  log('Client said: ', message);
    //server should send the receive only in room
	  socket.in(room).emit('message', message, room);
	});
  
	//Event for joining/creating room
  socket.on('create or join', function(room) {
	  log('Received request to create or join room ' + room);
  
	  //Finding clients in the current room
    var clientsInRoom = io.sockets.adapter.rooms.get(room);
	  var numClients = clientsInRoom ? io.sockets.adapter.rooms.get(room).size : 0;
	  log('Room ' + room + ' now has ' + numClients + ' client(s)');
      console.log('Room ' + room + ' now has ' + numClients + ' client(s)');
  
    //If no client is in the room, create a room and add the current client
	  if (numClients === 0) {
		  socket.join(room);
		  log('Client ID ' + socket.id + ' created room ' + room);
		  socket.emit('created', room, socket.id);
	  } 
    
    //If one client is already in the room, add this client in the room
    else if (numClients === 1) {
		  log('Client ID ' + socket.id + ' joined room ' + room);
		  io.sockets.in(room).emit('join', room);
		  socket.join(room);
		  socket.emit('joined', room, socket.id);
		  io.sockets.in(room).emit('ready');
	  }
    
    //If two clients are already present in the room, do not add the current client in the room
    else { // max two clients
		  socket.emit('full', room);
	  }
	});
  
  //Utility event 
	socket.on('ipaddr', function() {
	  var ifaces = os.networkInterfaces();
	  for (var dev in ifaces) {
		ifaces[dev].forEach(function(details) {
		  if (details.family === 'IPv4' && details.address !== '127.0.0.1') {
			socket.emit('ipaddr', details.address);
		  }
		});
	  }
	});
  
  //Event for notifying other clients when a client leaves the room
	socket.on('bye', function(){
	  console.log('received bye');
	});
  
  });


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAY-cbYVmPyD7ZdDKNYTNNDFv-9BdhFnxY",
  authDomain: "alvinforfun.firebaseapp.com",
  projectId: "alvinforfun",
  storageBucket: "alvinforfun.appspot.com",
  messagingSenderId: "357595656922",
  appId: "1:357595656922:web:5c2243e84fcc5cb96e6be3",
  measurementId: "G-PQ1YE6C65Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);