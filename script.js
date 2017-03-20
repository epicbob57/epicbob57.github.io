var Discord = require('discord.io');
var client = new Discord.Client({
  autorun: true, 
  token: "";
});

client.on('ready', function() {
  console.log("Successfully connected: " + client.username + " - (" + client.id + ")");
  var sel = document.getElementByID("serverSelect");
  sel.options.length = 0;
  for (var s in client.servers){
    console.log(s.name);
    var o = document.createElement("option");
    o.text = s.name;
    sel.add(o);
  }
});

client.on('message', function(callback) { /* Event called when someone joins the server */
  console.log('message recieved');
 });

function serverChange() { 
  
