var express = require("express")
var app = express()
var http = require("http").createServer(app)
var bodyParser = require("body-parser");
var _ = require("underscore");

app.set("ipaddr", "127.0.0.1");
app.set("port", 8080);

app.set("views", __dirname + "/views");
app.set("view engine", "jade");
//Specify where the static content is
app.use(express.static("public", __dirname + "/public"));

app.use(bodyParser.json());

app.get("/", function(request, response) {

  response.render("index");

});

app.post("/message", function(request, response) {

  //The request body expects a param named "message"
  var message = request.body.message;

  //If the message is empty or wasn't sent it's a bad request
  if(_.isUndefined(message) || _.isEmpty(message.trim())) {
    return response.json(400, {error: "Message is invalid"});
  }

  //Looks good, let the client know
  response.json(200, {message: "Message received"});

});

http.listen(app.get("port"), app.get("ipaddr"), function() {
  console.log("Server up and running. Go to http://" + app.get("ipaddr") + ":" + app.get("port"));
});