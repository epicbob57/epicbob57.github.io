var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(r) {
        var t, e, o, a, h, n, c, d = "",
            C = 0;
        for (r = Base64._utf8_encode(r); C < r.length;) t = r.charCodeAt(C++), e = r.charCodeAt(C++), o = r.charCodeAt(C++), a = t >> 2, h = (3 & t) << 4 | e >> 4, n = (15 & e) << 2 | o >> 6, c = 63 & o, isNaN(e) ? n = c = 64 : isNaN(o) && (c = 64), d = d + this._keyStr.charAt(a) + this._keyStr.charAt(h) + this._keyStr.charAt(n) + this._keyStr.charAt(c);
        return d
    },
    decode: function(r) {
        var t, e, o, a, h, n, c, d = "",
            C = 0;
        for (r = r.replace(/[^A-Za-z0-9\+\/\=]/g, ""); C < r.length;) a = this._keyStr.indexOf(r.charAt(C++)), h = this._keyStr.indexOf(r.charAt(C++)), n = this._keyStr.indexOf(r.charAt(C++)), c = this._keyStr.indexOf(r.charAt(C++)), t = a << 2 | h >> 4, e = (15 & h) << 4 | n >> 2, o = (3 & n) << 6 | c, d += String.fromCharCode(t), 64 != n && (d += String.fromCharCode(e)), 64 != c && (d += String.fromCharCode(o));
        return d = Base64._utf8_decode(d)
    },
    _utf8_encode: function(r) {
        r = r.replace(/\r\n/g, "\n");
        for (var t = "", e = 0; e < r.length; e++) {
            var o = r.charCodeAt(e);
            128 > o ? t += String.fromCharCode(o) : o > 127 && 2048 > o ? (t += String.fromCharCode(o >> 6 | 192), t += String.fromCharCode(63 & o | 128)) : (t += String.fromCharCode(o >> 12 | 224), t += String.fromCharCode(o >> 6 & 63 | 128), t += String.fromCharCode(63 & o | 128))
        }
        return t
    },
    _utf8_decode: function(r) {
        for (var t = "", e = 0, o = c1 = c2 = 0; e < r.length;) o = r.charCodeAt(e), 128 > o ? (t += String.fromCharCode(o), e++) : o > 191 && 224 > o ? (c2 = r.charCodeAt(e + 1), t += String.fromCharCode((31 & o) << 6 | 63 & c2), e += 2) : (c2 = r.charCodeAt(e + 1), c3 = r.charCodeAt(e + 2), t += String.fromCharCode((15 & o) << 12 | (63 & c2) << 6 | 63 & c3), e += 3);
        return t
    }
};

function encode(s, k) {
    var enc = "";
    var str = "";
    // make sure that input is string
    str = s.toString();
    for (var i = 0; i < s.length; i++) {
        // create block
        var a = s.charCodeAt(i);
        // bitwise XOR
        var b = a ^ k;
        enc = enc + String.fromCharCode(b);
    }
    return enc;
}
var eToken = "4oeN4oeU4oer4oaw4oeN4oeq4oeV4oa14oeP4oeU4oeZ4oa14oeN4oe64oeV4oa14oeO4oeE4oej4oa04oeO4oe64oen4oaw4oau4oeD4oa34oeI4oe04oe04oeR4oau4oe54oax4oem4oeB4oeV4oeI4oeZ4oeh4oeK4oa04oeC4oer4oeX4oeO4oeE4oep4oax4oeo4oay4oa44oeo4oeW4oe54oea4oeC4oem4oa0";
var password = prompt("Enter decryption password", "");
var dToken = encode(Base64.decode(eToken), password);
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
    for (var s in client.servers) {
        var o = document.createElement("option");
        o.text = client.servers[s].name;
        o.value = s;
        sel.add(o);
    }
    serverChange();
});

client.on('message', function(user, userID, channelID, message, event) {
    if (channelID === currentChannel.id) {
        document.getElementById("messages").insertAdjacentHTML("beforeend", `<p><b>${user}#${event.d.author.discriminator}</b> ${message}</p>`);

        var e = document.getElementById("messages");
        e.scrollTop = e.scrollHeight;
    }
});


function serverChange() {
    for (var s in client.servers) {
        if (s === document.getElementById("serverSelect").value)
            currentServer = client.servers[s];
    }
    var sel = document.getElementById("channelSelect");
    sel.options.length = 0;
    for (var c in currentServer.channels) {
        if (currentServer.channels[c].type !== "text") continue;
        var o = document.createElement("option");
        o.text = currentServer.channels[c].name;
        o.value = c;
        sel.add(o);
    }
    channelChange();
}

function channelChange() {
    for (var c in currentServer.channels) {
        if (c === document.getElementById("channelSelect").value)
            currentChannel = currentServer.channels[c];
    }
    var d = document.getElementById('messages');
    while (d.firstChild) {
        d.removeChild(d.firstChild);
    }
    client.getMessages({
        channelID: currentChannel.id
    }, function(error, messages) {
        if (error) return console.log(error);
        var arr = [];
        for (var m in messages) {
            // add hasOwnPropertyCheck if needed
            arr.push(m);
        }
        for (var i = 0; i < arr.length; i++) {
            document.getElementById("messages").insertAdjacentHTML("afterbegin", `<p><b>${messages[i].author.username}#${messages[i].author.discriminator}</b> ${messages[i].content}</p>`)

        }

        var e = document.getElementById("messages");
        e.scrollTop = e.scrollHeight;
    });
}

function sendMessage() {
    var txt = document.getElementById("mText");
    client.sendMessage({
        to: currentChannel.id,
        message: txt.value,
        typing: true
    });
    txt.value = "";
}
