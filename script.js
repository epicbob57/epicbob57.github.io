var Discord = require('discord.io');
var bot = new Discord.Client({
  autorun: true, 
  token: "";
});

bot.on('ready', function() {
  console.log("Successfully connected: " + bot.username + " - (" + bot.id + ")");
});

bot.on('message', function(callback) { /* Event called when someone joins the server */
  console.log('message recieved');
 });
