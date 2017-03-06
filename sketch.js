function Download(id) {
    downloadurl = acaboxserver + "https://box.acapela-box.com/AcaBox/getaudio.php?id=" + id + "&download=1";
}

function jquery_download() {
    $.fileDownload(downloadurl)
        .done(function() {
            hideDownload();
            OnAcaboxTextChange();
        })
        .fail(function() {
            hideDownload();
            alert("Problem downloading");
        });
    event.preventDefault();
    return false;
}

function SendToVaaS() {
    var text = document.getElementById("Text").value;
    var voice = document.getElementById("voiceChoice");
    var voiceid = document.getElementById("voiceChoice").value.replace(' ', '').replace('(', '').replace(')', '').toLowerCase() + "22k";
    var rate = parseInt(document.getElementById("rateSlider").value) + 180;
    var shaping = parseInt(document.getElementById("shapeSlider").value) + 100;
    var format = document.getElementById("formatChoice");


    text = "\\vct=" + shaping + "\\ \\spd=" + rate + "\\ " + text;
    text = encodeURIComponent(text);
    voice = encodeURIComponent(voice);

    var codecMP3 = "0";
    if (format === "MP3")
        codecMP3 = "1";
    $.ajax({
        processData: "true",
        async: true,
        type: "POST",
        url: 'https://acapela-box.com/AcaBox/index.php/dovaas.php',
        dataType: "json",
        data: "text=" + text + "&voice=" + voiceid + "&listen=false&format=" + format + "&codecMP3=" + codecMP3 + "&spd=" + rate + "&vct=" + shaping,
        success: function(data) {
            hideWaitPopup();
            response = data;
            if (!response.hasOwnProperty('error')) {
                Download(response.id);
                jquery_download();
            } else // Error
            {
                console.log(response.error);
            }
        },
        error: function(e) {
            var msg = "Error" + e.status + " " + e.statusText;
            console.log(msg);
        }
    });
}
