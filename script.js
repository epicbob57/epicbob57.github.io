var eToken = "U2FsdGVkX18ztVc7KLja1pPtzcHKVD5+oYjf9LWfHdWpYswyUClnJDXgk6FGOKCXxaLSgD52b1dv62B4QSYU2nBeVzw3r4//RoDYGLjQX8c=";
var password = prompt("Enter decryption password","");

var client = new Discord.Client({
  autorun: true, 
  token: CryptoJS.AES.decrypt(eToken, password).toString(CryptoJS.enc.Utf8)
});

var currentServer;
var currentChannel;

client.on('ready', function() {
  console.log("Successfully connected: " + client.username + " - (" + client.id + ")");
  var sel = document.getElementById("serverSelect");
  sel.options.length = 0;
  for (var s in client.servers){
    console.log(s.name);
    var o = document.createElement("option");
    o.text = s.name;
    o.value = s.id;
    sel.add(o);
  }
});

client.on('message', function(callback) { /* Event called when someone joins the server */
  console.log('message recieved');
 });

function serverChange() {
  var sel = document.getElementById("channelSelect");
  sel.options.length = 0;
  for (var s in client.servers){
    console.log(s.name);
    var o = document.createElement("option");
    o.text = s.name;
    sel.add(o);
  }
}
