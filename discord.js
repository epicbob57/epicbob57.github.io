var eToken = "U2FsdGVkX18ztVc7KLja1pPtzcHKVD5+oYjf9LWfHdWpYswyUClnJDXgk6FGOKCXxaLSgD52b1dv62B4QSYU2nBeVzw3r4//RoDYGLjQX8c=";
var password = prompt("Enter decryption password","");
var dToken = CryptoJS.AES.decrypt(eToken, password).toString(CryptoJS.enc.Utf8);
console.log(dToken);

var client = new Discord.Client({
  autorun: true, 
  token: dToken
});

var currentServer;
var currentChannel;

client.on('ready', function() {
  console.log("Successfully connected: " + client.username + " - (" + client.id + ")");
  var sel = document.getElementById("serverSelect");
  sel.options.length = 0;
  for (var s in client.servers){
    var o = document.createElement("option");
    o.text = client.servers[s].name;
    o.value = s;
    sel.add(o);
  }
  serverChange();
});

/*client.on('message', function(user, userID, channelID, message, event) {
  console.log(event);
});*/


function serverChange() {
  for (var s in client.servers){
    if(s === document.getElementById("serverSelect").value)
      currentServer = client.servers[s];
  }
  var sel = document.getElementById("channelSelect");
  sel.options.length = 0;
  for (var c in currentServer.channels){
    if (currentServer.channels[c].type !== "text") continue;
    var o = document.createElement("option");
    o.text = currentServer.channels[c].name;
    o.value = c;
    sel.add(o);
  }
  channelChange();
}

function channelChange() {
  for (var c in currentServer.channels){
    if(c === document.getElementById("channelSelect").value)
      currentChannel = currentServer.channels[c];
  }
  client.getMessages({
    channel: currentChannel.id}, function(error, messageArr) {
    if (error) return console.log(error);
    console.log(messageArr);
    console.log("yay");
});
}
