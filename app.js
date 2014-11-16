var express = require("express");
var session = require('express-session');
var app = express();
var http = require("http").createServer(app);
var bodyParser = require("body-parser");
var favicon = require("serve-favicon");
var io = require("socket.io").listen(http);
var passport = require('passport');
var WindowsLiveStrategy = require('passport-windowslive').Strategy;
var _ = require("underscore");

var WINDOWS_LIVE_CLIENT_ID = "0000000048131F76"
var WINDOWS_LIVE_CLIENT_SECRET = "IXTlXb4o1xLuxRxL3mwbhmAofBf5XRa8";

app.use(favicon(__dirname + '/public/favicon.ico'));

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Windows Live profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new WindowsLiveStrategy({
    clientID: WINDOWS_LIVE_CLIENT_ID,
    clientSecret: WINDOWS_LIVE_CLIENT_SECRET,
    callbackURL: "http://4fe37ae7.ngrok.com/auth/windowslive/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Windows Live profile is returned
      // to represent the logged-in user.  In a typical application, you would
      // want to associate the Windows Live account with a user record in your
      // database, and return that user instead.
      return done(null, profile);
    });
  }
));

/* 
  The list of participants in our chatroom.
  The format of each participant will be:
  {
    id: "sessionId",
    name: "participantName"
  }
*/
var participants = [];

app.set("ipaddr", "127.0.0.1");
app.set("port", 8080);

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
//Specify where the static content is
app.use(express.static("public", __dirname + "/public"));

app.use(bodyParser.json());

app.use(session({secret: 'fat people'}))
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

//route homepage
app.get("/", function(req, res) {
  res.render("index", { user: req.user });
});

// GET /auth/windowslive
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Windows Live authentication will involve
//   redirecting the user to live.com.  After authorization, Windows Live
//   will redirect the user back to this application at
//   /auth/windowslive/callback
app.get('/auth/windowslive',
  passport.authenticate('windowslive', { scope: ['wl.signin', 'wl.basic'] }),
  function(req, res){
    // The request will be redirected to Windows Live for authentication, so
    // this function will not be called.
  });

// GET /auth/windowslive/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the hub page.
app.get('/auth/windowslive/callback', 
  passport.authenticate('windowslive', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/hub');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//route boards
app.get("/board", ensureAuthenticated, function(req, res) {
  res.render("board");
});

app.get("/hub", ensureAuthenticated, function(req, res) {
  res.render("hub");
});

app.post("/message", ensureAuthenticated, function(req, res) {

  //The request body expects a param named "message"
  var message = req.body.message;

  //If the message is empty or wasn't sent it's a bad request
  if(_.isUndefined(message) || _.isEmpty(message.trim())) {
    return res.json(400, {error: "Message is invalid"});
  }

  //We also expect the sender's name with the message
  var name = req.body.name;

  //Let our chatroom know there was a new message
  io.sockets.emit("incomingMessage", {message: message, name: name});

  //Looks good, let the client know
  res.json(200, {message: "Message received"});

});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

/* Socket.IO events */
io.on("connection", function(socket){
  
  /*
    When a new user connects to our server, we expect an event called "newUser"
    and then we'll emit an event called "newConnection" with a list of all 
    participants to all connected clients
  */
  socket.on("newUser", function(data) {
    participants.push({id: data.id, name: data.name});
    io.sockets.emit("newConnection", {participants: participants});
  });

  /*
    When a user changes his name, we are expecting an event called "nameChange" 
    and then we'll emit an event called "nameChanged" to all participants with
    the id and new name of the user who emitted the original message
  */
  socket.on("nameChange", function(data) {
    _.findWhere(participants, {id: socket.id}).name = data.name;
    io.sockets.emit("nameChanged", {id: data.id, name: data.name});
  });

  /* 
    When a client disconnects from the server, the event "disconnect" is automatically 
    captured by the server. It will then emit an event called "userDisconnected" to 
    all participants with the id of the client that disconnected
  */
  socket.on("disconnect", function() {
    participants = _.without(participants,_.findWhere(participants, {id: socket.id}));
    io.sockets.emit("userDisconnected", {id: socket.id, sender:"system"});
  });

});

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});